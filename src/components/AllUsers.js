import React from 'react';
import { API, graphqlOperation } from '../../node_modules/aws-amplify';
import { GetAllDiscoverUsers }from '../graphql';

export default class AllUsers extends React.Component {

    

    componentDidMount() {
        if (this.state.nextToken == null || this.state.nextToken == 'undefined') {
            console.log('no nextToken available yet');
            // fetch user list
            // TODO: Change below method to standard Apollo technique
            // TODO: Use cache-and-network policy
            API.graphql(graphqlOperation(GetAllDiscoverUsers, {filter: noFilter}))
            .then(res => {
                console.log(res);
                if (res.data.nextToken != null) {
                    // start background operation to fetch more data
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    render() {

    }
}