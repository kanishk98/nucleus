import React from 'react';
import {Text, View, StyleSheet, Button} from 'react-native';
import * as GraphQL from '../graphql';
import {API, graphqlOperation} from 'aws-amplify';
import firebase from 'react-native-firebase';

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            text: "Tap anywhere to get started",
            connected: true,
            onlineUsers: [],
            requestId: null,
            notificationsAllowed: false,
        };
    }

    startDiscover = () => {
        let {onlineUsers} = this.state;
        let user = this.props.navigation.getParam("signedInUser", null);
        console.log(this.state);
        // TODO: Make button available (greyed out until component updates) for user to initiate conversation
        if (onlineUsers && onlineUsers.length > 1) {
            randUser = Math.floor(Math.random() * onlineUsers.length);
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
            // TODO: Create conversationId and a new UserConversation
            let chatId = user.firebaseId + connectedUser.firebaseId + String(Math.floor(new Date().getTime()/1000));
            console.log('Initiating chat: ' + chatId);
            this.props.navigation.navigate('Discover', {randomUser: connectedUser, conversationId: chatId});
        }
    }

    cancelRequest = (chat) => {
        console.log('Sending mutation to delete conversation');
        API.graphql(graphqlOperation(GraphQL.DeleteDiscoverChat), {input: chat})
        .then(res => {
            console.log(res);
        })
        .catch(err => console.log(err));
    }

    async componentDidMount() {
        // checking for notification permissions
        const enabled = await firebase.messaging().hasPermission();
        if(!enabled) {
            try {
                await firebase.messaging().requestPermission();
                // User has authorised
                this.setState({notificationsAllowed: true});
                this.fcmToken = firebase.messaging().getToken()
                .then(res => {
                    // storing token as user attribute
                })
                .catch(err => {
                    console.log(err);
                    // handle error appropriately
                })
            } catch (error) {
                // User has rejected permissions
            }
        }
        // querying online users
        API.graphql(graphqlOperation(GraphQL.GetOnlineDiscoverUsers), {
            online: 1
        })
        .then(res => {
            let temp = res.data.getOnlineNucleusDiscoverUsers;
            this.setState({onlineUsers: temp});
        })
        .catch(err => console.log(err));
        let user = this.props.navigation.getParam("signedInUser", null);
        // subscribing to requested conversations
        this.chatSubscription = API.graphql(
            graphqlOperation(GraphQL.SubscribeToDiscoverChats, {recipient: user.firebaseId})
        ).subscribe({
            next: (res) => {
                console.log('Subscription for chat received: ' + String(res));
                const newChat = res.value.data.onCreateNucleusDiscoverChats;
                // notifies sender of request of conversation ignore after 5 seconds of subscription receipt
                setTimeout(this.cancelRequest(newChat), 5000);
                this.setState({requestId: newChat.conversationId});
            }
        });
        // subscribing to deleted conversations for removing accept button
        this.chatDeleteSubscription = API.graphql(
            graphqlOperation(GraphQL.SubscribeToChatDeletion, {conversationId: this.state.requestId})
        ).subscribe({
            next: (res) => {
                console.log('Chat deleted: ' + String(res));
                const deletedChat = res.value.data.onDeleteNucleusDiscoverChats;
                this.setState({requestId: null});
            }
        });
        if (this.state.notificationsAllowed) {
            this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
                console.log(notificationOpen);
            })
            firebase.notifications().getInitialNotification()
            .then((notificationOpen) => {
                if (notificationOpen) {
                    // app was opened from killed state by notification
                    console.log(notificationOpen);
                }
            })
        }
    }   
    
    render() {
        let {text, onlineUsers, requestId} = this.state;
        if (requestId !== null) {
            return (
                <View style={styles.container}>
                    <Text style={styles.instructions}>{onlineUsers.length} users online</Text>
                    <Button style={styles.connectButton} onPress={this.startDiscover} title={"Get started"}/>
                    <Text style={styles.instructions}>Someone got connected to you!</Text>
                    <Button style={styles.connectButton} onPress={this.startDiscover} title={"Accept request"}/>
                </View>
            );
        } else {
            return (
                <View style={styles.container}>
                    <Text style={styles.instructions}>{onlineUsers.length} users online</Text>
                    <Button style={styles.connectButton} onPress={this.startDiscover} title={"Get started"}/>
                </View>
            );
        }
    }

    componentWillUnmount() {
        this.notificationOpenedListener();
    }
}

const styles=StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#003366',
    },
    instructions: {
        color: 'white',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center'
    },
    connectButton: {
        backgroundColor: 'white',
        fontSize: 18,
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: 10,
    }
});