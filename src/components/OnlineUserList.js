import * as GraphQL from '../graphql';
import {graphql, compose} from 'react-apollo';

// TODO: Take care of loading states and network issues
function OnlineUserList({data: {getOnlineNucleusDiscoverUsers}}) {
    return (
        <View>
            {getOnlineNucleusDiscoverUsers.map(({firebaseId}) => (
                firebaseId
            ))}
        </View>
    );
}

export default getOnlineUsers = compose(
    graphql(GraphQL.GetOnlineDiscoverUsers, {
        options: {
            variables: {online: 1},
            fetchPolicy: 'network-only',
        },
    props: (props) => ({
        data: getOnlineNucleusDiscoverUsers
    })
}))(OnlineUserList);