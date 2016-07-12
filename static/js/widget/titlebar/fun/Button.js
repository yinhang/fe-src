define(
    [
        "base/Class",
        "widget/titlebar/Fun",
        "lib/jQueryMobile",
        "Config"
    ],
    function (Class, Fun, $, Config) {
        var Button = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.className
                * @param options.html
                * @param options.onClick
                * @param options.type
                * @param options.attr
             */
            function (options) {
                options = $.extend({
                    className: "",
                    html: "",
                    onClick: function () {},
                    type: "button",
                    attr: {}
                }, options);
                
                this._super({
                    className: "button " + options.className,
                    html: "<button type='" + options.type + "'>" + options.html + "</button>"
                });
                
                var dom =  $(this.getDOM()).find("button");
                
                for(var name in options.attr)
                {
                    dom.attr(name, options.attr[name]);
                }
                
                this.getDOM().find("button").bind("click", function (e) {
                    if(options.onClick(e) != false)
                    {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                });
            },
            {
                
            },
            Fun
        );
        
        return Button;
    }
);
