import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, TouchableOpacity} from 'react-native';
import UserInput from './UserInput'

export default class LoginForm extends Component {
    render() {
        return(
            <View style={styles.container}>
                <UserInput
                    placeholder={"SNU net ID"}
                    secureTextEntry={false}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                    returnKeyType={'done'}>
                </UserInput>
                <UserInput
                    placeholder={"Password"}
                    secureTextEntry={true}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                    returnKeyType={'done'}/>
                <TouchableOpacity style = {styles.buttonContainer}>
                    <Text style = {styles.buttonText}Sign in or sign up></Text>
                </TouchableOpacity>
            </View>
        );
    }
    onLoginButtonClick() {
        console.log('Login button clicked');
    }
}

const styles = StyleSheet.create({
   container: {
       justifyContent: 'center',
       flex: 1,
       alignItems: 'center',
   },
    buttonContainer: {
       flex: 1,
       backgroundColor: 'white',
       paddingVertical: 15,
    },
    buttonText: {
        textAlign: 'center',
        color: 'white'
    }
});