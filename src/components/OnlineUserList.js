import React from 'react';
import GetOnlineUsers from '../graphql';
import { compose } from 'react-apollo';
import graphql from 'graphql-anywhere';

class OnlineUserList extends React.Component {
    componentDidMount() {
        const {loading, users} = this.props;
        console.log(JSON.stringify(users));
    }
}

export default getOnlineUsers = {
    GetOnlineUsers: graphql(GetOnlineUsers, {
        options: {
            variables: {online: 1},
            fetchPolicy: 'network-only',
        }
    }),
    props: ({data: {loading, users}}) => ({
        return (
            loading, users, 
        );
    })
}(OnlineUserList);