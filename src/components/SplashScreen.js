import React, { Component } from "react";
import { Text, View } from "react-native";
import { AsyncStorage } from "@aws-amplify/core";

export default class SplashScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: "false"
    };
  }

  componentDidMount() {
    try {
      const loggedIn = AsyncStorage.getItem("LOGGED_IN");
      this.setState({ loggedIn: JSON.stringify(loggedIn) });
    } catch (error) {
      console.log(error.message);
    }
  }

  render() {
    const temp = JSON.stringify(this.state.temp);
    return (
      <View>
        <Text>{this.state.loggedIn}</Text>
      </View>
    );
  }

  async getLoggedIn(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.log(error.message);
    }
    return null;
  }
}
