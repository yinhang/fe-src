define(
    function () {
        return {
            /**
             * 
             * @param {Object} params
             */
            setHashParam: function (params) {
                var hash = location.hash;
                for(var name in params)
                {
                    hash = hash.replace(/^\#/, "");
                    var newHash = [];
                    if(hash.length > 0)
                    {
                        hash = hash.split("&");
                        for(var i = 0, l= hash.length; i < l; ++ i)
                        {
                            var kv = hash[i].split("=");
                            if(params.hasOwnProperty(kv[0]))
                            {
                                kv[1] = params[kv[0]];
                                delete params[kv[0]];
                            }
                            newHash.push(kv.join("="));
                        }
                    }
                    for(var name in params)
                    {
                        newHash.push(name + "=" + params[name]);
                    }
                }
                location.hash = "#" + newHash.join("&");
            },
            getHashParams: function () {
                var hash = location.hash;
                var params = {};
                if(hash.length > 0)
                {
                    hash = hash.replace(/^\#/, "");
                    hash = hash.split("&");
                    for(var i = 0, l= hash.length; i < l; ++ i)
                    {
                        var kv = hash[i].split("=");
                        params[kv[0]] = kv[1];
                    }
                }
                return params;
            },
            /**
             * 
                * @param {Object} name
             */
            getHashParam: function(name) {
                var hash = location.hash;
                if(hash.length > 0)
                {
                    hash = hash.replace(/^\#/, "");
                    hash = hash.split("&");
                    for(var i = 0, l= hash.length; i < l; ++ i)
                    {
                        var kv = hash[i].split("=");
                        if(kv[0] == name)
                            return kv[1];
                    }
                }
                return "";
            }
        };
    }
);
