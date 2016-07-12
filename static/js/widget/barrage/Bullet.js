define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        var Bullet = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.html
                * @param options.className
                * @param options.onDestroy
             */
            function (options) {
                options = options || {};
                options = $.extend({
                    className: "",
                    html: "",
                    onDestroy: function () {}
                }, options);
                
                this.dom = $("<div class='bullet " + options.className + "'></div>");
                this.setHTML(options.html);
            },
            {
                setHTML: function (html) {
                    this.dom.html(html);
                },
                show: function () {
                    this.dom.show();
                },
                destroy: function () {
                    this.dom.hide().remove();
                    this.onDestroy(this);
                },
                getDOM: function () {
                    return this.dom;
                }
            }
        );
        
        return Bullet;
    }
);
