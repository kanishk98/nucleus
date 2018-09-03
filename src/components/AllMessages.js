import React from 'react';

export default class AllMessages extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            messagesInState: []
        }
    }
    static defaultProps = {
        messages: [],
        subscribeToDiscoverMessages: () => null,
    }

    componentWillMount() {
        this.props.subscribeToDiscoverMessages();
    }

    render() {
        console.log(this.props);
        const {messages} = this.props;
        return (
            <View>
                <Text>
                {messages}</Text>
            </View>
        )
    }
}