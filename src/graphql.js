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
        fcmToken
    }
}`;

export const GetUserById = `query GetUserById($filter: OnlineUsersFilterInput, $limit: Int, $nextToken: String) {
    listOnlineUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
            firebaseId
            geohash
            online
            paid
            profilePic
            username
            fcmToken
        }
        nextToken
    }
}`

export const ListOnlineDiscoverUsers = `query ListOnlineDiscoverUsers($filter: OnlineUsersFilterInput, $limit: Int, $nextToken: String) {
    listOnlineUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
            firebaseId
            geohash
            online
            paid
            profilePic
            username
            fcmToken
        }
        nextToken
    }
}`

export const GetAllDiscoverUsers = `query GetAllDiscoverUsers($filter: TableNucleusDiscoverUsersFilterInput, $limit: Int, $nextToken: String) {
    listNucleusDiscoverUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
            firebaseId
            geohash
            online
            username
            profilePic
            fcmToken
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


export const DeleteDiscoverChat = `mutation DeleteDiscoverChats($input: DeleteNucleusDiscoverChatsInput!) {
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
            geohash
            username
        }
        recipient {
            firebaseId
            geohash
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
        author {
            firebaseId
            geohash
            username
        }
        recipient {
            firebaseId
            geohash
            username
        }
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
            username
            fcmToken
        }
        recipient
    }
}`

export const SubscribeToChatDeletion = `subscription SubscribeToChatDeletion($conversationId: String) {
    onDeleteNucleusDiscoverChats(conversationId: $conversationId) {
        conversationId
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

export const GetConnectMessages = gql`query GetPagedConnectMessages($filter: TableNucleusConnectTextsFilterInput, $limit: Int, $nextToken: String) {
    listNucleusConnectTexts(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
            conversationId
            author {
                firebaseId
                profilePic
                username
            }
            content
            messageId
            timestamp
        }
        nextToken
    }
}`

export const UpdateDiscoverUser = `mutation UpdateDiscoverUsers($input: UpdateNucleusDiscoverUsersInput!) {
    updateNucleusDiscoverUsers(input: $input) {
        online
        fcmToken
    }
}`

export const UpdateDiscoverChat = `mutation UpdateNucleusDiscoverChats($input: UpdateNucleusDiscoverChatsInput!) {
    updateNucleusDiscoverChats(input: $input) {
        conversationId
        author {
            firebaseId
            geohash
        }
        recipient
    }
}`

export const SubscribeToUpdatedChats = `subscription SubscribeToUpdateChats($conversationId: String!) {
    onUpdateNucleusDiscoverChats(conversationId: $conversationId) {
        author {
            firebaseId
            geohash
        }
        recipient
    }
}`