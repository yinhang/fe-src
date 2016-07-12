define(
    [
        "lib/jQuery",
        "base/Class",
        "util/ResLoader",
        "widget/modal/Dialog",
        "loadjst!widget/modal/dialog/home/customer/ThrowSea.jst"
    ],
    function ($, Class, ResLoader, Dialog, ThrowSeaTemplate) {
        
        var ThrowSea = Class.define(
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
                    cancel: {}
                }, options);
                
                this.listen("show", function (dialog) {
                    setTimeout(function () {
                        self.getDOM().find("textarea.input").focus();
                    }, 0);
                });
                
                function reasonInOcean(){
                	var value;
                	$("input.cause").each(function(){
                		var $this = $(this);
                    	if(this.checked){
                    		if($this.data("type") == "userinput")
                			{
                    			value = $("div.throw-sea textarea.input").val();
                			}
                    		else
                			{
                    			return $this.val();
                			}
                    	}
                    });
                	return value;
                };
                
                self._super({
                    title: options.title,
                    content: ThrowSeaTemplate.render({
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
                                    if(options.ok.click(reasonInOcean()) == false)
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
                                	self.destroy();
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
                
            },
            {
            },
            Dialog
        );
        
        return ThrowSea;
    }
);
