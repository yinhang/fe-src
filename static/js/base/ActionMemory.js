define(
    [
        "util/Cookie"
    ],
    function (Cookie) {
        
        var CUR_URL_REGEXP_STR = location.pathname.replace(/^\//, "") + location.search;
        
        /**
         * iter返回false删除action
         */
        function eachAction(iter) {
            var actionCMD = Cookie.read("actionmemory");
            if(actionCMD && actionCMD.length > 0)
            {
                var actionCMD = actionCMD.split("&");
                
                for(var i = actionCMD.length - 1; i >= 0; -- i)
                {
                    var kv = actionCMD[i].split("=");
                    if(iter(new RegExp(decodeURIComponent(kv[0])), decodeURIComponent(kv[1])) == false)
                    {
                        actionCMD.splice(i, 1);
                    }
                }
                Cookie.remove("actionmemory");
                Cookie.write("actionmemory", actionCMD.join("&"), null, "/");
            }
        };
        
        var ActionMemory = {
            /**
             * 
                * @param {Object} options
                * @param options.urlRegExpStr
                * @param options.code
             */
            save: function (options) {
                if(ActionMemory.has({
                    code: options.code,
                    urlRegExpStr: options.urlRegExpStr
                }))
                {
                    return;
                }
                var value = encodeURIComponent(options.urlRegExpStr || CUR_URL_REGEXP_STR) + "=" + encodeURIComponent(options.code);
                var savedValue = Cookie.read("actionmemory");
                if(savedValue && savedValue.length > 0)
                {
                    value = value + "&" + savedValue;
                }
                
                Cookie.remove("actionmemory");
                Cookie.write("actionmemory", value, null, "/");
            },
            /**
             * @param options.code
             * @param options.urlRegExpStr
             */
            has: function (options) {
                
                var existed = false;
                
                options.urlRegExpStr = options.urlRegExpStr || CUR_URL_REGEXP_STR;
                
                eachAction(function (urlRegExp, code) {
                    if(urlRegExp.test(options.urlRegExpStr) && options.code == code)
                    {
                        existed = true;
                    }
                });
                
                return existed;
            },
            /**
             * @param options.code
             * @param options.urlRegExpStr
             */
            remove: function (options) {
                
                options.urlRegExpStr = options.urlRegExpStr || CUR_URL_REGEXP_STR;
                
                eachAction(function (urlRegExp, code) {
                    if(urlRegExp.test(options.urlRegExpStr) && options.code == code)
                    {
                        return false;
                    }
                });
            },
            /**
             * 
                * @param {Object} options.code
                * @param options.fun
             */
            action: function (options) {
                if(ActionMemory.has({
                    code: options.code
                }))
                {
                    options.fun();
                    ActionMemory.remove({
                        code: options.code
                    });
                }
            }
        };
        
        return ActionMemory;
    }
);
