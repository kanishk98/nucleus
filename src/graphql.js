import gql from 'graphql-tag';
import { graphql, Query } from 'react-apollo';
import renderIf from './components/renderIf';

export const CreateDiscoverUser = gql`mutation CreateNucleusDiscoverUsers($input: CreateNucleusDiscoverUsersInput!) {
    createNucleusDiscoverUsers(input: $input) {
        firebaseId
        geohash
        online
        paid
        profilePic
        username
    }
}`;

export const GetOnlineDiscoverUsers = gql`query GetOnlineNucleusDiscoverUsers($online: Int!) {
    getOnlineNucleusDiscoverUsers(online: $online) {
        firebaseId
        geohash
        online
        paid
        profilePic
        username
    }
}`;

export const CreateDiscoverConversation = gql`mutation CreateNucleusDiscoverConversation($input: CreateNucleusDiscoverConversationsInput!) {
    createNucleusDiscoverConversation(input: $input) {
        conversationId
        messageId
    }
}`;

export const CreateDiscoverMessage = gql`mutation CreateNucleusDiscoverMessage($input: CreateNucleusDiscoverMessagesInput!) {
    createNucleusDiscoverMessage(input: $input) {
        conversationId
        messageId
        author
        content
        createdAt 
        isRead 
        isReceived
        recipient
    }
}`

export const GetDiscoverMessages = gql`query getNucleusDiscoverMessages($input: CreateNucleusDiscoverMessagesInput!) {
    getNucleusDiscoverMessages(input: $input) {
        conversationId
        messageId
        author
        content
        createdAt
        isRead 
        isReceived
        recipient
    }
}`

export const operations = {
    CreateUser:graphql(CreateDiscoverUser, {
        options: {
            fetchPolicy: 'cache-and-network',
        }
    }),
    GetOnlineUsers:graphql(GetOnlineDiscoverUsers, {
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
};