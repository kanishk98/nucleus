import {createStackNavigator} from 'react-navigation';
import LoginScreen from './src/components/LoginScreen';
import RandomConnect from './src/components/RandomConnect';
import React, {Component} from 'react';

const StackNavigator = createStackNavigator(
    {
       Login: {
            screen: LoginScreen, 
            navigationOptions: {
                header: null
            }
        },
        Connect: {
            screen: RandomConnect, 
            navigationOptions: {
                title: 'connect',
            }
        },
    }, 
    {
        initialRouteName: 'Login',
    }
);

export default class App extends React.Component {
    render() {
        return <StackNavigator />
    }
}