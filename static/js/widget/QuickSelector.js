define(
    [
        "lib/jQueryMobile",
        "widget/Dialog",
        "base/Class"
    ],
    function ($, Dialog, Class) {
        
        var QuickSelector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.height
                * @param options.onSure
                * @param options.onShow
                * @param options.onResize
                * @param options.title
                * @param options.className
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    height: 200,
                    onSure: function () {},
                    onShow: function () {},
                    onResize: function () {},
                    title: "",
                    className: ""
                }, options);
                
                this.height = options.height;
                
                this._super({
                    className: "quick-selector " + options.className,
                    form: "bottom",
                    size: options.height,
                    onShow: options.onShow,
                    onResize: options.onResize,
                    onOverlayClick: function () {
                        self.destroy();
                    },
                    html: "<div class='box'><div class='topbar'><button class='op cancel' type='button'>取消</button><h2>" + options.title + "</h2><button class='op sure' type='button'>确定</button></div><div class='content'><div class='border'></div></div></div>"
                });
                
                $(self.getDOM()).find("button.cancel").bind("click", function () {
                    self.destroy();
                });
                
                $(self.getDOM()).find("button.sure").bind("click", function () {
                    options.onSure(self);
                });
                
                this.resize();
            },
            {
                resize: function () {
                    this._super.resize();
                    var self = this;
                    var dom = $(self.getDOM());
                    dom.find("div.content").css({
                        height: self.height - dom.find("div.topbar").outerHeight() + "px"
                    });
                },
                getContentSize: function () {
                    var self = this;
                    var content = $(self.getDOM()).find("div.border");
                    return {
                        width: content.innerWidth(),
                        height: content.innerHeight()
                    };
                },
                getContent: function () {
                    return $(this.getDOM()).find("div.border");
                }
            },
            Dialog
        );
        
        return QuickSelector;
    }
);
