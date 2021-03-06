import React, {Component} from 'react';
import {Image, StyleSheet, View, Text, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import LoginForm from "./LoginForm";
import Constants from "../Constants";

export default class LoginScreen extends Component {
    render() {
        return (
            <KeyboardAvoidingView style = {styles.container}>
                <View style = {styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                    />
                </View>
                <LoginForm navigation={this.props.navigation}/>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoContainer: {
      marginTop: 40,
      justifyContent: 'center',
      flexGrow: 1,
      alignItems: 'center'
    },
    logo: {
      height: 200,
      width: 200
    }
});