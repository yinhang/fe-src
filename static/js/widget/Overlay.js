define(
    [
        "lib/jQuery",
        "vendor/jQueryColor",
        "base/Class"
    ],
    function ($, $, Class) {
        
        var Overlay = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.className
                * @param options.html
                * @param options.onClick
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    className: "",
                    html: "",
                    onClick: function () {}
                }, options);
                
                this.dom = $("<div class='overlay " + options.className + "' style='background-color: rgba(0,0,0,0); position: fixed; display: none; width: 100%; height: 100%; top: 0px; left: 0px;z-index: 20000; bottom: 0px; right: 0px;'>" + options.html + "</div>");
                
                this.dom.bind("click", function () {
                    options.onClick(self);
                });
                
                $(document.body).append(this.dom);
            },
            {
                show: function () {
                    this.dom.css({
                        display: "block"
                    });
                    this.dom.animate({
                        backgroundColor: jQuery.Color( "rgba(0,0,0,0.6)" )
                    }, 80, "swing");
                },
                hide: function (complete) {
                    var self = this;
                    
                    this.dom.animate({
                        backgroundColor: jQuery.Color( "rgba(0,0,0,0)" )
                    }, 60, "swing", function () {
                        self.dom.css({
                            display: "none"
                        });
                        complete && complete(self);
                    });
                },
                destroy: function () {
                    var self = this;
                    self.hide(function () {
                        self.dom.remove();
                    });
                },
                getZIndex: function () {
                    this.dom.css("zIndex");
                }
            }
        );
        
        return Overlay;
    }
);
