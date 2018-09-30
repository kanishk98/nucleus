import {createStackNavigator, createBottomTabNavigator} from 'react-navigation';
import LoginScreen from './src/components/LoginScreen';
import React from 'react';
import AppSync from './src/AppSync';
import {ApolloProvider} from 'react-apollo';
import PreDiscover from './src/components/PreDiscover';
import {Rehydrated} from 'aws-appsync-react/lib';
import {AUTH_TYPE} from 'aws-appsync/lib';
import AWSAppSyncClient from 'aws-appsync/lib';
import Constants from './src/Constants';
import Amplify from 'aws-amplify';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SpecificChatList from './src/components/SpecificChatList';
import SpecificTextScreen from './src/components/SpecificTextScreen';

const StackNavigator = createStackNavigator(
    {
       Login: {
            screen: LoginScreen, 
            navigationOptions: {
                header: null
            }
        },
        Chat: {
            screen: createBottomTabNavigator({
                Connect: {
                    screen: SpecificChatList, 
                    navigationOptions: {
                        tabBarIcon: <Icon name={"rocketchat"} size={30} showIcon={true} />
                    }
                },
                Discover: {
                    screen: PreDiscover,
                    navigationOptions: {
                        tabBarIcon: <Icon name={"rocketchat"} size={30} showIcon={true} />
                    }
                }
            }, {
            tabBarOptions: {
                swipeEnabled: true,
                showIcon: true,
                activeTintColor: 'tomato',
                inactiveTintColor: 'gray',
            },  
        }), navigationOptions: {
            header: null,
        }},
        SpecificTextScreen: {
            screen: SpecificTextScreen, 
            navigationOptions: {
                header: null,
            }
        } 
    },
    {
        initialRouteName: 'Login'
    }
);

export const connectClient = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {type: AUTH_TYPE.API_KEY, apiKey: Constants.discoverApiKey}
});

export const apiConfig = {
    'aws_appsync_graphqlEndpoint': AppSync.graphqlEndpoint,
    'aws_appsync_region': AppSync.region,
    'aws_appsync_authenticationType': AUTH_TYPE.API_KEY,
    'aws_appsync_apiKey': Constants.discoverApiKey
}

Amplify.configure(apiConfig);

export default class App extends React.Component {
    render() {
        return (
            <ApolloProvider client={connectClient}>
                <Rehydrated>
                    <StackNavigator />
                </Rehydrated>
            </ApolloProvider>
        );
    }
}