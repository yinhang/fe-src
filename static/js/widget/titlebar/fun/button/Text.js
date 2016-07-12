define(
    [
        "base/Class",
        "widget/titlebar/fun/Button",
        "lib/jQueryMobile"
    ],
    function (Class, TitleBarButton, $) {
        var TextButton = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.onClick
                * @param options.text
             */
            function (options) {
                options = options || {};
                
                this._super({
                    className: "text",
                    onClick: options.onClick
                });
                
                this.getDOM().find("button").attr("data-text", options.text);
            },
            {
                
            },
            TitleBarButton
        );
        
        return TextButton;
    }
);
