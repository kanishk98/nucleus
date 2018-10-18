import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import Message from "./Message";
import * as GraphQL from "../graphql";
import { API, graphqlOperation } from "../../node_modules/aws-amplify";
import { GiftedChat } from 'react-native-gifted-chat';

// TODO: Major problem: Schema allows String, not user types. Last checked, subscriptions only worked with String.

export default class RandomConnect extends React.Component {
  constructor(props) {
    super(props);
    props.user = this.props.navigation.getParam("user", null);
    this.state = {
      messages: [],
      typedMessage: '',
      randomUser: this.props.navigation.getParam("randomUser", null)
    };
  }

  static navigationOptions = ({navigation}) => {
    title: 'Discover'
  }

  componentDidMount() {
    let chatId = this.props.navigation.getParam("conversationId", 0);
    this.subscription = API.graphql(
      graphqlOperation(GraphQL.SubscribeToDiscoverMessages, {conversationId: chatId})
    ).subscribe({
      next: (res) => {
        console.log('Subscription received: ' + String(res));
        const newMessage = res.value.data.onCreateNucleusDiscoverMessages;
        newMessage.sender = false;
        this.state.messages.push(newMessage);
        this.forceUpdate();
      }
    });
  }

  keyExtractor = (item, index) => item.messageId;

  renderItem = ({ item: {messageId, sender} }) => (
    <Message id={messageId} sent={sender}/>
  );

  
   onSendHandler = ({message}) => {
    console.log('onSendHandler ' + this.state.typedMessage);
    let chatId = this.props.navigation.getParam("conversationId", 0);
    const newMessage = {
      conversationId: chatId,
    }
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
    if(this.state.randomUser) {
      placeholderText = "You're talking to " + this.state.randomUser.username;
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

  componentWillUnmount() {
    this.subscription.unsubscribe();
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
