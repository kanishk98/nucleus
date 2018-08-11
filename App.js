import {createStackNavigator} from 'react-navigation';
import LoginScreen from './src/components/LoginScreen';
import RandomConnect from './src/components/RandomConnect';
import React, {Component} from 'react';
import SplashScreen from './src/components/SplashScreen'
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

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

const client = new ApolloClient({
    uri: 'https://57v7t2mncraizj2efxdll47zqy.appsync-api.ap-south-1.amazonaws.com/graphql'
});

export default class App extends React.Component {
    render() {
        return (
            <ApolloProvider client={client}>
                <StackNavigator />
            </ApolloProvider>
        );
    }
}