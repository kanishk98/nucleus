import React from 'react';
import { Message } from './Message';
import * as GraphQL from '../graphql';
import { Dimensions, StyleSheet, Text} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { connectClient } from '../../App';
import { GiftedChat } from 'react-native-gifted-chat';
import Constants from '../Constants';
import AWS from 'aws-sdk';
import { Button } from 'react-native-elements';

export default class SpecificTextScreen extends React.Component {

    static noFilter = {
        conversationId: {ne: 'null'}
    }

    convertUser(passedUser) {
        let user = {
            _id: null,
            avatar: null,
            name: null,
        };
        user._id = passedUser.firebaseId;
        user.avatar = passedUser.profilePic;
        user.name = passedUser.username;
        if (user._id == this.chat.user1.firebaseId) {
            return {};
        }
        return user;
    }

    convertMessage(message) {
        let m = {};
        m._id = message.messageId;
        m.text = message.content;
        m.createdAt = new Date(message.timestamp);
        m.user = this.convertUser(message.author);
        m.image = message.image;
        return m;
    }
    
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        }
    }
    
    fetchMoreMessages = () => {
        const dynamoDB = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName : "Nucleus.ConnectTexts",
            KeyConditionExpression: "#conversationId = :id",
            ExpressionAttributeNames:{
                "#conversationId": "conversationId"
            },
            ExpressionAttributeValues: {
                ":id": this.chat.conversationId
            }, 
            Limit: 100,
        };
        console.log('Querying data');
        let messages = null;
        dynamoDB.query(params, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
                let m = data.Items;
                messages = [];
                console.log(m);
                for (let message in m) {
                    console.log(message);
                    console.log(m[message].author);
                    messages.push(this.convertMessage(m[message]));
                }
                this.setState(previousState => {
                    console.log(previousState);
                    return {
                        messages: GiftedChat.append(previousState.messages, messages)
                    };
                });
            }
        }.bind(this));
    }

    onSendHandler = ({message}) => {
        console.log(message[0]);
        const newMessage = {
            conversationId: this.chat.conversationId,
            author: this.chat.user1,
            recipient: this.chat.user2,
            content: message[0].text,
            messageId: String(Constants.MaxDate - Math.floor(new Date().getTime()/1000)),
            timestamp: message[0].createdAt,
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
        console.log(JSON.stringify(this.chat));
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
                chat: this.chat,
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
              const newMessage = this.convertMessage(res.value.data.onCreateNucleusConnectTexts);
              if (newMessage.user._id == this.chat.user2.firebaseId) {
                let tempArray = [];
                console.log('Shit.');
                tempArray.push(newMessage);
                this.renderReceivedText(newMessage);
              }
            }
        }); 
    }

    componentDidMount () {
        console.log('Fuck this');
        this.chat = this.props.navigation.getParam("chat");
        console.log(this.chat);
        this.recipient = this.convertUser(this.chat.user2);
        this.user = this.chat.user1;
        this.subscribeToConnectMessages();
        this.fetchMoreMessages();
    }

    render() {
        console.log(this.state.messages);
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
