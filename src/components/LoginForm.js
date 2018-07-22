import React, {Component} from 'react';
import {StyleSheet, View, Dimensions, Text, TouchableOpacity} from 'react-native';
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
                    <Text style = {styles.buttonText}>Sign in or sign up</Text>
                </TouchableOpacity>
            </View>
        );
    }
    onLoginButtonClick() {
        console.log('Login button clicked');
    }
}

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
   container: {
       justifyContent: 'center',
       flex: 1,
       alignItems: 'center',
   },
    buttonContainer: {
       backgroundColor: 'rgba(255, 255, 255, 0.9)',
       width: DEVICE_WIDTH - 40,
       justifyContent: 'center',
       height: 50,
       borderRadius: 5,
       paddingVertical: 20
    },
    buttonText: {
        textAlign: 'center',
        color: '#003366',
        fontWeight: '700',
        fontSize: 20
    }
});