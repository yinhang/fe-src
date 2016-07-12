define(
    [
        "base/Class",
        "lib/jQuery"
    ],
    function (Class, $) {
        var Page = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.complete
                * @param options.getter
                * @param options.pageSize
                * @param options.totalRecord
             */
            function (options) {
                var self = this;
                options = options || {};
                options = $.extend({
                    complete: function () {
                        
                    },
                    getter: function (no, pageSize, page) {
                        var data = {};
                        self.complete(data);
                    },
                    pageSize: 5,
                    totalRecord: 0
                }, options);
                
                $.extend(self, options);
            },
            {
                setPageSize: function (pageSize) {
                    this.pageSize = pageSize;
                },
                setTotalRecord: function (totalRecord) {
                    
                },
                next: function () {
                    
                },
                prev: function () {
                    
                },
                go: function () {
                    
                }
            }
        );
        
        return Page;
    }
);
