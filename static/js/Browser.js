define(
    function () {
        var userAgent = navigator.userAgent.toLowerCase();
        
        var devicePixelRatio = parseInt(window.devicePixelRatio) || 1;
        
        var Browser = {
            devicePixelRatio: devicePixelRatio,
            detect: {
                "android-browser": /android/.test(userAgent),
                "ie": /msie/.test(userAgent),
                "opera": /opera/.test(userAgent),
                "firefox": /firefox/.test(userAgent),
                "ie6": /msie 6/.test(userAgent),
                "ie7": /msie 7/.test(userAgent),
                "ie8": /msie 8/.test(userAgent),
                "ie9": /msie 9/.test(userAgent),
                "ie10": /msie 10/.test(userAgent),
                "safari": /intel mac os x/.test(userAgent),
                "chrome": /chrome/.test(userAgent),
                "mobile-safari": /iphone/.test(userAgent),
                "lenovo-browser": /lenovo/.test(userAgent),
                "uc-browser": /ucbrowser/.test(userAgent)
            },
            getName: function () {
                for(var name in Browser.detect)
                {
                    if(name != "ie" && Browser.detect[name])
                        return name;
                }
                return "unknown";
            },
            addDetectClass: function () {
            	var name = Browser.getName();
            	var className = "";
            	if(name == "ie6" || name == "ie7" || name == "ie8")
        		{
            		className += " browser-ie9lower";
        		}
            	className += " browser-" + name;
                document.documentElement.className += className;
                Browser.addDetectClass = function () {};
            }
        };
        
        return Browser;
    }
);
