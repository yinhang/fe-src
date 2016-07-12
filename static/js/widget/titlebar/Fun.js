define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        var Fun = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.className
                * @param options.html
             */
            function (options) {
                options = $.extend({
                    className: "",
                    html: ""
                }, options);
                
                this.dom = $("<div class='" + options.className + "'>" + options.html + "</div>");
            },
            {
                getDOM: function () {
                    return this.dom;
                }
            }
        );
        
        return Fun;
    }
);
