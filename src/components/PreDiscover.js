import React from 'react';
import {NetInfo, Text, View, StyleSheet} from 'react-native';

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            text: "Tap anywhere to get started",
            connected: true
        };
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
    }

    componentDidMount() {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (!isConnected) {
                this.setState({"text": "Sorry, your device is offline", "connected": false});
            }
        });
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    }

    handleConnectionChange(isConnected) {
    if (isConnected) {
        this.setState({ text: "Tap anywhere to get started", connected: false });
    } else {
        this.setState({ text: "Sorry, your device is offline", connected: false });
    }
}
    render() {
        let {text, connected} = this.state;
        return (
            <View styles={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/GitHub-Mark-Light-120px-plus.png')}
                        style={styles.logo}
                    />
                </View>
                <Text style={styles.instructions}>{text}</Text>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003366',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoContainer: {
        marginTop: 40,
        justifyContent: 'center',
        flexGrow: 1,
        alignItems: 'center'
    },
    logo: {
        height: 100,
        width: 100
    },
    instructions: {
        color: 'black',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold'
    }
});