import React from 'react';
import {Text, View, StyleSheet, Button} from 'react-native';
import * as GraphQL from '../graphql';
import {client} from '../../App';
import {API, graphqlOperation} from 'aws-amplify';

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            text: "Tap anywhere to get started",
            connected: true,
            onlineUsers: [],
        };
    }

    startDiscover = () => {
        let {onlineUsers} = this.state;
        let user = this.props.navigation.getParam("signedInUser", null);
        console.log(this.state);
        // TODO: Make button available (greyed out until component updates) for user to initiate conversation
        if (onlineUsers && onlineUsers.length > 1) {
            // this.props.navigation.navigate('Discover', {onlineUsers: this.state.onlineUsers});
            randUser = Math.floor(Math.random() * onlineUsers.length);
            if(onlineUsers[randUser].firebaseId === user.firebaseId) {
                randUser = randUser + 1;
                try {
                        if (onlineUsers[randUser] == null) {
                        console.log("Undefined user, switching back");
                        randUser = randUser - 2;
                    }
                } catch (error) {
                    console.log(error);
                    randUser = randUser - 2;
                }
            }
            console.log(onlineUsers[randUser]);
            let connectedUser = onlineUsers[randUser];
            // TODO: Create conversationId and a new UserConversation
            let chatId = user.firebaseId + connectedUser.firebaseId + String(Math.floor(new Date().getTime()/1000));
            console.log('Initiating chat: ' + chatId);
            this.props.navigation.navigate('Discover', {randomUser: connectedUser, conversationId: chatId});
        }
    }

    componentDidMount() {
        API.graphql(graphqlOperation(GraphQL.GetOnlineDiscoverUsers), {
            online: 1
        })
        .then(res => {
            let temp = res.data.getOnlineNucleusDiscoverUsers;
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