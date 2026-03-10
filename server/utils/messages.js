function formatMessage(username, text, avatar) {
    return {
        username,
        text,
        avatar, // Added optional avatar support
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}

module.exports = formatMessage;
