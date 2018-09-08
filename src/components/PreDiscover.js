import React from 'react';
import {Text, View, StyleSheet, Button} from 'react-native';
import * as GraphQL from '../graphql';
import {client} from '../../App';
import {API, graphqlOperation} from 'aws-amplify';

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.props.signedInUser = this.props.navigation.getParam("signedInUser", null);
        this.state={
            text: "Tap anywhere to get started",
            connected: true,
            onlineUsers: [],
        };
    }

    startDiscover = () => {
        let {onlineUsers} = this.state;
        console.log(this.state);
        // TODO: Make button available (greyed out until component updates) for user to initiate conversation
        if (onlineUsers && onlineUsers.length > 1) {
            // this.props.navigation.navigate('Discover', {onlineUsers: this.state.onlineUsers});
            randUser = Math.floor(Math.random() * onlineUsers.length);
            console.log(onlineUsers[randUser]);
        }
    }

    componentDidMount() {
        API.graphql(graphqlOperation(GraphQL.GetOnlineDiscoverUsers), {
            online: 1
        })
        .then(res => {
            let temp = res.data.getOnlineNucleusDiscoverUsers.filter(item => item!==this.props.signedInUser);
            console.log(temp);
            this.setState({onlineUsers: temp});
        })
        .catch(err => console.log(err));
    }
    
    render() {
        let {text, onlineUsers} = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.instructions}>{onlineUsers.length} users online</Text>
                <Button style={styles.connectButton} onPress={this.startDiscover} title={"Get started"}/>
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
        color: 'white',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center'
    },
    connectButton: {
        backgroundColor: 'white',
        fontSize: 18,
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: 10,
    }
});