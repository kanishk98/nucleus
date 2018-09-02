import React, { Component } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import Message from "./Message";
import { client } from "../../App";
import * as GraphQL from "../graphql";
import { compose } from 'react-apollo';
import { graphql } from "../../node_modules/react-apollo";

export default class RandomConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    this.props.subscribeToDiscoverMessages();
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

export const SubscriptionModule = compose(
  graphql(GraphQL.GetDiscoverMessages, {
    options: {
      fetchPolicy: 'cache-and-network',
    },
    props: (props) => {
      return {
        messages: props.data.listMessages? props.data.listMessages.items: [],
        subscribeToDiscoverMessages: () => {
          props.data.subscribeToMore({
            document: GraphQL.SubscribeToDiscoverMessages,
            updateQuery: (prev, {subscriptionData:{data: {onCreateNucleusDiscoverMessages}}}) => {
              return {
                ...prev,
                listMessages: {
                  type: 'MessageConnection',
                  items: [onCreateNucleusDiscoverMessages, ...prev.listMessages.items]
                }
            }}}
          )
        }
      }
    }
  })
)(RandomConnect);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
