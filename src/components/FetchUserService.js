import React from 'react';
import {WebView} from 'react-native';

export default class FetchUserService extends React.Component {
    fetchUsers() {
        
    }
    render() {
        return (
            <WebView
                ref={el => this.webView = el}
                source={{html: '<html><body></body></html>'}}
                onMessage={this.updateUserList}
            />
        );
    }
}