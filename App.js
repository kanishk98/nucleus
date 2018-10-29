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
import { Button } from 'react-native-elements';
import NavigationService from './src/components/NavigationService';
import RandomConnect from './src/components/RandomConnect';
import firebase from 'react-native-firebase';
import { AsyncStorage, Platform } from 'react-native';
import { alertDelete } from './src/components/RandomConnect';
import { HeaderBackButton } from 'react-navigation';

const BottomNavigator = createBottomTabNavigator({
    Connect: {
        screen: createStackNavigator({Connect: {screen: SpecificChatList, navigationOptions: {title: 'Connect'}}})
    },
    Discover: {
        screen: createStackNavigator({ Discover: { screen: PreDiscover, navigationOptions: { title: 'Discover' } } })
    }, 
    Trending: {
        screen: createStackNavigator({
            Trending: {
                screen: TrendingScreen, navigationOptions: {
                    title: 'Polls', headerRight: (
                        <Button
                            onPress={newTrendingPost}
                            title="+1"
                            textStyle={{ color: 'black' }}
                            raised={false}
                            backgroundColor='rgba(0, 0, 0, 0)'
                        />
                    ), } } })
    }
    }, {
    navigationOptions: ({navigation}) => ({
        tabBarIcon: ({ focused, horizontal, tintColor }) => {
            globalRouteName = navigation.state.routeName; 
            const { routeName } = navigation.state;
            let iconName;
            console.log(routeName);
            if (routeName === 'Connect') {
                return <Ionicons name={'ios-chatbubbles'} size={horizontal ? 30 : 30} color={tintColor} />;
            } else if (routeName === 'Discover') {
                return <Entypo name={'network'} size={horizontal ? 30 : 30} color={tintColor} />;
            } else if (routeName == 'Trending') {
                // iconName = `fire${focused ? '' : '-outline'}`;
                return <FontAwesome name={'fire'} size={horizontal ? 30 : 30} color={tintColor} />;
            }
        }, 
    }),
    tabBarOptions: {
        activeTintColor: Constants.primaryColor,
        showLabel: false,
    }
});

const LoggedOutStackNavigator = createStackNavigator(
  {
    Login: {
      screen: LoginScreen,
      navigationOptions: {
        header: null
      }
    },
    Chat: {
      screen: BottomNavigator,
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    },
    Random: {
      screen: RandomConnect,
      navigationOptions: {
        title: "Unknown",
        headerLeft: (
            <HeaderBackButton
              onPress={alertDelete}
            />
        ),
      }
    },
    SpecificTextScreen: {
      screen: SpecificTextScreen,
      navigationOptions: {
        title: "Connected"
      }
    },
    NewTrendingScreen: {
      screen: NewTrendingScreen,
      navigationOptions: {
        title: "New anonymous poll"
      }
    }
  },
  {
    initialRouteName: "Login"
  }
);

const LoggedInStackNavigator = createStackNavigator(
    {
        Login: {
            screen: LoginScreen,
            navigationOptions: {
                header: null
            }
        },
        Chat: {
            screen: BottomNavigator,
            navigationOptions: ({ navigation }) => ({
                header: null
            })
        },
        Random: {
            screen: RandomConnect,
            navigationOptions: {
                title: "Discover"
            }
        },
        SpecificTextScreen: {
            screen: SpecificTextScreen,
            navigationOptions: {
                title: "Connected"
            }
        },
        NewTrendingScreen: {
            screen: NewTrendingScreen,
            navigationOptions: {
                title: "New anonymous poll"
            }
        }
    },
    {
        initialRouteName: "Chat"
    }
);

function getLoggedIn() {
    AsyncStorage.getItem(Constants.LoggedIn)
        .then(res => {
            console.log(res);
            if (res) {
                console.log('user logged in');
                // user logged in
                return true;
            } else {
                console.log('user not logged in');
                return false;
            }
        })
        .catch(err => {
            return false;
        });
    return false;
}

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
    
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // setting up Android notifications
        const channel = new firebase.notifications.Android.Channel('channelId', 'channelId', firebase.notifications.Android.Importance.Max)
        .setSound('default')
        .setDescription('Nucleus_default_channel');
        firebase.notifications().android.createChannel(channel);
    }

    render() {
        console.log(getLoggedIn());
        if (getLoggedIn()) {
            return (
                <ApolloProvider client={connectClient}>
                    <Rehydrated>
                        <LoggedInStackNavigator
                            ref={navigatorRef => {
                                NavigationService.setTopLevelNavigator(navigatorRef);
                            }}
                        />
                    </Rehydrated>
                </ApolloProvider>
            );
        } else {
            return (
                <ApolloProvider client={connectClient}>
                    <Rehydrated>
                        <LoggedOutStackNavigator
                            ref={navigatorRef => {
                                NavigationService.setTopLevelNavigator(navigatorRef);
                            }}
                        />
                    </Rehydrated>
                </ApolloProvider>
            );
        }
    }
}