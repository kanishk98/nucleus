import { Text } from 'react-native';
import React from 'react';

export function renderProgress(condition, content, progress) {
    if (condition) {
        return content;
    } else {
        return progress;
    }
}

export function renderSearch(condition, searching, notSearching) {
    if (condition) {
        return searching;
    } else {
        return notSearching;
    }
}

export function renderOnline(online) {
    if (online === 1) {
        return (<Text>   online</Text>);
    } else {
        return (<Text>   offline</Text>);
    }
}