import React, {Component} from 'react';
import {Image, StyleSheet, View, Text, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import LoginForm from "./LoginForm";

export default class LoginScreen extends Component {
    render() {
        return (
            <KeyboardAvoidingView style = {styles.container}>
                <View style = {styles.logoContainer}>
                    <Image
                        source={require('../../assets/GitHub-Mark-Light-120px-plus.png')}
                        style={styles.logo}
                    />
                </View>
                <LoginForm/>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003366',
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
      height: 100,
      width: 100
    }
});