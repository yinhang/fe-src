define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/modal/Dialog",
        "loadjst!widget/modal/dialog/confirm.jst"
    ],
    function ($, Class, Dialog, ConfirmTemplate) {
        
        var Confirm = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.text
                * @param options.title
                * @param options.ok {
                *     text: "确定",
                *       click: function (self) {}
                * }
                * @param options.cancel {
                *     text: "取消",
                *       click: fucntion () {}
                * }
                * 
             */
            function (options) {
                var self = this;
                options = options || {};
                options = $.extend({
                    text: "",
                    title: "确认",
                    ok: {},
                    cancel: {}
                }, options);
                
                self._super({
                    title: options.title,
                    className: "confirm",
                    content: ConfirmTemplate.render({
                        data: {
                            text: options.text
                        }
                    }),
                    buttons: [
                        {
                            text: options.ok.text || "确定",
                            click: function (d) {
                                if(options.ok.click)
                                    options.ok.click(d);
                                d.destroy();
                            }
                        },
                        {
                            text: options.cancel.text || "取消",
                            click: function (d) {
                                if(options.cancel.click)
                                    options.cancel.click(d);
                                d.destroy();
                            }
                        }
                    ]
                });
                
                self.show();
            },
            {
            },
            Dialog
        );
        
        return Confirm;
    }
);
