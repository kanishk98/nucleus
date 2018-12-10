import React from 'react';
import {
  TouchableHighlight,
} from 'react-native';

export default TouchHighlight = (props) => (
    <TouchableHighlight style={props.styles} underlayColor={'rgb(249, 250, 251)'} onPress={props.onClick}>
      {props.children}
    </TouchableHighlight>
);