import React, { Component } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import Message from "./Message";
import { client } from "../../App";
import * as GraphQL from "../graphql";

export default class RandomConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    // internet available, mutating table with conversation data
    client
      .mutate({
        mutation: GraphQL.CreateDiscoverConversation,
        variables: {
          input: {
            conversationId: "convo1",
            messageId: ["lalalala", "hahahaha"]
          }
        },
        fetchPolicy: "no-cache"
      })
      .then(res => console.log(res))
      .catch(err => console.log(err));
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
  /*padding: 20,
        row: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    message: {
        fontSize: 18,
    },
    sender: {
        fontWeight: 'bold',
        paddingRight: 10,
    },*/
});
