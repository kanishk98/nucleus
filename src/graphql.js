import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

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

// TODO: No point searching for users via ID, make REST calls to Lambda function for fetching all users

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
    CreatePost: graphql(CreatePost, {
        options: {
            refetchQueries: [{ query: FetchPosts }]
        },
        props: props => ({
            createPost: (post) => {
                return props.mutate({
                    variables: post,

                    optimisticResponse: {
                        putPost: { ...post, __typename: 'Post' }
                    }
                })
            }
        })
    }),
    FetchPosts: graphql(FetchPosts, {
        options: {
            fetchPolicy: 'network-only'
        },
        props: ({ data }) => {
            return {
                loading: data.loading,
                posts: data.allPost
            }
        }
    })
}  