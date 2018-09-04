import React from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import Message from "./Message";
import * as GraphQL from "../graphql";
import { API, graphqlOperation } from "../../node_modules/aws-amplify";

export default class RandomConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      result: {
        value: {
          data: {
            onCreateNucleusDiscoverMessages: {
              conversationId: "eminem",
              messageId: [
                {key:"slim"},
                {key:"shady"},
                {key:"stan"},
                {key:"marshall"},
                {key:"mathers"}],
            }
          }
        }
      }
    };
  }

  componentDidMount() {
    /*this.subscription = API.graphql(
      graphqlOperation(GraphQL.SubscribeToDiscoverMessages, {conversationId: "slim"})
    ).subscribe({
      next: (res) => this.setState({result: res})
    });*/
  }

  renderItem = ({ item: {key} }) => (
    <Message id={key} />
  );

  render() {
    const user = this.props.navigation.getParam("user", null);
    console.log(this.state);
    const isMessagePresent = !!this.state.result;
    if (isMessagePresent) {
      const messages = this.state.result.value.data.onCreateNucleusDiscoverMessages;
      console.log('message present');
      return ( 
        <View>
          <FlatList
            data={messages.messageId}
            renderItem={this.renderItem}
            extraData={this.state}
            ListEmptyComponent={<View />} />
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
