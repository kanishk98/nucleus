import React, {Component} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';

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
    }

    renderItem({item}) {
        return (
            // think about including timestamp and delivery information
            <View style={styles.row}>
                <Text style={styles.sender}>Sender</Text>
                <Text style={styles.message}>Message</Text>
            </View>
        );
    }

    render() {
        return (
            <View>
                <FlatList
                    data={this.state.messages}
                    renderItem={this.renderItem}
                    inverted
                />
            </View>
        );
    }    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    row: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    message: {
        fontSize: 18,
    },
    sender: {
        fontWeight: 'bold',
        paddingRight: 10,
    },
});