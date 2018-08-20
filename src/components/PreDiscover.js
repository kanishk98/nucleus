import React from 'react';
import {NetInfo, Text, View} from 'react-native';

export default class PreDiscover extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            "text": "Tap anywhere to get started",
            "connected": true
        };
    }
    componentDidMount() {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (!isConnected) {
                this.setState({"text": "Sorry, your device is offline", "connected": false});
            }
        });
        function handleConnectionChange(isConnected) {
            if (isConnected) {
                this.setState({"text": "Tap anywhere to get started", "connected": false});
            } else {
                this.setState({"text": "Sorry, your device is offline", "connected": false});
            }
        }
        NetInfo.isConnected.addEventListener('connectionChange', handleConnectionChange);
    }
    render() {
        let {text, connected} = this.state;
        return (
            <View>
                <Text>{text}</Text>
            </View>
        );
    }
}