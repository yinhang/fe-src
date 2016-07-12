define(
    function () {
        
        var ResMap = {
            map: __RESOURCE_MAP__,
            getUri: function (path) {
                var res = ResMap.map.res[path];
                return res ? res.uri : path;
            }
        };
        
        return ResMap;
    }
);
