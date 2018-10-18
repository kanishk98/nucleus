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
            profilePic
        }
        nextToken
    }
}`

export const CreateDiscoverChat = `mutation CreateNucleusDiscoverChats($input: CreateNucleusDiscoverChatsInput!) {
    createNucleusDiscoverChats(input: $input) {
        conversationId
        author {
            firebaseId
            geohash
        }
        recipient
        messageId
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
        author {
            firebaseId
            username
        }
        recipient {
            firebaseId
            username
        }
        messageId
        content
        timestamp
    }
}`

export const CreateConnectMessage = `mutation CreateNucleusConnectText($input: CreateNucleusConnectTextsInput!) {
    createNucleusConnectTexts(input: $input) {
        content
        messageId
        conversationId
        author {
            firebaseId
            profilePic
            username
        }
        timestamp
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
        content
        timestamp
    }
}`

export const SubscribeToDiscoverChats = `subscription SubscribeToDiscoverChats($recipient: String) {
    onCreateNucleusDiscoverChats(recipient: $recipient) {
        conversationId
        author {
            firebaseId
            geohash
        }
    }
}`

export const SubscribeToChatDeletion = `subscription SubscribeToChatDeletion($conversationId: String) {
    onDeleteNucleusDiscoverChats(conversationId: $conversationId) {
        conversationId
        author
    }
}`

export const SubscribeToConnectMessages = `subscription SubscribeToConnectTexts($conversationId: String!) {
    onCreateNucleusConnectTexts(conversationId: $conversationId) {
        messageId
        content
        timestamp
        author {
            firebaseId
            geohash
            username
            profilePic
        }
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