import React, { PureComponent } from "react";
import { Image, TextInput, View, TouchableHighlight, StyleSheet } from "react-native";
import TouchHighlight from "./TouchHighlight";
import Constants from "../Constants";

export default class Search extends PureComponent {

    constructor() {
        super();
        this.state = {
            searchText: ''
        }
    }

    onFocus = () => {
        this.searchInput.focus();
        if (this.props.onFocus) this.props.onFocus();
    };

    clearText = () => {
        this.setState({ searchText: '' });
        this.props.onChange('');
    };

    onChange = (text) => {
        this.setState({ searchText: text });
        this.props.onChange(text);
    };

    render() {
        const { searchStyles, placeholder } = this.props;
        const { searchText } = this.state;

        return (
            <TouchableHighlight onPress={this.onFocus} activeOpacity={1} underlayColor={'white'}>
                <View style={[styles.search, searchStyles]}>
                    <Image source={require("../../assets/search.png")} style={styles.icon} />
                    <TextInput
                        placeholder={placeholder}
                        style={styles.searchText}
                        placeholderColor={'rgba(47, 54, 63, 0.5)'}
                        onFocus={this.onFocus}
                        ref={(input) => this.searchInput = input}
                        onChangeText={this.onChange}
                        value={searchText}
                        autoCorrect={false}
                    />
                    {searchText ?
                        <TouchHighlight onClick={this.clearText} styles={styles.closeContainer}>
                            <Image source={require("../../assets/close.png")} style={styles.closeButton} />
                        </TouchHighlight> : null
                    }
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    search: {
        marginTop: 8,
        marginHorizontal: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Constants.primaryColor,
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        margin: 16,
        height: 18,
        width: 18,
    },
    searchText: {
        flex: 1,
        color: 'rgb(47, 54, 63)',
        fontSize: 16,
        lineHeight: 22
    },
    closeButton: {
        width: 18,
        height: 18,
        alignSelf: 'flex-end'
    },
    closeContainer: {
        padding: 8,
    }
});