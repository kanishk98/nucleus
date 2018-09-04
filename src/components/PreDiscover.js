import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import * as GraphQL from '../graphql';
import {client} from '../../App';
import {API, graphqlOperation} from 'aws-amplify';

export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            text: "Tap anywhere to get started",
            connected: true,
            user: false,
        };
    }

    componentDidMount() {
        API.graphql(graphqlOperation(GraphQL.GetOnlineDiscoverUsers), {
            online: 1
        })
        .then(res => {
            this.setState({user: res.data.getOnlineNucleusDiscoverUsers[0]})
        })
        .catch(err => console.log(err));
    }
    
    render() {
        let {text, user} = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.instructions}>{user? user.firebaseId: null}</Text>
            </View>
        );
    }

    componentDidUpdate() {
        console.log(this.state.user);
        // TODO: Make button available (greyed out until component updates) for user to initiate conversation
        if (this.state.user) {
            this.props.navigation.navigate('Discover', {user: this.state.user});
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