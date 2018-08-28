import * as GraphQL from '../graphql';
import {graphql} from 'react-apollo';

// TODO: Take care of loading states and network issues
function OnlineUserList({data: {getOnlineNucleusDiscoverUsers}}) {
    return (
        <ul>
            {getOnlineNucleusDiscoverUsers.map(({firebaseId}) => (
                <li key={firebaseId}></li>
            ))}
        </ul>
    );
}

export default getOnlineUsers = {
    GetOnlineNucleusUsers: graphql(GraphQL.GetOnlineDiscoverUsers, {
        options: {
            variables: {online: 1},
            fetchPolicy: 'network-only',
        }
    }),
    props: ({data: {getOnlineNucleusDiscoverUsers}}) => ({
        getOnlineNucleusDiscoverUsers
    })(OnlineUserList)
};