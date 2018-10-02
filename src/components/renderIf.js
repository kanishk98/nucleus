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