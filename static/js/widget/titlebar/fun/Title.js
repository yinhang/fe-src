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
                * @param options.text
             */
            function (options) {
                options = $.extend({
                    className: "",
                    text: "",
                }, options);
                
                this._super({
                    className: "title " + options.className,
                    html: "<h1>" + options.text + "</h1>"
                });
            },
            {
                
            },
            Fun
        );
        
        return Link;
    }
);
