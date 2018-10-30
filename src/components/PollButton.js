import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import Constants from '../Constants';

export default class PollButton extends React.PureComponent {
    renderSubParts = () => {
        return (
            <Text style={styles.text}>
                {this.props.label}
            </Text>
        );
    }
    render() {
        return (
            <TouchableOpacity
                style={[styles.container, this.props.containerStyle]}
                onPress={this.props.onPress}
            >
                <View style={styles.wrapper}>
                    {this.renderSubParts()}
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 5,
        flex: 1,
        flexDirection: 'row',
        marginBottom: 10,
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Constants.primaryColor,
        borderRadius: 10,
        height: 50,
        paddingLeft: 10,
        paddingRight: 10,
    },
    text: {
        backgroundColor: 'transparent',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
})