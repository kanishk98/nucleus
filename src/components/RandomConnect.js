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
                {key: 0, content: "slim"},
                {key: 1, content: "shady"}, {key: 2, content: "stan"}, {key: 3, content: "marshall"}, {key: 4, content:"mathers"}],
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

  renderItem = ({ item: {messageId, content} }) => (
    <Message messageId={messageId} content={content} />
  );

  render() {
    const user = this.props.navigation.getParam("user", null);
    console.log(this.state);
    const isMessagePresent = !!this.state.result;
    if (isMessagePresent) {
      console.log('message present');
      return ( 
        <View>
          <FlatList
            renderItem={this.renderItem}
            data={this.state.result.value.data.onCreateNucleusDiscoverMessages.messageId}
            extraData={this.state}
            key={this.state.result.value.data.onCreateNucleusDiscoverMessages.key}
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
