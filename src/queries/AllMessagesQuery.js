import gql from 'graphql-tag';

export default gql `
query AllMessages ($after: String!, $conversationId: ID!, $first: Int!){
    allMessages {
        message {
            author
            content
            conversationId
            messageId
            createdAt
            isSent
            recipient
            sender
            isReceived
            isRead
        } 
    }
}
`;