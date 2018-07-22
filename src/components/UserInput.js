import React, {Component} from 'react';
import {StyleSheet, TextInput, View, Dimensions} from 'react-native';

export default class UserInput extends Component {
    render() {
        return (
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder={this.props.placeholder}
                    secureTextEntry={this.props.secureTextEntry}
                    autoCorrect={this.props.autoCorrect}
                    autoCapitalize={this.props.autoCapitalize}
                    returnKeyType={this.props.returnKeyType}
                    placeholderTextColor='rgba(255, 255, 255, 0.5)'
                />
            </View>
        );
    }
}

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
       padding: 5
    },
    input: {
        borderRadius: 5,
        height: 40,
        width: DEVICE_WIDTH - 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 10,
        color: 'white',
        paddingHorizontal: 10
    }
});