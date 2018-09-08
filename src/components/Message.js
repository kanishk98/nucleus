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
                    <Text style={styles.messageContent}>{id}</Text>
                    <Text style={styles.messageTime}>time</Text>
                </View>
            );
        } else {
            return (
                <View style={styles.myMessage}>
                    <Text style={styles.messageContent}>{id}</Text>
                    <Text style={styles.messageTime}>time</Text>
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
        flex: 1,
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
        justifyContent: 'flex-start',
        alignSelf: 'baseline',
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
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'baseline',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    messageContent: {
        fontSize: 16,
        justifyContent: 'center', 
        flex: 1, 
        flexWrap: 'wrap',
        color: 'white',
        fontWeight: 'bold',
    },
    messageTime: {
        color: 'white',
        fontSize: 10, 
        textAlign: 'right',
    }, 
    messageSpacer: {
        flex: 0.2,
    }
});