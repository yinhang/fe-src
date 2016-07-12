define(
    function () {
        var ArrayUtil = {
            unique: function () {
                var newArr = [];
                var exist = {};
                for(var ai = 0, al = arguments.length; ai < al; ++ ai)
                {
                    var arr = arguments[ai];
                    for(var i = 0, l = arr.length; i < l; ++ i)
                    {
                        var em = arr[i];
                        if(exist[em])
                            continue;
                        newArr.push(em);
                        exist[em] = true;
                    }
                }
                return newArr;
            }
        };
        
        return ArrayUtil;
    }
);
