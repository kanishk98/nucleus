import React from 'react';
import {View, StyleSheet} from 'react-native';

export default class Message extends React.Component {
    render() {
        const {status, message} = this.props;
        return (
            <View style={styles.message}>
                <Text>{message.text}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        flexDirection: 'row',
    }, 
    message: {
        flex: 0.8, 
        backgroundColor: 'blue',
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
        backgroundColor: '#003366'
    },
    messageUsername: {
        color: 'white',
        fontWeight: 'bold',
        paddingBottom: 12,
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