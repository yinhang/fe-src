define(
    [
        "base/Cache",
        "lib/jQuery"
    ],
    function (Cache, $) {
        var cache = new Cache();
        
        return {
            loadCSS: function (url) {
                if(cache.has(url))
                    return false;
                var link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = url;
                document.querySelector("head").appendChild(link);
                cache.save(url, true);
                return url;
            },
            deleteCSS: function (url) {
                cache.del(url);
                $("link[href='" + url + "']").remove();
            }
        };
    }
);
