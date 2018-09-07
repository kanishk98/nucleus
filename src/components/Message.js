import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

export default class Message extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {id, sent} = this.props;
        if (!sent) {
            return (
                <View style={styles.message}>
                    <Text style={styles.messageUsername}>{id}</Text>
                </View>
            );
        } else {
            return (
                <View style={styles.myMessage}>
                    <Text style={styles.messageUsername}>{id}</Text>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        flexDirection: 'row',
    }, 
    message: {
        flex: 0.8, 
        backgroundColor: 'gray',
        borderRadius: 6, 
        marginHorizontal: 16, 
        marginVertical: 2, 
        paddingHorizontal: 8, 
        paddingVertical: 6, 
        shadowColor: 0.5,
        shadowRadius: 1, 
        shadowOffset: {
            height: 1,
        }, 
    }, 
    myMessage: {
        backgroundColor: '#003366',
        borderRadius: 6, 
        marginHorizontal: 16, 
        marginVertical: 2, 
        paddingHorizontal: 8, 
        paddingVertical: 6, 
        shadowColor: 0.5,
        shadowRadius: 1, 
        shadowOffset: {
            height: 1,
        }, 
        flex: 0.8,
    },
    messageUsername: {
        color: 'white',
        fontWeight: 'bold',
    },
    messageTime: {
        color: '#8c8c8c',
        fontSize: 11, 
        textAlign: 'right',
    }, 
    messageSpacer: {
        flex: 0.2,
    }
});