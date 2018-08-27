import React from 'react';
import {NetInfo, Text, View, StyleSheet} from 'react-native';
import client from '../../App';
import * as GraphQL from '../graphql';
import { Query } from 'react-apollo';

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            text: "Tap anywhere to get started",
            connected: true
        };
    }

    /*componentDidMount() {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (!isConnected) {
                this.setState({"text": "Sorry, your device is offline", "connected": false});
            }
        });
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    }

    handleConnectionChange(isConnected) {
        if (isConnected) {
            this.setState({text: "Tap anywhere to get started", "connected": false });
        } else {
            this.setState({text: "Sorry, your device is offline", connected: false });
        }
    }*/
    
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
        color: 'black',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center'
    }
});