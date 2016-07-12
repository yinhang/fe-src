define(
    [
        "lib/jQueryMobile",
        "widget/Dialog",
        "base/Class"
    ],
    function ($, Dialog, Class) {
        
        var QuickPanel = Class.define(
            /**
             * 
                * @param {Object} options
                * @param buttons [
                *   {
                *       type: "button",
                *       text: "确认",
                *       onClick: function () {
                *     
                *       }
                *   },
                *   {
                *       type: "link",
                *       text: "呵呵",
                *       href: "http://www.baidu.com"
                *   }
                * ]
             */
            function (options) {
                
                var self = this;
                
                options = $.extend({
                    
                }, options);
                
                var functionHeight = 44;
                
                var height = 0;
                
                var html = "<div class='user-function' style='margin-bottom: 2px;'>";
                
                height += 2;
                
                var buttons = options.buttons;
                
                for(var i = 0, l = buttons.length; i < l; ++ i)
                {
                    var button = buttons[i];
                    switch(button.type)
                    {
                        case "link":
                            button.href = button.href || "javascript: void(0);";
                        	html += "<a target=" + button.target + " href='" + button.href + "' data-index=" + i + " style='line-height: " + functionHeight + "px; display: block; height: " + functionHeight + "px; width: 100%; margin-bottom: 1px;'>" + button.text + "</a>";
                            break;
                        case "button":
                            html += "<button type='button' data-index=" + i + " style='line-height: " + functionHeight + "px; display: block; height: " + functionHeight + "px; width: 100%; margin-bottom: 1px;'>" + button.text + "</button>";
                            break;
                    }
                    height += (functionHeight + 1);
                    html += "";
                }
                
                html += "</div>";
                
                html += "<button type='button' class='close' style='height: " + functionHeight + "px; width: 100%;'>取消</button>";
                
                height += functionHeight;
                
                this._super({
                    className: "quick-panel",
                    form: "bottom",
                    size: height,
                    onShow: options.onShow,
                    onResize: options.onResize,
                    html: html,
                    onOverlayClick: function () {
                        self.destroy();
                    }
                });
                
                $(this.getDOM()).find("button.close").bind("click", function () {
                    self.destroy();
                });
                
                for(var i = 0, l = buttons.length; i < l; ++ i)
                {
                    var button = buttons[i];
                    if(button.onClick)
                    {
                        $(self.getDOM()).find("[data-index='" + i + "']").bind("click", (function (_button) {
                            return function () {
                                _button.onClick(self);
                            };
                        })(button));
                    }
                }
                
                this.show();
            },
            {
                
            },
            Dialog
        );
        
        return QuickPanel;
    }
);
