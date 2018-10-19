import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import SpecificTextScreen from "./SpecificTextScreen";
import * as GraphQL from "../graphql";
import { API, graphqlOperation } from "../../node_modules/aws-amplify";
import { GiftedChat } from 'react-native-gifted-chat';

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
  }

  subscribeToDiscoverMessages() {
    console.log('Subscription function: ' + this.conversationId);
    API.graphql(graphqlOperation(GraphQL.SubscribeToDiscoverMessages, {conversationId: this.conversationId}))
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

renderReceivedText (message) {
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
  m.user = {_id: 'unknown', name: 'Unknown'};
  m.image = message.image;
  return m;
}
  
   onSendHandler = ({message}) => {
    console.log('onSendHandler ' + this.state.typedMessage);
    let chatId = this.props.navigation.getParam("conversationId", 0);
    const newMessage = {
      conversationId: chatId,
      messageId: new Date().getTime().toString(),
      author: this.user,
      recipient: this.randomUser,
      content: message[0].text,
      timestamp: new Date().toDateString()
    }
    console.log(newMessage);
    API.graphql(graphqlOperation(GraphQL.CreateDiscoverMessage, {input: newMessage}))
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

  render() {
    console.log(this.state);
    let placeholderText = null;
    if(this.props.randomUser) {
      placeholderText = "You're talking to " + this.props.randomUser.username;
    } else {
      placeholderText = "You're talking to " + this.props.navigation.getParam("randomUser", null).username;
    }
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
