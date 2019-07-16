/* istanbul ignore next */
const noop = () => void(0);

let onOpen, onClose, onMessage, onError;

/* istanbul ignore next */
function listen(listener) {
    if (listener) {
        onOpen = listener.onOpen;
        onClose = listener.onClose;
        onMessage = listener.onMessage;
        onError = listener.onError;
    } else {
        onOpen = noop;
        onClose = noop;
        onMessage = noop;
        onError = noop;
    }
}

/* istanbul ignore next */
function bind() {
    my.onSocketOpen(result => onOpen(result));
    my.onSocketClose(result => onClose(result));
    my.onSocketMessage(result => onMessage(result));
    my.onSocketError(error => onError(error));
}

listen(null);
bind();

module.exports = { listen };