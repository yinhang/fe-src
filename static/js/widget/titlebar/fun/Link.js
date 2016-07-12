define(
    [
        "base/Class",
        "widget/titlebar/Fun",
        "lib/jQueryMobile",
        "Config"
    ],
    function (Class, Fun, $, Config) {
        var Link = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.className
                * @param options.html
                * @param options.onClick
                * @param options.href
             */
            function (options) {
                options = $.extend({
                    className: "",
                    html: "",
                    onClick: function () {},
                    href: "javascript: void(0)"
                }, options);
                
                this._super({
                    className: "link " + options.className,
                    html: "<a href='" + options.href + "'>" + options.html + "</a>"
                });
                
                this.getDOM().find("a").bind(Config.TAP_EVENTNAME, options.onClick);
            },
            {
                
            },
            Fun
        );
        
        return Link;
    }
);
