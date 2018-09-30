import gql from 'graphql-tag';

export const CreateDiscoverUser = `mutation CreateNucleusDiscoverUsers($input: CreateNucleusDiscoverUsersInput!) {
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

export const GetAllDiscoverUsers = `query GetAllDiscoverUsers($filter: TableNucleusDiscoverUsersFilterInput, $limit: Int, $nextToken: String) {
    listNucleusDiscoverUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
            firebaseId
            geohash
            online
            username
        }
        nextToken
    }
}`

export const CreateDiscoverChat = `mutation CreateNucleusDiscoverChats($input: CreateNucleusDiscoverChatsInput!) {
    createNucleusDiscoverChats(input: $input) {
        conversationId
        author
        recipient
    }
}`;


export const DeleteDiscoverChat = `mutation DeleteDiscoverChats($input: CreateNucleusDiscoverChatsInput!) {
    deleteNucleusDiscoverChats(input: $input) {
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
        author
        recipient
    }
}`

export const CreateConnectMessage = `mutation CreateNucleusConnectMessage($input: CreateNucleusConnectMessagesInput!) {
    createNucleusConnectMessages(input: $input) {
        conversationId
        messageId
        author {
            online
        }
        recipient {
            online
        }
        timestamp
        content
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
    onCreateNucleusDiscoverMessages(conversationId: $conversationId) {
        messageId
    }
}`

export const SubscribeToDiscoverChats = `subscription SubscribeToDiscoverChats($recipient: String) {
    onCreateNucleusDiscoverChats(recipient: $recipient) {
        conversationId
        author
    }
}`

export const SubscribeToChatDeletion = `subscription SubscribeToChatDeletion($conversationId: String) {
    onDeleteNucleusDiscoverChats(conversationId: $conversationId) {
        conversationId
        author
    }
}`

export const SubscribeToConnectMessages = `subscription SubscribeToConnectMessages($conversationId: String!) {
    onCreateNucleusConnectMessages(conversationId: $conversationId) {
        conversationId
        messageId
        content
        author
        recipient
    }
}`

export const GetConnectMessages = gql`query GetPagedConnectMessages($filter: TableNucleusConnectMessagesFilterInput, $limit: Int, $nextToken: String) {
    listNucleusConnectMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
            conversationId
        }
        nextToken
    }
}`