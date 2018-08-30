import React, {Component} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import AWSAppSyncClient from 'aws-appsync';
import {AUTH_TYPE} from 'aws-appsync/lib/link/auth-link';
import AppSync from '../AppSync';
import {Auth} from 'aws-amplify';

export default class RandomConnect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        };
    }

    componentDidMount() {
        // retrieve messages here
        // also see if connection should be initialised and maintained here
        // handle network issues

        // internet available, connecting to API
        const client = new AWSAppSyncClient({
            url: AppSync.graphqlEndpoint,
            region: AppSync.region,
            auth: {
                type: AUTH_TYPE.apiKey,
                apiKey: AppSync.apiKey,
                credentials: () => Auth.currentCredentials(),
            }
        });
    }

    renderItem({item}) {
        return (
            // think about including timestamp and delivery information
            <View />
        );
    }

    render() {
        const user = this.props.navigation.getParam('user', null);
        return (
            <View>
                <Text>{user.firebaseId}</Text>
            </View>
        );
    }    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    /*padding: 20,
        row: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    message: {
        fontSize: 18,
    },
    sender: {
        fontWeight: 'bold',
        paddingRight: 10,
    },*/
});