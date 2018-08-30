import {createStackNavigator} from 'react-navigation';
import LoginScreen from './src/components/LoginScreen';
import RandomConnect from './src/components/RandomConnect';
import React from 'react';
import SplashScreen from './src/components/SplashScreen'
import AppSync from './src/AppSync';
import {ApolloProvider} from 'react-apollo';
import PreDiscover from './src/components/PreDiscover';
import {Rehydrated} from 'aws-appsync-react';
import {AUTH_TYPE} from 'aws-appsync/lib';
import AWSAppSyncClient from 'aws-appsync';

const StackNavigator = createStackNavigator(
    {
       Login: {
            screen: LoginScreen, 
            navigationOptions: {
                header: null
            }
        },
        PreDiscover: {
            screen: PreDiscover, 
            navigationOptions: {
                header: null
            }
        },
        Discover: {
            screen: RandomConnect,
            navigationOptions: {
                title: 'Discover',
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
        initialRouteName: 'PreDiscover'
    }
);

export const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {type: AUTH_TYPE.API_KEY, apiKey: 'da2-gyr4llduvng23nvulsnsq7jzmq'}
});

export default class App extends React.Component {
    render() {
        return (
            <ApolloProvider client={client}>
                <Rehydrated>
                    <StackNavigator />
                </Rehydrated>
            </ApolloProvider>
        );
    }
}