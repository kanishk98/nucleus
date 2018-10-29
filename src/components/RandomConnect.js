import React from "react";
import { Alert, StyleSheet, Dimensions, AsyncStorage } from "react-native";
import SpecificTextScreen from "./SpecificTextScreen";
import * as GraphQL from "../graphql";
import { API, graphqlOperation } from "../../node_modules/aws-amplify";
import { GiftedChat } from 'react-native-gifted-chat';
import Constants from '../Constants';

export const alertDelete = async () => {
  const conversationId = await AsyncStorage.getItem('discoverConversationId');
  console.log(conversationId);
  API.graphql(graphqlOperation(GraphQL.DeleteDiscoverChat, {input: {conversationId: conversationId}}))
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  })
}

export default class RandomConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      typedMessage: '',
    };
    this.conversationId = this.props.navigation.getParam('conversationId');
    this.user = this.props.navigation.getParam('user');
    this.randomUser = this.props.navigation.getParam('randomUser');
    this.subscribeToDiscoverMessages();
    this.subscribeToDeletedChat();
  }

  sendNotification() {
    fetch(Constants.discoverNotificationsUrl, {
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

  subscribeToDiscoverMessages() {
    console.log('Subscription function: ' + this.conversationId);
    API.graphql(graphqlOperation(GraphQL.SubscribeToDiscoverMessages, { conversationId: this.conversationId }))
      .subscribe({
        next: (res) => {
          console.log('Subscription received: ' + JSON.stringify(res));
          const newMessage = this.convertMessage(res.value.data.onCreateNucleusDiscoverMessages);
          console.log(newMessage);
          if (res.value.data.onCreateNucleusDiscoverMessages.recipient.firebaseId == this.user.firebaseId) {
            let tempArray = [];
            console.log('Shit.');
            tempArray.push(newMessage);
            this.renderReceivedText(newMessage);
          }
        }
      });
  }

  subscribeToDeletedChat() {
    API.graphql(graphqlOperation(GraphQL.SubscribeToChatDeletion, { conversationId: this.conversationId }))
    .subscribe({
      next: (res) => {
        Alert.alert(
          'Chat closed',
          'This happens when one of you goes offline.',
          [
            {text: 'OK', onPress: () => this.props.navigation.navigate('Chat')},
          ],
          { cancelable: false }
        );
      }
    })
  }

  renderReceivedText(message) {
    this.setState(previousState => {
      console.log(previousState);
      return {
        messages: GiftedChat.append(previousState.messages, message)
      };
    });
  }

  convertMessage(message) {
    let m = {};
    m._id = message.messageId;
    m.text = message.content;
    m.createdAt = new Date(message.timestamp);
    m.user = { _id: 'unknown', name: 'Unknown' };
    m.image = message.image;
    return m;
  }

  onSendHandler = ({ message }) => {
    console.log('onSendHandler ' + this.state.typedMessage);
    let chatId = this.props.navigation.getParam("conversationId", 0);
    const newMessage = {
      conversationId: chatId,
      messageId: new Date().getTime().toString(),
      author: this.user,
      recipient: this.randomUser,
      content: message[0].text,
      timestamp: message[0].createdAt,
    }
    console.log(newMessage);
    API.graphql(graphqlOperation(GraphQL.CreateDiscoverMessage, { input: newMessage }))
      .then(res => {
        // optimistic UI, updates message regardless of network status
        console.log(res);
        /*this.state.messages.push({messageId: this.state.typedMessage, sender: true});
        this.forceUpdate();*/
      })
      .catch(err => console.log(err));
    this.setState(previousState => {
      console.log(previousState);
      return {
        messages: GiftedChat.append(previousState.messages, message)
      };
    });
  }

  async componentDidMount() {
    await AsyncStorage.setItem('discoverConversationId', this.conversationId);
  }

  render() {
    console.log(this.state);
    let placeholderText = null;
    if (this.props.randomUser) {
      placeholderText = "You're talking to " + this.props.randomUser.username;
    } else {
      placeholderText = "You're talking to " + this.props.navigation.getParam("randomUser", null).username;
    }
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={(message) => this.onSendHandler({ message })}
      />
    );
  }
}

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: 'absolute',
    bottom: 0,
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
