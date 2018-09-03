import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import Message from "./Message";
import * as GraphQL from "../graphql";
import { compose, graphql } from "react-apollo";
import AllMessages from "./AllMessages";

export default class RandomConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  renderItem = ({ item: { status, message } }) => (
    <Message status={status} message={message} />
  );

  render() {
    const user = this.props.navigation.getParam("user", null);
    const messageItem = {
      item: {
        status: "Sent",
        message: {
          text: "Message text"
        }
      }
    };
    return (
      <View>
        <FlatList renderItem={this.renderItem(messageItem)} />
      </View>
    );
  }
}

export const DiscoverMessages = compose(
  graphql(GraphQL.GetDiscoverMessages, {
    options: {
      variables: {input: {
        conversationId: "slim",
        messageId: "shady"
      }},
      fetchPolicy: "cache-and-network",
    }, 
    props: (props) => {
      subscribeToDiscoverMessages: params => {
        props.data.subscribeToMore({
          document: GraphQL.SubscribeToDiscoverMessages,
          updateQuery: (prev, {subscriptionData: {data: {conversationId, messageId}}}) => ({
            ...prev,
            allMessages: {messages: [messageId, ...prev.allMessages.messages]}
          })
        }) 
      }
    }
  })(AllMessages)
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
