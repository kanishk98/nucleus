import React from 'react';
import { Message } from './Message';
import * as GraphQL from '../graphql';
import { noFilter } from './SpecificChatList';
import { FlatList } from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { connectClient } from '../../App';

export default class SpecificTextScreen extends React.Component {

    static noFilter = {
        conversationId: {ne: 'null'}
    }
    
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        }
    }

    componentWillMount() {
         this.fetchMoreMessages();
    }
    
    fetchMoreMessages = () => {
        connectClient.query({
            query: GraphQL.GetConnectMessages, 
            options: {
                variables: {filter: SpecificTextScreen.noFilter},
                fetchPolicy: 'cache-and-network',
            }
        })
        .then(res => {
            console.log(res);
            this.setState({messages: res.data.listNucleusConnectMessages.items});
            if (res.data.listNucleusConnectMessages.nextToken != null) {
                // start background operation to fetch more data
                // TODO: is this really needed or should we just fetch when 
                // user scrolls upwards?

            }
        })
        .catch(err => {
            console.log(err);
        })
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