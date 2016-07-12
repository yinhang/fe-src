define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/Modal",
        "loadjst!widget/modal/dialog.jst",
        "util/FunctionalMarker"
    ],
    function ($, Class, Modal, DialogTemplate, FunctionalMarker) {
        
        var Dialog = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.title
                * @param options.content
                * @param options.data
                * @param options.className
                * @param options.buttons [{
                *     text: "确定",
                *       className: "ok",
                *     click: function (self) {},
                *     closeDialog: false
                * }]
                * 
             */
            function (options) {
                this._super({
                    html: ""
                });
                
                options = options || {};
                options = $.extend({
                    title: null,
                    content: "",
                    buttons: [],
                    data: undefined
                }, options);
                
                this.setData({
                    data: options.data
                });
                
                var self = this;
                
                self.completed = false;
                
                self.setHTML({
                    html: DialogTemplate.render({
                        data: {
                            title: options.title,
                            content: options.content,
                            buttons: options.buttons
                        }
                    })
                });
                self.adjust();
                var content = self.getDOM();
                content.addClass(options.className);
                for(var i = 0, l = options.buttons.length; i < l; ++ i)
                {
                    var button = options.buttons[i];
                    if(button.click)
                    {
                        content.find("input[data-index='" + i + "']").bind("click", (function (_button) {
                            return function (e) {
                                _button.click(self);
                                if(_button.closeDialog == true)
                                {
                                    self.hide();
                                }
                                e.stopPropagation();
                            };
                        })(button));
                    }
                }
                self.completed = true;
                self.listen("show", function () {
                    FunctionalMarker.scan();
                });
                if(self.shown())
                {
                    self.send("show", self);
                }
            },
            {
                destroy: function () {
                    this._super.destroy();
                },
                show: function () {
                    if(this.completed)
                        this.send("show", this);
                    this._super.show();
                },
                /**
                 * @param options.title
                 */
                setTitle: function (options) {
                    this.getDOM().find("h1.title").html(options.title);
                },
                /**
                 * @param options.content
                 */
                setContent: function (options) {
                    this.getDOM().find("div.content").html(options.content);
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.data
                 */
                setData: function (options) {
                    this.data = options.data;
                },
                getData: function () {
                    return this.data;
                }
            },
            Modal
        );
        
        return Dialog;
    }
);
