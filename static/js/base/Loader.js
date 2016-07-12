define(
    [
        "base/Class",
        "base/Dispatcher"
    ],
    function (Class, Dispatcher) {
        var Loader = Class.define(
            function (loader) {
                if(typeof loader == "function")
                {
                    this.loader = loader;
                }
                else
                {
                }
                this.eventCenter = new Dispatcher();
            },
            {
                listen: function (name, listener) {
                    this.eventCenter.regist(name, listener);
                },
                load: function (itemList, complete) {
                    var self = this;
                    var loadCount = 0;
                    var result = [];
                    for(var i = 0, l = itemList.length; i < l; ++ i)
                    {
                        var item = itemList[i];
                        self.eventCenter.send(Loader.eventName.LOAD, item);
                        self.loader((function (_item) {
                            return function (res) {
                                result.push(res);
                                ++ loadCount;
                                var eventData = {
                                    source: _item,
                                    result: result,
                                    lastLoaded: res,
                                    progress: Math.floor(loadCount / l * 100)
                                };
                                self.eventCenter.send(Loader.eventName.COMPLETE, eventData);
                                if(complete)
                                {
                                    complete(eventData);
                                }
                            };
                        })(item), item); 
                    }
                }
            }
        );
        
        Loader.eventName = {
            COMPLETE: "complete",
            LOAD: "load"
        };
        
        return Loader;
    }
);
