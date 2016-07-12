define(
    [
        "base/Class"
    ],
    function (Class) {
        var Dispatcher = Class.define(
            function () {
                this.listenerMap = {};
            },
            {
                remove: function (name, listener) {
                    var list = this.listenerMap[name];
                    if(list)
                    {
                        if(listener)
                        {
                            for(var i = 0, l = list.length; i < l; ++ i)
                            {
                                if(list[i] === listener)
                                {
                                    list.splice(i, 1);
                                    return;
                                }
                            }
                        }
                        else
                        {
                            delete this.listenerMap[name];
                        }
                    }
                },
                regist: function (name, listener) {
                    this.listenerMap[name] = this.listenerMap[name] || [];
                    this.listenerMap[name].push(listener);
                },
                send: function (name, data) {
                    var list = this.listenerMap[name];
                    if(list)
                    {
                        for(var i = 0, l = list.length; i < l; ++ i)
                        {
                            if(list[i])
                            {
                                if(list[i](data) === false)
                                    return false;
                            }
                            else
                            {
                                return true;
                            }
                        }
                    }
                    return true;
                }
            }
        );
        
        return Dispatcher;
    }
);
