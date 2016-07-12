define(
    [
        "lib/jQuery",
        "base/Class",
        "util/ResLoader",
        "widget/modal/Dialog",
        "loadjst!widget/modal/dialog/prompt.jst"
    ],
    function ($, Class, ResLoader, Dialog, PromptTemplate) {
        
        var Prompt = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.detail
                * @param options.inputTip
                * @param options.title
                * @param options.inputDefaultText
                * @param options.ok {
                *     text: "确认",
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
                    detail: "",
                    inputTip: "",
                    title: "输入",
                    ok: {},
                    inputDefaultText: "",
                    cancel: {},
                }, options);
                
                this.listen("show", function (dialog) {
                    setTimeout(function () {
                        self.getDOM().find("textarea.input").focus();
                    }, 0);
                });
                
                self._super({
                    title: options.title,
                    content: PromptTemplate.render({
                        data: {
                            detail: options.detail,
                            inputTip: options.inputTip,
                            inputDefaultText: options.inputDefaultText
                        }
                    }),
                    buttons: [
                        {
                            text: options.ok.text || "确定",
                            click: function (d) {
                                if(options.ok.click)
                                {
                                    if(options.ok.click(self.getDOM().find("div.prompt textarea.input:first").val(), self.getDOM().find("div.prompt input.common").attr("value")) == false)
                                        return;
                                }
                                d.destroy();
                            }
	                        
                        },
                        {
                            text: options.cancel.text || "取消",
                            click: function (d) {
                                if(options.cancel.click)
                                {
                                    if(options.cancel.click(self.getDOM().find("div.prompt textarea.input:first").val()) == false)
                                        return;
                                }
                                d.destroy();
                            }
                        }
                    ]
                });
                self.show();
                $("button.close").bind("click", function () {
                    self.destroy();
                });
                $("input.common").bind("click", function() {
                	if(this.checked){
                		dataQuality = $("input.common").attr("value");
                	}
                		
                })
                
            },
            {
            },
            Dialog
        );
        
        return Prompt;
    }
);
