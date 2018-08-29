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
import * as GraphQL from './src/graphql';
import {graphql} from 'react-apollo';

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
        PreDiscover: {
            screen: PreDiscover, 
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
        initialRouteName: 'PreDiscover'
    }
);

export const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {type: AUTH_TYPE.API_KEY, apiKey: 'da2-gyr4llduvng23nvulsnsq7jzmq'}
});

client.query({
    query: GraphQL.GetOnlineDiscoverUsers, 
    options: {
        variables: {online: Number(1)},
        fetchPolicy: 'network-only',
    }
}).then(res => console.log(res)).catch(err => console.log(err));

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