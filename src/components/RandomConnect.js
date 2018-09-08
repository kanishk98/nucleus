import React from "react";
import { View, StyleSheet, FlatList, Text, KeyboardAvoidingView, Dimensions, TextInput } from "react-native";
import Message from "./Message";
import * as GraphQL from "../graphql";
import { API, graphqlOperation } from "../../node_modules/aws-amplify";

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

  
   onSendHandler = () => {
    console.log('onSendHandler ' + this.state.typedMessage);
    const newMessage = {
      conversationId: "temp_conversation",
      messageId: "shady",
    }
    this.messageMutation = API.graphql(graphqlOperation(GraphQL.CreateDiscoverMessage, {input: newMessage}))
    .then(res => {
      // optimistic UI, updates message regardless of network status
      console.log(res);
      this.state.messages.push({messageId: this.state.typedMessage, sender: true});
      this.forceUpdate();
    })
    .catch(err => console.log(err));
    // make text render as myMessage after submission
    // differentiate senderMessage from receivedMessage
  } 

  render() {
    console.log(this.state);
    const placeholderText = "You're talking to " + this.state.randomUser.username;
    const isMessagePresent = !!this.state.messages;
    if (isMessagePresent) {
      const messages = this.state.messages;
      //TODO: Fill ListEmptyComponent with an actual component
      return ( 
        <KeyboardAvoidingView 
        style={styles.container}>
          <FlatList
            data={messages}
            renderItem={this.renderItem}
            extraData={this.state.messages}
            keyExtractor={this.keyExtractor}
            ListEmptyComponent={<View />} />
          <TextInput
            style={styles.input}
            placeholder={placeholderText}
            secureTextEntry={false}
            autoCorrect={true}
            autoCapitalize={'sentences'}
            placeholderTextColor='gray'
            onChangeText={(text)=>this.setState({typedMessage: text})}
            onSubmitEditing={this.onSendHandler}
        />
        </KeyboardAvoidingView>
      );
    } else {
      return (
        <Text>No message received</Text>
      );
    }
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
