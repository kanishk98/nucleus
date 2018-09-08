import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
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
            onlineUsers: false,
        };
    }

    componentDidMount() {
        API.graphql(graphqlOperation(GraphQL.GetOnlineDiscoverUsers), {
            online: 1
        })
        .then(res => {
            this.setState({onlineUsers: res.data.getOnlineNucleusDiscoverUsers})
        })
        .catch(err => console.log(err));
    }
    
    render() {
        let {text, onlineUsers} = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.instructions}>{onlineUsers.length} users online</Text>
            </View>
        );
    }

    componentDidUpdate() {
        console.log(this.state.onlineUsers);
        // TODO: Make button available (greyed out until component updates) for user to initiate conversation
        if (this.state.onlineUsers) {
            // this.props.navigation.navigate('Discover', {onlineUsers: this.state.onlineUsers});
        }
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
    }
});