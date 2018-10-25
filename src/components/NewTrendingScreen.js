import React from 'react';
import { View, Alert } from 'react-native';
import { FormLabel, FormInput, Button } from 'react-native-elements';
import Constants from '../Constants';
import { renderSearch } from './renderIf';

export default class NewTrendingScreen extends React.Component {

    caption = null;
    option1 = null;
    option2 = null;
   
    constructor(props) {
        super(props);
        this.state = {
            caption: '',
            option1: '',
            option2: '',
        }
    }

    _onSubmitEditingCaption = ({text}) => {
        console.log(text);
        this.setState({caption: text})
        this.caption = text;
    }

    _onSubmitEditingOption1 = ({text}) => {
        this.setState({option1: text});
        this.option1 = text;
    }

    _onSubmitEditingOption2 = ({text}) => {
        this.setState({option2: text});
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
        console.log(this.state);
        return (
            <View style={{backgroundColor: 'white', flex: 1}}>
                <FormLabel>Caption</FormLabel>
                <FormInput inputStyle={{color: 'black', fontWeight: 'bold'}} onChangeText={(text)=>this._onSubmitEditingCaption({text})} underlineColorAndroid={Constants.secondaryColor} placeholder='What are you thinking about?'/>
                <FormLabel>First response</FormLabel>
                <FormInput inputStyle={{ color: 'black', fontWeight: 'bold'}} onChangeText={(text)=>this._onSubmitEditingOption1({text})} underlineColorAndroid={Constants.secondaryColor} placeholder='Yes/yeah/yay/Shanjana'/>
                <FormLabel>Second response</FormLabel>
                <FormInput inputStyle={{ color: 'black', fontWeight: 'bold'}} onChangeText={(text)=>this._onSubmitEditingOption2({text})} underlineColorAndroid={Constants.secondaryColor} placeholder='No/nah/nay/Sneha'/>
                {renderSearch((!!this.state.option1 && this.state.option1.length > 0 && !!this.state.option2 && this.state.option2.length > 0 && !!this.state.caption && this.state.caption.length > 0), 
                    <Button
                        borderRadius={15}
                        style={{ paddingTop: 20 }}
                        backgroundColor={Constants.primaryColor}
                        title={'Post'}
                        onPress={this._submitPost}
                    />, 
                    <Button
                        borderRadius={15}
                        style={{ paddingTop: 20 }}
                        backgroundColor={'gray'}
                        title={"Post"}
                    />
                )}
            </View>
        );
    }
}