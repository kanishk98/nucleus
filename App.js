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
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpecificChatList from './src/components/SpecificChatList';
import SpecificTextScreen from './src/components/SpecificTextScreen';
import TrendingScreen, { newTrendingPost } from './src/components/TrendingScreen';
import NewTrendingScreen from './src/components/NewTrendingScreen';
import { Button } from 'react-native';
import NavigationService from './src/components/NavigationService';
import RandomConnect from './src/components/RandomConnect';

const BottomNavigator = createBottomTabNavigator({
    Connect: {
        screen: SpecificChatList, 
        navigationOptions: {
            tabBarIcon: <Ionicons name={"ios-chatbubbles"} size={33}/>
        }
    },
    Discover: {
        screen: PreDiscover,
        navigationOptions: {
            tabBarIcon: <Entypo name={"network"} size={30}/>
        }
    }, 
    Trending: {
        screen: TrendingScreen, 
        navigationOptions: {
            tabBarIcon: <FontAwesome name={"fire"} size={30}/>,
        }
    }
    }, {
    tabBarOptions: {
        swipeEnabled: true,
        showIcon: true,
        activeTintColor: Constants.primaryColor,
        inactiveTintColor: 'gray',
        showLabel: false,
    },  
});

const StackNavigator = createStackNavigator(
    {
       Login: {
            screen: LoginScreen, 
            navigationOptions: {
                header: null
            }
        },
        Chat: {
            screen: BottomNavigator, 
            navigationOptions: {
            title: 'Joint',
            headerLeft: null,
            gesturesEnabled: false,
            headerRight: (
                <Button
                  onPress={newTrendingPost}
                  title="+1"
                  color="black"
                />
            ),
        }},
        Random: {
            screen: RandomConnect, 
            navigationOptions: {
                title: 'Randomly connected',
            }
        },
        SpecificTextScreen: {
            screen: SpecificTextScreen, 
            navigationOptions: {
                title: 'Connected',
            }
        },
        NewTrendingScreen: {
            screen: NewTrendingScreen,
            navigationOptions: {
                title: 'New anonymous post',
            }
        },
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
                    <StackNavigator
                        ref={navigatorRef => {
                            NavigationService.setTopLevelNavigator(navigatorRef);
                        }}
                    />
                </Rehydrated>
            </ApolloProvider>
        );
    }
}