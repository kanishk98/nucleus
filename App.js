import React from 'react';
import {createStackNavigator} from 'react-navigation';
import LoginScreen from './src/components/LoginScreen'

const stackNavigator = createStackNavigator({
    Home: {
        screen:LoginScreen,
        navigationOptions: {
            header:null
        }
    }
});

export default stackNavigator;