(function () {
    
    define({
        load: function (name, _require, onload, config) {
            _require(
                [
                    "lib/jQuery",
                    "base/Global"
                ],
                function ($, Global) {
                    var reqPackNameList =  $.trim(name).replace(/[\s]*\,[\s]*/g, ",").split(",");
                    var comboPackNameList = [];
                    
                    for(var i = 0, l = reqPackNameList.length; i < l; ++ i)
                    {
                        var packName = reqPackNameList[i];
                        if(packName.indexOf("!") == -1 && requirejs.defined(packName) == false && requirejs.specified(packName) == false && config.comboSpecified[packName] != true)
                        {
                            config.comboSpecified[packName] = true;
                            var shim = config.shim[packName];
                            if(shim)
                            {
                                packName = ( ( shim.exports || "" ) + ":" + packName );
                            }
                            comboPackNameList.push(packName);
                        }
                    }
                    
                    if(comboPackNameList.length > 0)
                    {
                    
                        comboPackNameList = "p=" + comboPackNameList.join("&p=");
                        
                        var script = document.createElement("script");
                        script.type = "text/javascript";
                        
                        script.onload = function () {
                            _require.call(window, reqPackNameList, function () {
                                onload(arguments);
                            });
                        };
                        
                        script.src = "http://" + __hostname + __port + "/combo.js?" + comboPackNameList + "&v=" + Global.version;
                        var head = document.head || document.body.head;
                        head.appendChild(script);
                        
                    }
                    else
                    {
                        _require.call(window, reqPackNameList, function () {
                            onload(arguments);
                        });
                    }
                }
            );
        }    
    });
})();
