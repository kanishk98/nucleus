import React from 'react';
import { View, Text, Dimensions, StyleSheet, AsyncStorage, Platform, ScrollView, Animated, Easing } from 'react-native';
import * as GraphQL from '../graphql';
import { API, graphqlOperation } from 'aws-amplify';
import firebase from 'react-native-firebase';
import { renderProgress } from './renderIf';
import Constants from '../Constants';
import { GiftedChat } from 'react-native-gifted-chat';
import { Button } from 'react-native-elements';

export default class PreDiscover extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: 'Tap to talk',
            onlineUsers: [],
            looking: false,
            connected: true,
            requestId: null,
            notificationsAllowed: false,
            progress: false,
            discoverStopped: true,
            navigating: false,
        };
        this.ProgressBar = Platform.select({
            ios: () => ProgressViewIOS,
            android: () => ProgressBarAndroid
        });
        this.componentUnmounted = false;
        this.ignoreFlagAndStartDiscover = this.ignoreFlagAndStartDiscover.bind(this);
        this.startDiscover = this.startDiscover.bind(this);
        this.acceptDiscover = this.acceptDiscover.bind(this);
        this.stopDiscover = this.stopDiscover.bind(this);
    }

    sendRequest = (user, connectedUser, newChat) => {
        fetch(Constants.discoverNotificationsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'key': Constants.googleAuthKey,
            },
            body: JSON.stringify({
                content: 'Someone new would like to talk to you.',
                author: 'Discover',
                token: connectedUser.fcmToken,
                chat: newChat,
                connectedUser: user,
                request: true,
            })
        })
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }

    openChat = (randomChat, connectedUser) => {
        this.setState({ discoverStopped: true });
        this.props.navigation.navigate('Random', { randomUser: connectedUser, conversationId: randomChat.conversationId, user: this.user, fcmToken: connectedUser.fcmToken });
    }

    setupNotificationListeners = async () => {
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            // Process your notification as required
            console.log(notification);
            if (notification._title === 'Unknown') {
                const displayNotification = new firebase.notifications.Notification()
                    .setNotificationId(notification.notificationId)
                    .setTitle(notification.title)
                    .setBody(notification.body)
                    .setData({
                        random: notification.data.random,
                        randomChat: notification.data.chat,
                        request: notification.data.request,
                        connectedUser: notification.data.connectedUser,
                    });
                if (Platform.OS == 'ios') {
                    displayNotification.ios.setBadge(notification.ios.badge);
                } else {
                    // android
                    displayNotification.android.setChannelId('channelId');
                }
                firebase.notifications().displayNotification(displayNotification);
            }
        });
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            // Get the action triggered by the notification being opened
            const action = notificationOpen.action;
            console.log(action);
            // Get information about the notification that was opened
            const notification = notificationOpen.notification;
            console.log(notification);
            if (notification._title === 'Unknown') {
                const randomChat = JSON.parse(notification._data.randomChat);
                const connectedUser = JSON.parse(notification._data.connectedUser);
                this.openChat(randomChat, connectedUser);
            }
        });
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            console.log(notificationOpen);
            // Get the action triggered by the notification being opened
            const action = notificationOpen.action;
            console.log(action);
            // Get information about the notification that was opened
            const notification = notificationOpen.notification;
            console.log(notification);
            if (notification._title === 'Unknown') {
                if (!!random) {
                    const randomChat = JSON.parse(notification._data.randomChat);
                    this.openChat(randomChat);
                }
            }
        }
    }

    stopDiscover() {
        console.log('stopping discover');
        let temp = this.user;
        temp.online = 0;
        API.graphql(graphqlOperation(GraphQL.UpdateDiscoverUser, { input: temp }))
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.setState({ discoverStopped: true });
        let stoppedMessage = {
            _id: new Date().getTime(),
            text: 'No longer looking for people to chat with.',
            createdAt: new Date(),
            user: {
                _id: this.user.firebaseId,
                name: this.user.username,
                avatar: this.user.profilePic,
            },
        };
        this.setState(previousState => {
            console.log(previousState);
            return {
                messages: GiftedChat.append(previousState.messages, stoppedMessage)
            };
        });
    }

    ignoreFlagAndStartDiscover() {
        if (this.state.navigating) {
            this.setState({ navigating: false });
        }
        let temp = this.user;
        if (temp.online === 0) {
            // mark user as online
            temp.online = 1;
            API.graphql(graphqlOperation(GraphQL.UpdateDiscoverUser, { input: temp }))
                .then(res => {
                    console.log(res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
        this.setState({ discoverStopped: false });
        this.forced = true;
        this.startDiscover();
    }

    getOnlineUsers = (nextToken) => {
        let onlineUsers = this.state.onlineUsers;
        let receivedToken = null;
        let options = null;
        if (!nextToken) {
            options = {
                filter: {
                    online: {
                        eq: 1
                    }
                },
                limit: 20,
            };
        } else {
            options = {
                filter: {
                    online: {
                        eq: 1
                    }
                },
                limit: 20,
                nextToken: nextToken,
            };
        }
        API.graphql(graphqlOperation(GraphQL.ListOnlineDiscoverUsers), options)
            .then(res => {
                console.log(res);
                onlineUsers.push(res.data.listOnlineUsers.items);
                if (onlineUsers.includes(this.user)) {
                    onlineUsers.splice(onlineUsers.indexOf(this.user), 1);
                }
                receivedToken = res.data.nextToken;
                this.setState({ onlineUsers: onlineUsers, nextToken: receivedToken });
            })
            .catch(err => {
                console.log(err);
                let errorMessage = {
                    _id: new Date().getTime(),
                    text: 'You may have issues connecting. Check your network connection.',
                    createdAt: new Date(),
                    user: {
                        _id: this.user.firebaseId,
                        name: this.user.username,
                        avatar: this.user.profilePic,
                    },
                };
                this.setState(previousState => {
                    console.log(previousState);
                    return {
                        messages: GiftedChat.append(previousState.messages, errorMessage)
                    };
                });
            });
    }

    async startDiscover() {
        console.log('starting discover');
        if (!this.state.discoverStopped || this.forced) {
            this.forced = false;
            let message = {
                _id: new Date().getTime(),
                text: 'Finding you a match...',
                createdAt: new Date(),
                user: {
                    _id: this.user.firebaseId,
                    name: this.user.username,
                    avatar: this.user.profilePic,
                },
            };
            this.setState(previousState => {
                console.log(previousState);
                return {
                    messages: GiftedChat.append(previousState.messages, message)
                };
            });
            let onlineUsers = this.state.onlineUsers;
            // includes people who have just come online
            let nextToken = null;
            let options = null;
            if (!this.state.nextToken) {
                options = {
                    filter: {
                        online: {
                            eq: 1
                        }
                    },
                    limit: 30,
                };
            } else {
                options = {
                    filter: {
                        online: {
                            eq: 1
                        }
                    },
                    limit: 30,
                    nextToken: this.state.nextToken,
                };
            }
            // fetching additional users
            console.log(options);
            API.graphql(graphqlOperation(GraphQL.ListOnlineDiscoverUsers, options))
                .then(res => {
                    console.log(res);
                    console.log(onlineUsers);
                    let temp = res.data.listOnlineUsers.items;
                    receivedToken = res.data.nextToken;
                    if (!onlineUsers) {
                        onlineUsers = [];
                    }
                    onlineUsers.push(temp);
                    if (onlineUsers.includes(this.user)) {
                        onlineUsers.splice(onlineUsers.indexOf(this.user), 1);
                    }
                    this.setState({ onlineUsers: onlineUsers, nextToken: receivedToken });
                    nextToken = receivedToken;
                    if (!onlineUsers || onlineUsers.length === 0) {
                        console.log('no online users found');
                        if (!!nextToken) {
                            this.getOnlineUsers(nextToken);
                        } else if (this.state.nextToken) {
                            this.getOnlineUsers(this.state.nextToken);
                        }
                    }
                    let user = this.user;
                    console.log(this.state);
                    let { onlineUsers } = this.state;
                    console.log(!!onlineUsers);
                    console.log(onlineUsers[0].length);
                    if (!!onlineUsers && onlineUsers[0].length > 1) {
                        onlineUsers = onlineUsers[0];
                        let randUser = Math.floor(Math.random() * onlineUsers.length);
                        console.log(randUser);
                        if (onlineUsers[randUser].firebaseId == user.firebaseId) {
                            randUser = randUser + 1;
                            try {
                                if (onlineUsers[randUser] == null) {
                                    console.log("Undefined user, switching back");
                                    randUser = randUser - 2;
                                }
                            } catch (error) {
                                console.log(error);
                                randUser = randUser - 2;
                            }
                        }
                        console.log(onlineUsers[randUser]);
                        let connectedUser = onlineUsers[randUser];
                        console.log('Connected user: ' + JSON.stringify(connectedUser));
                        // TODO: Create conversationId and a new UserConversation
                        let chatId = String(Math.floor(new Date().getTime()));
                        let newChat = {
                            conversationId: chatId,
                            author: user,
                            recipient: connectedUser.firebaseId,
                            messageId: [new Date().getUTCMilliseconds().toString()]
                        };
                        console.log(newChat);
                        console.log('Initiating chat: ' + chatId);
                        API.graphql(graphqlOperation(GraphQL.CreateDiscoverChat, { input: newChat }))
                            .then(res => {
                                console.log('Resolved chat: ' + JSON.stringify(res));
                                // waiting for acceptance from another user for 5 seconds
                                setTimeout(this.startDiscover, 10000);
                                const initials = this.getInitials(connectedUser.username);
                                message = {
                                    _id: new Date().getTime(),
                                    text: 'Waiting for ' + initials + ' to accept request',
                                    createdAt: new Date(),
                                    user: {
                                        _id: this.user.firebaseId,
                                        name: this.user.username,
                                        avatar: this.user.profilePic,
                                    },
                                };
                                this.setState(previousState => {
                                    console.log(previousState);
                                    let messages = previousState.messages;
                                    if (previousState.messages.length > 2) {
                                        messages.splice(messages.length - 3, 2);
                                    }
                                    return {
                                        messages: GiftedChat.append(messages, message)
                                    };
                                });
                                API.graphql(graphqlOperation(GraphQL.SubscribeToUpdatedChats, { conversationId: chatId }))
                                    .subscribe(res => {
                                        console.log(res);
                                        console.log(this.user.firebaseId);
                                        if (!res.value.data.deleteNucleusDiscoverChats) {
                                            console.log('request for chatting accepted by user');
                                            clearTimeout(this.startDiscover);
                                            this.setState({ discoverStopped: true });
                                            this.props.navigation.navigate('Random', { randomUser: connectedUser, conversationId: chatId, user: this.user, fcmToken: connectedUser.fcmToken });
                                        }
                                    })
                            })
                            .catch(err => {
                                console.log(err);
                                let errorMessage = {
                                    _id: new Date().getTime(),
                                    text: "Student data over? We can't connect you.",
                                    createdAt: new Date(),
                                    user: {
                                        _id: this.user.firebaseId,
                                        name: this.user.username,
                                        avatar: this.user.profilePic,
                                    },
                                };
                                this.setState(previousState => {
                                    console.log(previousState);
                                    return {
                                        messages: GiftedChat.append(previousState.messages, errorMessage)
                                    };
                                });
                            });
                        // this.sendRequest(user, connectedUser, newChat);
                    }
                })
                .catch(err => {
                    console.log(err);
                    let errorMessage = {
                        _id: new Date().getTime(),
                        text: 'You may have issues connecting. Check your network connection.',
                        createdAt: new Date(),
                        user: {
                            _id: this.user.firebaseId,
                            name: this.user.username,
                            avatar: this.user.profilePic,
                        },
                    };
                    this.setState(previousState => {
                        console.log(previousState);
                        return {
                            messages: GiftedChat.append(previousState.messages, errorMessage)
                        };
                    });
                });
        }
    }

    getInitials = (name) => {
        splits = name.split(' ');
        let r = '';
        for (let s in splits) {
            r = r + splits[s].charAt(0);
        }
        return r;
    }

    // API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, {filter: this.noFilter}))
    // .then(res => {

    acceptDiscover = () => {
        // creating redundant mutation for activation of subscription on other side
        delete this.state.requestChat.__typename;
        delete this.state.requestChat.author.__typename;
        console.log(this.state.requestChat);
        let chat = {
            conversationId: this.state.requestChat.conversationId,
            recipient: this.state.requestChat.recipient,
            author: this.state.requestChat.author,
            messageId: this.state.requestId.messageId
        }
        console.log(chat);
        API.graphql(graphqlOperation(GraphQL.UpdateDiscoverChat, { input: chat }))
            .then(res => {
                console.log(res);
                // chatting resolved, moving on to another screen
                let { author, conversationId } = this.state.requestChat;
                let messages = this.state.messages;
                messages.splice(-1, 1);
                this.setState(previousState => {
                    return {
                        messages: messages,
                    }
                })
                this.setState({ discoverStopped: true, requestId: null, navigating: true });
                this.props.navigation.navigate('Random', { randomUser: author, conversationId: conversationId, user: this.user, fcmToken: this.state });
            })
            .catch(err => {
                console.log(err);
            });
    }

    cancelRequest = (chat) => {
        console.log('Sending mutation to delete conversation');
        API.graphql(graphqlOperation(GraphQL.DeleteDiscoverChat, { input: chat }))
            .then(res => {
                console.log(res);
            })
            .catch(err => console.log(err));
    }

    async componentDidMount() {
        this.user = JSON.parse(await AsyncStorage.getItem(Constants.UserObject));
        console.log(this.user);
        // querying online users
        let user = this.user;
        // subscribing to requested conversations
        this.chatSubscription = API.graphql(
            graphqlOperation(GraphQL.SubscribeToDiscoverChats, { recipient: user.firebaseId })
        ).subscribe({
            next: (res) => {
                console.log('Subscription for chat received: ' + JSON.stringify(res));
                const newChat = res.value.data.onCreateNucleusDiscoverChats;
                console.log(newChat);
                if (newChat.author.firebaseId != newChat.recipient) {
                    // notifies sender of request of conversation ignore after 5 seconds of subscription receipt
                    if (!this.componentUnmounted) {
                        setTimeout((newChat) => this.cancelRequest, 10000);
                        let message = {
                            _id: new Date().getTime(),
                            text: 'Someone got connected to you! Long-press this text to accept their request.',
                            createdAt: new Date(),
                            user: {}
                        };
                        this.setState(previousState => {
                            console.log(previousState);
                            return {
                                messages: GiftedChat.append(previousState.messages, message)
                            };
                        });
                        this.setState({ requestId: newChat.conversationId, requestChat: newChat, progress: false });
                    }
                }
            }
        });
        // subscribing to deleted conversations for removing accept button
        this.chatDeleteSubscription = API.graphql(
            graphqlOperation(GraphQL.SubscribeToChatDeletion, { conversationId: this.state.requestId })
        ).subscribe({
            next: (res) => {
                console.log('Chat deleted: ' + String(res));
                const deletedChat = res.value.data.onDeleteNucleusDiscoverChats;
                this.setState({ requestId: null, requestChat: null });
            }
        });
        this.setupNotificationListeners();
        let message = {
            _id: new Date().getTime(),
            text: 'Long-press this message to discover new people!',
            createdAt: new Date(),
            user: {},
        };
        this.setState(previousState => {
            console.log(previousState);
            return {
                messages: GiftedChat.append(previousState.messages, message)
            };
        });
    }

    changeOnlineStatus = () => {
        if (this.user.online) {
            this.user.online = 0;
        } else {
            this.user.online = 1;
        }
        console.log(JSON.stringify(this.user));
        API.graphql(graphqlOperation(GraphQL.UpdateDiscoverUser, { input: this.user }))
            .then(res => {
                console.log(res);
                console.log(this.user.online)
                this.forceUpdate();
            })
            .catch(err => {
                console.log(err);
            });
    }

    _renderInputToolbar = () => {
        if (!this.state.discoverStopped) {
            return (
                <View style={{ width: DEVICE_WIDTH, backgroundColor: "#b2b2b2" }}>
                    <Button
                        onPress={this.stopDiscover}
                        borderRadius={10}
                        buttonStyle={{ marginBottom: 20 }}
                        raised={false}
                        backgroundColor={'#b2b2b2'}
                        title='Stop Discovering people'
                    />
                </View>)
        } else {
            return (
                <View style={{ width: DEVICE_WIDTH, backgroundColor: Constants.primaryColor }}>
                    <Button
                        onPress={this.ignoreFlagAndStartDiscover}
                        raised={false}
                        buttonStyle={{ marginBottom: 20 }}
                        backgroundColor={Constants.primaryColor}
                        title='Start Discovering people'
                    />
                </View>
            );
        }
    }

    render() {
        console.log(this.state);
        let { requestId, looking, navigating } = this.state;
        let message = {
            _id: new Date().getTime(),
            text: 'Long-press this bubble to discover new people!',
            createdAt: new Date(),
            user: {},
        };
        if (navigating) {
            //coming back to Chat after accepting Discover
            return (
                <GiftedChat
                    messages={[message]}
                    renderInputToolbar={this._renderInputToolbar}
                    onLongPress={this.ignoreFlagAndStartDiscover}
                />
            );
        } else if (requestId !== null && !looking) {
            return (
                <GiftedChat
                    messages={this.state.messages}
                    renderInputToolbar={this._renderInputToolbar}
                    onLongPress={this.acceptDiscover}
                />
            );
        }
        return (
            <GiftedChat
                messages={this.state.messages}
                renderInputToolbar={this._renderInputToolbar}
                onLongPress={this.ignoreFlagAndStartDiscover}
            />
        );
    }

    componentWillUnmount() {
        this.notificationOpenedListener();
    }
}

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;
const BOTTOM_SHEET_HEIGHT = Dimensions.get('window').height / 10;
console.log(DEVICE_HEIGHT);
console.log(BOTTOM_SHEET_HEIGHT);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT,
    },
    bottomSheet: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8C9EFF',
        width: DEVICE_WIDTH,
        height: BOTTOM_SHEET_HEIGHT,
    },
    instructions: {
        color: '#8C9EFF',
        marginBottom: 16,
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        color: '#1a237e',
        marginBottom: 16,
        fontSize: 25,
        fontWeight: 'bold',
        justifyContent: 'center'
    },
    connectButton: {
        backgroundColor: '#1a237e',
        fontSize: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    }
});