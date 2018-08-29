import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {UserFirebaseId} from '../graphql';
import {graphql} from 'react-apollo';
import * as GraphQL from '../graphql';
import {client} from '../../App';


/*const getOnlineUsers = graphql(GraphQL.GetOnlineDiscoverUsers, {
    options: {
        variables: {online: 1},
        fetchPolicy: 'network-only',
    }, 
    props : ({ data: { getOnlineNucleusDiscoverUsers } }) => ({
        getOnlineNucleusDiscoverUsers, 
      }),
    })(UserFirebaseId);*/


export default class PreDiscover extends React.Component {
    
    constructor(props) {
        super(props);
        this.state={
            text: "Tap anywhere to get started",
            connected: true,
            user: false,
        };
    }

    componentDidMount(){
        debugger
        client.query({
            query: GraphQL.GetOnlineDiscoverUsers, 
            options: {
                variables: {online: Number(1)},
                fetchPolicy: 'network-only',
            }
        })
        .then(res => {
            this.setState({user: res.data.getOnlineNucleusDiscoverUsers[0]})
        })
        .catch(err => console.log(err));
    }
    
    render() {
        let {text, user} = this.state;
        // console.log(UserFirebaseId());
        return (
            <View style={styles.container}>
                <Text style={styles.instructions}>{user ? user.firebaseId : null}</Text>
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
    }
});