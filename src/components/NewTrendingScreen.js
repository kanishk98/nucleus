import React from 'react';
import { View } from 'react-native';
import { FormLabel, FormInput, Button } from 'react-native-elements';


export default class NewTrendingScreen extends React.Component {
   
    _onSubmitEditing = () => {
        console.log('editing done');
    }

    render () {
        return (
            <View style={{justifyContent: 'center', backgroundColor: 'white'}}>
                <FormLabel>Caption</FormLabel>
                <FormInput onSubmitEditing={this._onSubmitEditing}/>
                <FormLabel>Option 1</FormLabel>
                <FormInput onSubmitEditing={this._onSubmitEditing}/>
                <FormLabel>Option 2</FormLabel>
                <FormInput onSubmitEditing={this._onSubmitEditing}/>
                <Button
                    style={{paddingTop: 20}}
                    title={'Post'}
                    onPress={console.log('posted')}
                />
            </View>
        );
    }
}