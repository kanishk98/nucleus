import React from 'react';
import { Message } from './Message';
import * as GraphQL from '../graphql';
import { Dimensions, StyleSheet} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { connectClient } from '../../App';
import { GiftedChat } from 'react-native-gifted-chat';
import Constants from '../Constants';

export default class SpecificTextScreen extends React.Component {

    static noFilter = {
        conversationId: {ne: 'null'}
    }

    static convertUser(passedUser) {
        let user = {
            _id: null,
            avatar: null,
            name: null,
        };
        user._id = passedUser.firebaseId;
        user.avatar = passedUser.profilePic;
        user.name = passedUser.username;
        return user;
    }

    static convertMessage(message) {
        let m = {};
        m._id = message.messageId;
        m.text = message.content;
        m.createdAt = new Date(message.timestamp);
        m.user = SpecificTextScreen.convertUser(message.author);
        m.image = message.image;
        return m;
    }
    
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        }
        this.chat = this.props.navigation.getParam('chat');
        this.recipient = SpecificTextScreen.convertUser(this.chat.user2);
        this.user = this.chat.user1;
        this.subscribeToConnectMessages();
    }
    
    fetchMoreMessages = () => {
        connectClient.query({
            query: GraphQL.GetConnectMessages, 
            options: {
                variables: {filter: SpecificTextScreen.noFilter},
                fetchPolicy: 'cache-and-network',
            }
        })
        .then(res => {
            console.log(res);
            let m = res.data.listNucleusConnectMessages.items;
            let messages = [];
            for (let message in m) {
                messages.push(SpecificTextScreen.convertMessage(message));
            }
            this.setState({messages: messages});
            if (res.data.listNucleusConnectMessages.nextToken != null) {
                // start background operation to fetch more data
                // TODO: is this really needed or should we just fetch when 
                // user scrolls upwards?
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    onSendHandler = ({message}) => {
        const newMessage = {
            conversationId: this.chat.conversationId,
            author: this.chat.user1,
            recipient: this.chat.user2,
            content: message[0].text,
            messageId: String(Math.floor(new Date().getTime()/1000)),
            timestamp: new Date().toDateString(),
        }
        console.log(newMessage);
        // mutate Dynamo table
        API.graphql(graphqlOperation(GraphQL.CreateConnectMessage, {input: newMessage}))
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
        this.setState(previousState => {
            console.log(previousState);
            return {
                messages: GiftedChat.append(previousState.messages, message)
            };
        });
        // send notification to other user
        fetch(Constants.notificationsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'key': Constants.googleAuthKey,
            },
            body: JSON.stringify({
                content: message[0].text,
                author: this.chat.user1.username,
                token: this.chat.user2.fcmToken,
            })
        })
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }

    renderItem = ({item}) => (
        <Message id={item.messageId} sent={item.sender} />
    )
    
    renderReceivedText (message) {
        this.setState(previousState => {
            console.log(previousState);
            return {
                messages: GiftedChat.append(previousState.messages, message)
            };
        });
    }

    subscribeToConnectMessages() {
        console.log('Subscription function: ' + this.chat.conversationId);
        API.graphql(graphqlOperation(GraphQL.SubscribeToConnectMessages, {conversationId: this.chat.conversationId}))
        .subscribe({
            next: (res) => {
              console.log('Subscription received: ' + JSON.stringify(res));
              const newMessage = SpecificTextScreen.convertMessage(res.value.data.onCreateNucleusConnectTexts);
              if (newMessage.user._id !== this.chat.user1.firebaseId) {
                let tempArray = [];
                console.log('Shit.');
                tempArray.push(newMessage);
                this.renderReceivedText(newMessage);
              }
            }
        }); 
    }

    render() {
        console.log(this.state);
        let user = SpecificTextScreen.convertUser(this.chat.user1);
        console.log(user);
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={(message)=>this.onSendHandler({message})}
            />
        );
    }
} 

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  }, 
  input: {
    borderRadius: 5,
    height: 40,
    width: DEVICE_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'black',
    paddingHorizontal: 10,
}
});
