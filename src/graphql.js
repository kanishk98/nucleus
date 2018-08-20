import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export const CreateUser = gql`mutation CreatePost($id: ID!, $title: String!) {
	putPost(id: $id, title: $title) {
        id
        title
    }
}`

export const CreateDiscoverUser = gql`mutation CreateNucleusDiscoverUsers($input: userInput) {
    createNucleusDiscoverUsers(input: {
        firebaseId
        geohash
        online
        paid
        profilePic
        username
    })
}`;

export const CreateDiscoverUser = gql`mutation CreateNucleusDiscoverUsers(input: {
    firebaseId: 
}) {
}
}`


export const CreateDiscoverConversation = gql`mutation CreateNucleusDiscoverConversation`

//Declare your React Component level operations below
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