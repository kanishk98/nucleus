import gql from 'graphql-tag';

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

export const GetOnlineDiscoverUsers = `query GetOnlineNucleusDiscoverUsers($online: Int) {
    getOnlineNucleusDiscoverUsers(online: $online) {
        firebaseId
        geohash
        online
        paid
        profilePic
        username
    }
}`;

export const CreateDiscoverChat = gql`mutation CreateNucleusDiscoverChats($input: CreateNucleusDiscoverChatsInput!) {
    createNucleusDiscoverChats(input: $input) {
        conversationId
    }
}`;

export const GetDiscoverChat = gql`query GetDiscoverChat($input: CreateNucleusDiscoverChatsInput!) {
    getNucleusDiscoverChat(input: $input) {
        conversationId
        messageId
    }
}`;

export const CreateDiscoverMessage = `mutation CreateNucleusDiscoverMessage($input: CreateNucleusDiscoverMessagesInput!) {
    createNucleusDiscoverMessages(input: $input) {
        conversationId
        messageId
        content
        createdAt 
        isRead 
        isReceived
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

export const SubscribeToDiscoverMessages = `subscription SubscribeToDiscoverMessages($conversationId: String!) {
    onCreateNucleusDiscoverMessages(conversationId: $conversationId, messageId: "shady") {
        messageId
    }
}`