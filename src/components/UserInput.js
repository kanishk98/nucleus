import React, {Component} from 'react';
import {StyleSheet, TextInput, View, Dimensions} from 'react-native';
import {client} from '../../App';
import * as GraphQL from '../graphql';
import RandomConnect from './RandomConnect';

export default class UserInput extends Component {
    render() {
        return (
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder={this.props.placeholder}
                    secureTextEntry={this.props.secureTextEntry}
                    autoCorrect={true}
                    autoCapitalize={'sentences'}
                    returnKeyType={this.props.returnKeyType}
                    placeholderTextColor='black'
                    onChangeText={(text)=>{this.setState({message: text})}}
                    onSubmitEditing={(text)=>{RandomConnect.onSendHandler(text)}}
                />
            </View>
        );
    }
}

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        padding: 5,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'flex-end'
    },
    input: {
        borderRadius: 5,
        height: 40,
        width: DEVICE_WIDTH - 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'black',
        paddingHorizontal: 10,
        position: 'relative', 
        bottom: 0
    }
});