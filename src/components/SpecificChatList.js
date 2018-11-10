import React, { Component } from 'react';
import { ActivityIndicator, ProgressBarAndroid, ProgressViewIOS, Dimensions, Platform, View, ScrollView, FlatList, StyleSheet, AsyncStorage, Image } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import Constants from '../Constants';
import AWS from 'aws-sdk';
import * as JsSearch from 'js-search';
import Search from './Search';
import { renderSearch, renderOnline, renderResults } from './renderIf';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import * as GraphQL from '../graphql';
import firebase from 'react-native-firebase';
import LoginScreen from './LoginScreen';

export default class SpecificChatList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            conversations: [],
            talkingTo: [],
            showingPeople: false,
            people: [],
            searchResults: [],
            searching: false,
        };
        itemCount = 0;
        AWS.config.update({
            dynamoDbCrc32: false,
            accessKeyId: Constants.accessKey,
            secretAccessKey: Constants.secretAccessKey,
            region: 'ap-south-1'
        });
        /*const dynamoDB = new AWS.DynamoDB();
        const table = {TableName: "Nucleus.DiscoverUsers"};
        dynamoDB.describeTable(table, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
                this.itemCount = data.ItemCount;
            }
        });*/
        this.search = React.createRef();
    }

    DEVICE_WIDTH = Dimensions.get('window').width;
    DEVICE_HEIGHT = Dimensions.get('window').height;

    showPeople = () => {
        this.setState({ showingPeople: true });
    }

    addChat = async (conversation) => {
        try {
            this.state.conversations.push(conversation);
            this.forceUpdate();
            await AsyncStorage.setItem('CHATS', this.state.conversations);
            console.log('Conversation saved');
        } catch (error) {
            console.log(error);
        }
    }

    static generateConversationId(s1, s2) {
        let s = '';
        const l1 = s1.length;
        const l2 = s2.length;
        let l = l1 < l2 ? l1 : l2;
        for (let i = 0; i < l; ++i) {
            let ch1 = s1.charAt(i);
            let ch2 = s2.charAt(i);
            s = s + (ch1 < ch2 ? ch1 : ch2);
            s = s + (ch1 < ch2 ? ch2 : ch1);
        }
        if (l < l1) {
            s = s + s1.substring(l + 1);
        } else if (l < l2) {
            s = s + s2.substring(l + 1);
        }
        console.log('ConversationID: ' + s);
        return s;
    }

    // item here is a user
    newChat(item) {
        if (!this.user) {
            this.user = this.state.user;
        }
        if (!!item) {
            let chat = null;
            let newChat = true;
            let { conversations, talkingTo } = this.state;
            if (!talkingTo.includes(item.firebaseId)) {
                talkingTo.push(item.firebaseId);
                AsyncStorage.setItem(Constants.TalkingTo, JSON.stringify(talkingTo))
                    .then(res => {
                        console.log('Saved userID in talkingTo');
                    })
                    .catch(err => {
                        console.log(err);
                    });
                let chatId = SpecificChatList.generateConversationId(this.user.firebaseId, item.firebaseId);
                // add chat to local storage
                chat = {
                    conversationId: chatId,
                    user1: this.user,
                    user2: item,
                }
                if (!conversations) {
                    // conversations is null, happens on Android
                    conversations = [];
                }
                conversations.push(chat);
                AsyncStorage.setItem(Constants.SpecificChatConversations, JSON.stringify(conversations))
                    .then(res => {
                        console.log('Saved successfully: ' + JSON.stringify(res));
                    })
                    .catch(err => {
                        console.log(err);
                    });
                this.setState({ conversations });
                // new chat, performing mutation

            } else {
                conversations = this.state.conversations;
                if (!conversations) {
                    conversations = [];
                }
                const idSearch = new JsSearch.Search('conversationId');
                idSearch.addIndex(['user2', 'firebaseId']);
                idSearch.addDocuments(conversations);
                chat = idSearch.search(item.firebaseId)[0];
                console.log(chat);
                if (!chat) {
                    // happens when user re-clicks on new chat in Search view
                    let chatId = SpecificChatList.generateConversationId(this.user.firebaseId, item.firebaseId);
                    chat = {
                        conversationId: chatId,
                        user1: this.user,
                        user2: item,
                    }
                }
                newChat = false;
            }
            this.props.navigation.navigate('SpecificTextScreen', { chat: chat, newChat: newChat });
        }
    }

    openNotificationChat = (item) => {
        console.log(item);
        const chat = {
            conversationId: item.conversationId,
            user1: this.user,
            user2: item.user1,
        }
        this.props.navigation.navigate('SpecificTextScreen', { chat: chat, newChat: false });
        // moves chat to top of screen
        const { conversations } = this.state;
        console.log('Conversations: ' + JSON.stringify(conversations));
        conversations.sort(function (x, y) { return x == item ? -1 : y == item ? 1 : 0; });
    }

    // item here is a conversation
    openChat = async (item) => {
        console.log('Item: ' + JSON.stringify(item));
        let chat = {
            conversationId: item.conversationId,
            user1: this.user,
            user2: item.user2,
        }
        // get conversations here, move selected conversation to top of FlatList
        const { conversations } = this.state;
        console.log('Conversations: ' + JSON.stringify(conversations));
        conversations.sort(function (x, y) { return x == item ? -1 : y == item ? 1 : 0; });
        // save newly sorted list
        console.log('Sorted conversations: ' + JSON.stringify(conversations));
        this.setState({ conversations: conversations });
        await AsyncStorage.setItem('CHATS', JSON.stringify(conversations));
        this.props.navigation.navigate('SpecificTextScreen', { chat: chat, newChat: false });
        this.retrieveChats();
        console.log('retrieved chats');
    }

    deleteAllChats = async () => {
        try {
            await AsyncStorage.removeItem('CHATS');
        } catch (error) {
            console.log(error);
        }
    }

    retrieveChats = async () => {
        this.setState({ conversations: JSON.parse(await (AsyncStorage.getItem(Constants.SpecificChatConversations))) });
    }

    chatKeyExtractor = (item, index) => item.user2.firebaseId;

    peopleKeyExtractor = (item, index) => item.firebaseId;

    async componentWillMount() {
        this.retrieveChats();
    }

    async componentDidMount() {
        this.user = this.props.navigation.getParam('user');
        this.setState({ user: this.user });
        this.noFilter = {
            firebaseId: { ne: JSON.parse(await AsyncStorage.getItem(Constants.UserObject)).firebaseId },
            geohash: { ne: 'random_user_geohash' },
        }
        // checking for notification permissions
        if (!this.user) {
            this.user = !!this.state.user ? this.state.user : JSON.parse(await AsyncStorage.getItem(Constants.UserObject));
        }
        let enabled = false;
        enabled = await firebase.messaging().hasPermission();
        firebase.messaging().hasPermission()
            .then(async (res) => {
                console.log(res);
                enabled = res;
                if (!enabled) {
                    try {
                        console.log('Awaiting Firebase request for permission');
                        await firebase.messaging().requestPermission();
                    } catch (error) {
                        console.log(error);
                        enabled = false;
                    }
                }
                if (enabled) {
                    this.fcmToken = firebase.messaging().getToken()
                        .then(async (res) => {
                            console.log('User message ' + res);
                            // storing token as user attribute
                            this.user.online = 1;
                            this.user.fcmToken = res;
                            API.graphql(graphqlOperation(GraphQL.UpdateDiscoverUser, { input: this.user }))
                                .then(async (updated) => {
                                    console.log(updated);
                                    // updated user
                                    await AsyncStorage.setItem(Constants.UserObject, JSON.stringify(this.user));
                                })
                                .catch(fcmErr => {
                                    console.log(fcmErr);
                                });
                            console.log('FCM token: ' + res);
                        })
                        .catch(err => {
                            console.log('FCM error: ' + err);
                            // handle error appropriately
                        });
                    // setting up notification listeners
                    this.notificationListener = firebase.notifications().onNotification(async (notification) => {
                        // Process your notification as required
                        console.log(notification);
                        const displayNotification = new firebase.notifications.Notification()
                            .setNotificationId(notification.notificationId)
                            .setTitle(notification.title)
                            .setBody(notification.body)
                            .setData({
                                chat: notification.data.chat,
                            });
                        if (Platform.OS == 'ios') {
                            displayNotification.ios.setBadge(notification.ios.badge);
                        } else {
                            // android
                            displayNotification.android.setChannelId('channelId');
                            displayNotification.android.setAutoCancel(true);
                        }
                        console.log(displayNotification);
                        if (notification._title !== 'Unknown') {
                            const chat = JSON.parse(displayNotification._data.chat);
                            if (chat.user1.firebaseId !== this.user.firebaseId) {
                                firebase.notifications().displayNotification(displayNotification);
                            }
                        }
                    });
                    this.notificationOpenedListener = firebase.notifications().onNotificationOpened(async (notificationOpen) => {
                        if (enabled) {
                            // Get the action triggered by the notification being opened
                            const action = notificationOpen.action;
                            console.log(action);
                            // Get information about the notification that was opened
                            const notification = notificationOpen.notification;
                            if (notification._title !== 'Unknown') {
                                console.log(notification);
                                const chat = JSON.parse(notification._data.chat);
                                if (!!chat) {
                                    const chat = JSON.parse(notification._data.chat);
                                    this.openNotificationChat(chat);
                                }
                            }
                        }
                    });
                    const notificationOpen = await firebase.notifications().getInitialNotification();
                    if (notificationOpen && enabled) {
                        // App was opened by a notification when closed
                        // Get the action triggered by the notification being opened
                        const action = notificationOpen.action;
                        console.log(action);
                        // Get information about the notification that was opened
                        const notification = notificationOpen.notification;
                        console.log(notification);
                        if (notification._title !== 'Unknown') {
                            const chat = JSON.parse(notification._data.chat);
                            if (!!chat && chat != 'null') {
                                const chat = JSON.parse(notification._data.chat);
                                this.openNotificationChat(chat);
                            }
                        }
                    }
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    componentWillUnmount() {
        this.notificationOpenedListener();
        this.notificationListener();
    }

    renderConversation = ({ item }) => {
        console.log(item);
        if (!this.user) {
            this.user = this.state.user;
        }
        if (item.user2.firebaseId != this.user.firebaseId) {
            return (
                <ListItem
                    onPress={this.openChat.bind(this, item)}
                    roundAvatar
                    avatar={{ uri: item.user2.profilePic }}
                    title={item.user2.username}
                    titleStyle={{ fontWeight: 'bold' }}
                />);
        } else {
            return null;
        }
    };

    renderUser = ({ item }) => {
        if (!this.user) {
            this.user = this.state.user;
        }
        return (
            <ListItem
                onPress={this.newChat.bind(this, item)}
                roundAvatar
                avatar={{ uri: item.profilePic }}
                title={item.username}
                titleStyle={{ fontWeight: 'bold' }}
            />
        );
    };

    searchConversations = ({ text }) => {
        // text contains user names
        if (text == '') {
            // empty string, reset search
            this.setState({ searching: false });
            return;
        }
        const chatSearch = new JsSearch.Search('firebaseId');
        chatSearch.addIndex('username');
        chatSearch.addDocuments(this.state.people);
        let searchResults = chatSearch.search(text);
        console.log(searchResults);
        this.setState({ searchResults: searchResults, searching: true })
    }

    getStoredUsers() {
        AsyncStorage.getItem(Constants.UserList)
            .then(res => {
                console.log('Stored users ' + JSON.stringify(res));
                if (res != null) {
                    this.setState({ people: JSON.parse(res) });
                } else {
                    this.fetchUsers();
                    this.getStoredUsers();
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    fetchUsers() {
        API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, { filter: this.noFilter }))
            .then(res => {
                // removing signed-in user from UserList
                const users = res.data.listNucleusDiscoverUsers.items;
                AsyncStorage.setItem(Constants.UserList, JSON.stringify(users))
                    .then(asyncStorageResult => {
                        console.log(asyncStorageResult);
                    })
                    .catch(asyncStorageError => {
                        console.log(asyncStorageError);
                    });
                if (res.data.listNucleusDiscoverUsers.nextToken != null) {
                    // start background operation to fetch more data
                    this.getPaginatedUsers(res.data.listNucleusDiscoverUsers.nextToken);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    getPaginatedUsers = (nextToken) => {
        API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, { filter: this.noFilter, nextToken: nextToken }))
            .then(res => {
                const users = res.data.listNucleusDiscoverUsers.items;
                AsyncStorage.getItem(Constants.UserList)
                    .then(res => {
                        savedUsers = JSON.parse(res);
                        savedUsers.push(users);
                        AsyncStorage.setItem(Constants.UserList, JSON.stringify(users))
                            .then(asyncStorageResult => {
                                console.log(asyncStorageResult);
                            })
                            .catch(asyncStorageError => {
                                console.log(asyncStorageError);
                            });
                        if (res.data.listNucleusDiscoverUsers.nextToken != null) {
                            // start background operation to fetch more data
                            this.getPaginatedUsers(res.data.listNucleusDiscoverUsers.nextToken);
                        }
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => {
                console.log(err);
            });
    }

    async getUser() {
        let user = JSON.parse(await AsyncStorage.getItem(Constants.UserObject));
        this.setState({ user: user });
        this.user = this.state.user;
    }

    render() {
        console.log(this.state);
        if (!this.state.user) {
            this.getUser();
            return <View style={{ alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        }
        if (!this.state.people || this.state.people.length == 0) {
            // no users in memory
            // this.fetchUsers();
            this.getStoredUsers();
            // show image designating no users
            return (
                <View style={styles.logoContainer}>
                    <ActivityIndicator />
                </View>
            )
        } else {
            if (!this.state.conversations || this.state.conversations.length == 0) {
                console.log('no conversations in memory, show user list with search bar');
                return (
                    <View style={styles.layout}>
                        <ScrollView scrollEnabled={false} style={{ height: 20 }}>
                            <Search onChange={(text) => this.searchConversations({ text })} placeholder={'Find Nucleus users'} />
                        </ScrollView>
                        <List containerStyle={{ borderColor: Constants.primaryColor }}>
                            {renderSearch(
                                (this.state.searching),
                                <View style={{ flex: 1 }} >
                                    {renderResults((this.state.searchResults.length > 0),
                                        <FlatList
                                            data={this.state.searchResults}
                                            keyExtractor={(data) => this.peopleKeyExtractor(data)}
                                            renderItem={this.renderUser} />,
                                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                            <Image style={{ width: this.DEVICE_WIDTH / 2, height: this.DEVICE_HEIGHT / 2 }} source={require('../../assets/not_found.png')} />
                                        </View>
                                    )}
                                </View>,
                                <FlatList
                                    data={this.state.people}
                                    keyExtractor={(data) => this.peopleKeyExtractor(data)}
                                    renderItem={this.renderUser} />
                            )}
                        </List>
                    </View>
                );
            } else if (!!this.state.conversations && this.state.conversations.length > 0) {
                // conversations in memory, show that List with Search bar
                return (
                    <View style={styles.layout}>
                        <View style={{ height: this.DEVICE_HEIGHT / 10 }}>
                            <Search onChange={(text) => this.searchConversations({ text })} placeholder={'Find Nucleus users'} />
                        </View>
                        <List containerStyle={{ borderColor: Constants.primaryColor }}>
                            {renderSearch(
                                (this.state.searching),
                                <View>
                                    {renderResults((this.state.searchResults.length > 0),
                                        <FlatList
                                            data={this.state.searchResults}
                                            keyExtractor={(data) => this.peopleKeyExtractor(data)}
                                            renderItem={this.renderUser} />,
                                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                            <Image style={{ width: this.DEVICE_WIDTH / 2, height: this.DEVICE_HEIGHT / 2 }} source={require('../../assets/not_found.png')} />
                                        </View>
                                    )}
                                </View>,
                                <FlatList
                                    data={this.state.conversations}
                                    keyExtractor={(data) => this.chatKeyExtractor(data)}
                                    renderItem={this.renderConversation} />
                            )}
                        </List>
                    </View>
                );
            }
        }
    }
}

const styles = StyleSheet.create({
    layout: {
        backgroundColor: 'white',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
    },
    initialLayout: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        backgroundColor: 'white',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoContainer: {
        backgroundColor: 'white',
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center'
    },
    logo: {
        height: 200,
        width: 200
    },
    title: {
        color: 'black',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center'
    },
    chatContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        paddingHorizontal: 12,
    },
    chatName: {
        fontWeight: 'bold',
        flex: 0.7,
        color: 'black',
    },
});