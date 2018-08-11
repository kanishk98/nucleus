import {createStackNavigator} from 'react-navigation';
import LoginScreen from './src/components/LoginScreen';
import RandomConnect from './src/components/RandomConnect';
import React, {Component} from 'react';
import SplashScreen from './src/components/SplashScreen'

const StackNavigator = createStackNavigator(
    {
       Login: {
            screen: LoginScreen, 
            navigationOptions: {
                header: null
            }
        }, 
        Splash: {
            screen: SplashScreen,
            navigationOptions: {
                header: null
            }
        }, 
        Connect: {
            screen: RandomConnect, 
            navigationOptions: {
                title: 'Connect',
            }
        },
    }, 
    {
        initialRouteName: 'Login'
    }
);

export default class App extends React.Component {
    render() {
        return <StackNavigator />
    }
}