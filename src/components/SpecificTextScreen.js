import React from 'react';
import { Message } from './Message';
import { connectClient } from '../../App';
import * as GraphQL from '../graphql';
import { noFilter } from './SpecificChatList';
import { FlatList } from 'react-native';

export default class SpecificTextScreen extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            conversations: [],
        }
    }

    componentWillMount() {
         this.fetchMoreMessages();
    }
    
    fetchMoreMessages = () => {
        connectClient.query({
            query: GraphQL.GetConnectMessages,
            options: {
                variables: {filter: noFilter},
                fetchPolicy: 'cache-and-network',
            }
        })
        .then(res => {
            console.log(res);
            this.setState({conversations: this.state.conversations});
        })
        .catch(err => {
            console.log(err);
        });
    }

    renderItem = ({item}) => (
        <Message id={item.messageId} sent={item.sender} />
    )

    render() {
        return (
            <FlatList
                data={this.state.conversations}
                renderItem={this.renderItem}
                onMomentumScrollBegin={this.fetchMoreMessages}
            />
        );
    }
} 