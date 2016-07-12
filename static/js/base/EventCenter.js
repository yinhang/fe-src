define(
    [
        "base/Dispatcher"
    ],
    function (Dispatcher) {
        var dispatcher = new Dispatcher();
        
        var Event = {
            unlisten: function (name, listener) {
                dispatcher.remove(name, listener);
            },
            listen: function (name, listener) {
                dispatcher.regist(name, listener);
            },
            send: function (name, data) {
                return dispatcher.send(name, data);
            },
            listenOnce: function (name, listener) {
                var _listener = listener;
                listener = function () {
                    _listener.apply(this, arguments);
                    dispatcher.remove(name, listener);
                };
                dispatcher.regist(name, listener);
            }
        };
        
        return Event;
    }
);
