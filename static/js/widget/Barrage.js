define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        
        var Barrage = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
             */
            function (options) {
                options = options || {};
                options = $.extend({
                    
                }, options);
                
                var self = this;
                
                $.extend(self, options);
                
                this.bullets = {};
                this.area = {
                    left: null,
                    top: null,
                    width: null,
                    height: null
                };
                
                $(window).bind("resize", function () {
                    self.resize();
                });
                
                self.resize();
            },
            {
                resize: function () {
                    var self = this;
                    var offset = self.target.offset();
                    self.area = {
                        left: offset.left,
                        top: offset.top,
                        width: self.target.width(),
                        height: self.target.height()
                    };
                },
                add: function (bullet) {
                    this.bullets[bullet] = true;
                }
            }
        );
        
        return Barrage;
    }
);
