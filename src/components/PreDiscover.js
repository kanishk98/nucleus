import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import * as GraphQL from '../graphql';
import {graphql, compose} from 'react-apollo';

const getOnlineUsers = graphql(GraphQL.GetOnlineDiscoverUsers, {
    options: {
        variables: {online: 1},
        fetchPolicy: 'network-only',
    },
})(UserList);

function UserList ({data: {getOnlineNucleusDiscoverUsers}}) {
    return (
        <Text>UserList</Text>
    );
}

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            text: "Tap anywhere to get started",
            connected: true
        };
    }
    
    render() {
        let {text} = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.instructions}>{text}</Text>
            </View>
        );
    }
}

const styles=StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#003366',
    },
    instructions: {
        color: 'white',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center'
    }
});