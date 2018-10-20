import React from 'react';
import {Text, Dimensions, StyleSheet, ImageBackground, Platform, ScrollView, Animated, Easing} from 'react-native';
import * as GraphQL from '../graphql';
import {API, graphqlOperation} from 'aws-amplify';
import firebase from 'react-native-firebase';
import { renderProgress } from './renderIf';
import Constants from '../Constants';

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            looking: false,
            connected: true,
            onlineUsers: [],
            requestId: null,
            notificationsAllowed: false,
            progress: false, 
        };
        this.ProgressBar = Platform.select({
            ios: () => ProgressViewIOS,
            android: () => ProgressBarAndroid
        });
        this.user = this.props.navigation.getParam("user", null);
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
        this.props.navigation.navigate('Random', {randomUser: connectedUser, conversationId: randomChat.conversationId, user: this.user});
    }

    setupNotificationListeners = async() => {
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            // Process your notification as required
            console.log(notification);
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
            displayNotification.ios.setBadge(notification.ios.badge);
            firebase.notifications().displayNotification(displayNotification);
        });
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            // Get the action triggered by the notification being opened
            const action = notificationOpen.action;
            console.log(action);
            // Get information about the notification that was opened
            const notification = notificationOpen.notification;
            console.log(notification);
            const randomChat = JSON.parse(notification.data.randomChat);
            const connectedUser = JSON.parse(notification.data.connectedUser);
            this.openChat(randomChat, connectedUser);
        });
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            // Get the action triggered by the notification being opened
            const action = notificationOpen.action;
            console.log(action);
            // Get information about the notification that was opened
            const notification = notificationOpen.notification;
            console.log(notification);
            if (!!random) {
                const randomChat = JSON.parse(notification.data.randomChat);
                this.openChat(randomChat);
            }
        }
    }

    startDiscover = () => {
        this.setState({text: 'Finding someone for you', progress: true})
        let {onlineUsers} = this.state;
        let user = this.props.navigation.getParam("user", null);
        console.log(this.state);
        // TODO: Make button available (greyed out until component updates) for user to initiate conversation
        if (onlineUsers && onlineUsers.length > 1) {
            let randUser = Math.floor(Math.random() * onlineUsers.length);
            console.log(randUser);
            if(onlineUsers[randUser].firebaseId === user.firebaseId) {
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
            debugger
            // TODO: Create conversationId and a new UserConversation
            let chatId = String(Math.floor(new Date().getTime()));
            let newChat = {
                conversationId: chatId, 
                author: user,
                recipient: connectedUser.firebaseId,
                messageId: new Date().getUTCMilliseconds().toString()
            };
            console.log(newChat);
            console.log('Initiating chat: ' + chatId);
            API.graphql(graphqlOperation(GraphQL.CreateDiscoverChat, {input: newChat}))
            .then(res => {
                console.log('Resolved chat: ' + JSON.stringify(res));
                // waiting for acceptance from another user for 5 seconds
                setTimeout(this.startDiscover, 5000);
                this.setState({username: connectedUser.username});
                API.graphql(graphqlOperation(GraphQL.SubscribeToDiscoverChats, {recipient: connectedUser.firebaseId}))
                .subscribe(res => {
                    console.log(res);
                    if (res.value.data.onCreateNucleusDiscoverChats.author.firebaseId !== this.user.firebaseId) {
                        console.log('request for chatting accepted by user');
                        this.props.navigation.navigate('Random', {randomUser: connectedUser, conversationId: chatId, user: this.user});  
                    }
                })
            })
            .catch(err => console.log(err));
            this.sendRequest(user, connectedUser, newChat);
        }
    }

    // API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, {filter: this.noFilter}))
    // .then(res => {

    acceptDiscover = () => {
        // creating redundant mutation for activation of subscription on other side
        delete this.state.requestChat.__typename;
        delete this.state.requestChat.author.__typename;
        console.log(this.state.requestChat);
        API.graphql(graphqlOperation(GraphQL.CreateDiscoverChat, {input: this.state.requestChat}))
        .then(res => {
            console.log(res);
            // chatting resolved, moving on to another screen
            let {author, conversationId} = this.state.requestChat;
            this.props.navigation.navigate('Random', {randomUser: author, conversationId: conversationId, user: this.user});
        })
        .catch(err => {
            console.log(err);
            let {author, conversationId} = this.state.requestChat;
            this.props.navigation.navigate('Random', {randomUser: author, conversationId: conversationId, user: this.user});
        });
    }

    cancelRequest = (chat) => {
        console.log('Sending mutation to delete conversation');
        API.graphql(graphqlOperation(GraphQL.DeleteDiscoverChat, {input: chat}))
        .then(res => {
            console.log(res);
        })
        .catch(err => console.log(err));
    }

    async componentDidMount() {
        // querying online users
        API.graphql(graphqlOperation(GraphQL.GetOnlineDiscoverUsers), {
            online: 1
        })
        .then(res => {
            let temp = res.data.getOnlineNucleusDiscoverUsers;
            this.setState({onlineUsers: temp});
        })
        .catch(err => console.log(err));
        let user = this.props.navigation.getParam("user", null);
        // subscribing to requested conversations
        this.chatSubscription = API.graphql(
            graphqlOperation(GraphQL.SubscribeToDiscoverChats, {recipient: user.firebaseId})
        ).subscribe({
            next: (res) => {
                console.log('Subscription for chat received: ' + String(res));
                const newChat = res.value.data.onCreateNucleusDiscoverChats;
                // notifies sender of request of conversation ignore after 5 seconds of subscription receipt
                setTimeout( (newChat) => this.cancelRequest, 5000);
                this.setState({requestId: newChat.conversationId, requestChat: newChat, progress: false});
            }
        });
        // subscribing to deleted conversations for removing accept button
        this.chatDeleteSubscription = API.graphql(
            graphqlOperation(GraphQL.SubscribeToChatDeletion, {conversationId: this.state.requestId})
        ).subscribe({
            next: (res) => {
                console.log('Chat deleted: ' + String(res));
                const deletedChat = res.value.data.onDeleteNucleusDiscoverChats;
                this.setState({requestId: null, requestChat: null});
            }
        });
        this.setupNotificationListeners();
    }   

    changeOnlineStatus = () => {
        if (this.user.online) {
            this.user.online = 0;
        } else {
            this.user.online = 1;
        }
        console.log(JSON.stringify(this.user));
        API.graphql(graphqlOperation(GraphQL.UpdateDiscoverUser, {input: this.user}))
        .then(res => {
            console.log(res);
            console.log(this.user.online)
            this.forceUpdate();
        })
        .catch(err => {
            console.log(err);
        });
    }
    
    render() {
        let {requestId, looking} = this.state;
        let text = 'Pull to talk!';
        // checking online status of user
        /*if (this.user.online) {
            text = text + 'offline';
        } else {
            text = text + 'online';
        }*/
        if (requestId !== null && !looking) {
            return (
                <ScrollView contentContainerStyle={styles.container} onScrollEndDrag={this.acceptDiscover}>
                        <Text style={styles.title}>{text}</Text>
                        <Text style={styles.instructions}>Someone got connected to you!</Text>
                </ScrollView>
            );
        } else {
            return (
                <ScrollView contentContainerStyle={styles.container} onScrollEndDrag={this.startDiscover}>
                        <Text style={styles.title}>{text}</Text>
                        <Text style={styles.instructions}>{this.state.username}</Text>
                        {renderProgress(this.ProgressBar, null)}
                </ScrollView>
            );
        }
    }

    componentWillUnmount() {
        this.notificationOpenedListener();
    }
}

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;
const BOTTOM_SHEET_HEIGHT = Dimensions.get('window').height/10;
console.log(DEVICE_HEIGHT);
console.log(BOTTOM_SHEET_HEIGHT);

const styles=StyleSheet.create({
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