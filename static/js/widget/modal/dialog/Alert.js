define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/modal/Dialog",
        "loadjst!widget/modal/dialog/alert.jst"
    ],
    function ($, Class, Dialog, AlertTemplate) {
        
        var Alert = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.text
                * @param options.title
                * @param options.ok
                * 
             */
            function (options) {
                options = options || {};
                options = $.extend({
                    text: "",
                    title: "提示"
                }, options);
                
                this._super({
                    title: options.title,
                    className: "alert",
                    content: AlertTemplate.render({
                        data: {
                            text: options.text
                        }
                    }),
                    buttons: [
                        {
                            text: "确定",
                            className: "ok",
                            click: function (d) {
                                if(options.ok)
                                    options.ok();
                                d.destroy();
                            }
                        }
                    ]
                });
                
                this.show();
            },
            {
            },
            Dialog
        );
        
        return Alert;
    }
);
