define(
    [
        "lib/jQuery",
        "widget/AutoComplete",
        "app/XHR",
        "base/Class"
    ],
    function ($, AutoComplete, XHR, Class) {
        
        var keywordSending = {
            
        };
        
        var RemoteAutoComplete = Class.define(
        
            /**
             * 
                * @param {Object} options
                * @param options.input
                * @param options.url
                * @param options.parser
                * @param options.onComplete
             */
            function (options) {
                options = $.extend({
                    parser: function (list) {
                        return [];
                    },
                    onComplete: function (data, result) {}
                }, options);
                var self = this;
                this.result = [];
                var autoComplete = new AutoComplete({
                    input: options.input,
                    onComplete: options.onComplete,
                    getter: function (query, complete) {
                        if(keywordSending[query])
                        {
                            return;
                        }
                        keywordSending[query] = true;
                        XHR.request({
                            memcache: "page",
                            url: options.url,
                            data: "keyword=" + query,
                            method: "get",
                            success: function (data) {
                                if(query == $(self.input).val())
                                {
                                    self.result = options.parser(data.data);
                                    complete(self.result);
                                }
                            },
                            error: function () {
                                autoComplete.clean();
                                autoComplete.hide();
                            },
                            complete: function () {
                                keywordSending[query] = false;
                            }
                        });
                        
                    }
                });
                $.extend(this, options);
            },
            {
                getKey: function () {
                    var value = $(this.input).val();
                    for(var i = 0, l = this.result.length; i < l; ++ i)
                    {
                        var item = this.result[i];
                        if(item.content == value)
                        {
                            return item.key;
                        }
                    }
                    return null;
                },
                getValue: function() {
                    return $(this.input).val();
                }
            }
        );
        
        return RemoteAutoComplete;
    }
);