import React from 'react';
import { View, Alert } from 'react-native';
import { FormLabel, FormInput, Button } from 'react-native-elements';
import Constants from '../Constants';


export default class NewTrendingScreen extends React.Component {

    caption = null;
    option1 = null;
    option2 = null;
   
    _onSubmitEditingCaption = ({text}) => {
        console.log(text);
        this.caption = text;
    }

    _onSubmitEditingOption1 = ({text}) => {
        this.option1 = text;
    }

    _onSubmitEditingOption2 = ({text}) => {
        this.option2 = text;
    }

    _submitPost = () => {
        if (this.caption != null && this.option1 != null && this.option2 != null) {
            fetch('http://' + Constants.postsIp + '/add-poll', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Anonymous',
                    caption: this.caption,
                    button1Title: this.option1,
                    button2Title: this.option2,
                    button1Value: 0,
                    button2Value: 0,
                    timestamp: new Date().getTime(),
                }),
            })
            .then(res => {
                Alert.alert('Post created', 'Yay! Your post was submitted.');
            })
            .catch(err => {
                console.log(err);
                Alert.alert('Oops', 'Something went wrong. Please check your network.');
            });
        } else {
            Alert.alert('Missing fields', 'Please make sure to fill all fields before creating a post');
        }
    }

    render () {
        return (
            <View style={{justifyContent: 'center'}}>
                <FormLabel>Caption</FormLabel>
                <FormInput onChangeText={(text)=>this._onSubmitEditingCaption({text})}/>
                <FormLabel>Option 1</FormLabel>
                <FormInput onChangeText={(text)=>this._onSubmitEditingOption1({text})}/>
                <FormLabel>Option 2</FormLabel>
                <FormInput onChangeText={(text)=>this._onSubmitEditingOption2({text})}/>
                <Button
                    style={{paddingTop: 20}}
                    title={'Post'}
                    onPress={this._submitPost}
                />
            </View>
        );
    }
}