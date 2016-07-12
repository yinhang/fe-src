define(
    [
        "lib/jQuery",
        "base/Cache",
        "base/EventCenter",
        "widget/Toast",
        "base/Global"
    ],
    function ($, Cache, EventCenter, Toast, Global) {
        var viewCache = new Cache();
        var pageCache = new Cache();
        
        EventCenter.listen("viewbeforechange", function (view) {
            viewCache.empty();
        });
        
        var XHR = {
            /**
             * 参数和$.ajax一致，只列出扩展出参数
                * @param {Object} options
                * @param options.noLogin
                * @param options.memcache view || page
             */
            request: function (options) {
                var _error = options.error || function () {};
                var _success = options.success || function () {};
                
                options = $.extend({
                    dataType: "json",
                    type: "get"
                }, options);
                
                if(options.type == "get")
                {
                    options.cache = false;
                }
                options.error = function () {
                    if(_error)
                    {
                        if(_error.apply(this, arguments) == false)
                            return;
                    }
                    require(
                        [
                            "widget/Toast"
                        ],
                        function (Toast) {
                            new Toast({
                                text: "哎呀我出错了！"
                            });
                        }
                    );
                };
                
                var cacheKey = options.url + "&" + options.data;
                
                options.success = function (data) {
                    if(data && data.hasOwnProperty("code"))
                    {
                        switch(parseInt(data.code))
                        {
                            case 0:
                                if(options.type != "post")
                                {
                                    switch(options.memcache)
                                    {
                                        case "view":
                                            viewCache.save(cacheKey, data);
                                        break;
                                        case "page":
                                            pageCache.save(cacheKey, data);
                                        break;
                                    } 
                                }
                                if(_success)
                                {
                                    _success.apply(this, arguments);
                                }
                                break;
                            case 14: 
                                if(options.noLogin && options.noLogin() == false)
                                {
                                    break;
                                }
                            	if(Global.source == "mobile_app")
                        		{
                            		window.location.href="hunwanjia://login";
                        		}
                            	else
                        		{
                            		location.href = data.data.loginUrl;
                        		}
                                break;
                            case -10086:
                                var msg = data.message;
                                msg = ( msg && msg.length > 0 ) ? msg : "操作失败";
                                new Toast({
                                    text: msg
                                });
                                break;
                            default:
                                if(_error.apply(this, arguments) != false)
                                {
                                    var msg = data.message;
                                    msg = ( msg && msg.length > 0 ) ? msg : "哎呀没网了!";
                                    new Toast({
                                        text: msg
                                    });
                                }
                                break;
                        }
                    }
                    else
                    {
                        require(
                            [
                                "widget/Toast"
                            ],
                            function (Toast) {
                                new Toast({
                                    text: "哎呀我出错了！"
                                });
                            }
                        );
                    }
                };
                
                if(viewCache.has(cacheKey) || pageCache.has(cacheKey))
                {
                    try {
                        options.beforeSend && options.beforeSend();
                        options.success(viewCache.fetch(cacheKey) || pageCache.fetch(cacheKey));
                        options.complete && options.complete();
                    } catch(e) {
                        options.error && options.error(e);
                        options.complete && options.complete();
                        throw e;
                    }
                    return;
                }
                
                if(window.navigator.onLine !== false)
                {
                    return $.ajax(options);
                }
                else
                {
                    try {
                        options.beforeSend && options.beforeSend();
                        options.success && options.success({
                            code: -10086,
                            message: "哎呀没网了！",
                            data: {}
                        });
                        options.complete && options.complete();
                    } catch(e) {
                        options.error && options.error(e);
                        options.complete && options.complete();
                        throw e;
                    }
                    return;
                }
            }
        };
        
        return XHR;
    }
);
