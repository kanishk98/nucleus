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


  getMessages() {
    client.query({
      query: GraphQL.GetDiscoverChat, 
      variables: {
        input: {
          conversationId: "infinite"
        }
      }
    })
    .then(res => console.log(res.data.get))
    .catch(err => console.log(err));  
  }

  componentDidMount() {
    // internet available, mutating table with conversation data
    /*client
      .mutate({
        mutation: GraphQL.CreateDiscoverChat,
        variables: {
          input: {
            conversationId: "slim",
            content: "Dear Slim, I wrote you but you still ain't calling",
            isRead: true,
            isSent: true,
            isReceived: true,
          }
        },
        fetchPolicy: "no-cache"
      })
      .then(res => console.log(res))
      .catch(err => console.log(err));*/
  }

  renderItem = ({ item: { status, message } }) => (
    <Message status={status} message={message} />
  );

  render() {
    const user = this.props.navigation.getParam("user", null);
    client.subscribe({
      query: GraphQL.SubscribeToDiscoverMessages,
      variables: {conversationId: "slim"},
    }).subscribe({next(res) {
      console.log(res);
    }, error(err) {
      console.log(err);
    }})
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
