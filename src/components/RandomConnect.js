import React from "react";
import { View, StyleSheet, FlatList, Text, KeyboardAvoidingView, Dimensions, TextInput } from "react-native";
import Message from "./Message";
import * as GraphQL from "../graphql";
import { API, graphqlOperation } from "../../node_modules/aws-amplify";
import {client} from "../../App";

export default class RandomConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      typedMessage: '',
    };
  }

  convertSubscriptionResultToStateObject(res) {
    let messages = res.value.data.onCreateNucleusDiscoverMessages;
    return this.state.messages.push(messages);
  }

  componentDidMount() {
    this.subscription = API.graphql(
      graphqlOperation(GraphQL.SubscribeToDiscoverMessages, {conversationId: "slim"})
    ).subscribe({
      next: (res) => this.setState({messages: this.convertSubscriptionResultToStateObject(res)})
    });
  }

  keyExtractor = (item, index) => item.messageId;

  renderItem = ({ item: {key} }) => (
    <Message id={key} />
  );

  
   onSendHandler = () => {
    const sendMessageMutation = {
      mutation: GraphQL.CreateDiscoverMessage,
      variables: {input: {
        conversationId: "weird", 
        messageId: String(this.state.typedMessage),
      }},
      refetchQueries: [sendMessageMutation],
      optimisticResponse: () => {
      // construct new object here displaying relevant info 
      let tempArray = this.state.messages;         
      tempArray.push({"messageId": this.state.typedMessage});
      this.setState({messages: tempArray});
    }};
    console.log('onSendHandler ' + this.state.typedMessage);
    // make text render as myMessage after submission
    // differentiate senderMessage from receivedMessage
    client.mutate(sendMessageMutation)
    .then(res => {console.log(res)})
    .catch(err => {console.log(err)});
  }

  render() {
    const user = this.props.navigation.getParam("user", null);
    console.log(this.state);
    const isMessagePresent = !!this.state.messages;
    if (isMessagePresent) {
      const messages = this.state.messages;
      console.log('message present');
      return ( 
        <KeyboardAvoidingView 
        style={styles.container}>
          <FlatList
            data={messages.messageId}
            renderItem={this.renderItem}
            extraData={this.state.messages}
            keyExtractor={this.keyExtractor}
            ListEmptyComponent={<View />} />
          <TextInput
            style={styles.input}
            placeholder='Type a message'
            secureTextEntry={false}
            autoCorrect={true}
            autoCapitalize={'sentences'}
            placeholderTextColor='black'
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
