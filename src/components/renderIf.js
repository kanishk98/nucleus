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
        console.log('Condition true');
        return searching;
    } else {
        console.log('Condition false');
        return notSearching;
    }
}

export function renderResults(condition, results, noResults) {
    if (condition) {
        return results;
    } else {
        return noResults;
    }
}

export function renderOnline(online) {
    if (online === 1) {
        return (<Text>   online</Text>);
    } else {
        return (<Text>   offline</Text>);
    }
}