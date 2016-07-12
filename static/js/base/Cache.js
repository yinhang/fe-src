define(
    [
        "base/Class"
    ],
    function (Class) {
        var Cache = Class.define(
            function () {
                this.mem = {};
            },
            {
                save: function (key, value) {
                    this.mem[key] = value;
                },
                fetch: function (key) {
                    return this.mem.hasOwnProperty(key) ? this.mem[key] : undefined;
                },
                del: function (key) {
                    delete this.mem[key];
                },
                empty: function () {
                    this.mem = {};
                },
                has: function (key) {
                    return this.mem.hasOwnProperty(key) ? true : false;
                },
                each: function (i) {
                    for(var key in this.mem)
                    {
                        if(i(key, this.mem[key]) == false)
                        {
                            return;
                        }
                    }
                }
            }
        );
        
        return Cache;
    }
);
