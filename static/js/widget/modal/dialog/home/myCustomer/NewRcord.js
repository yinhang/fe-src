define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/modal/Dialog",
        "loadjst!widget/modal/dialog/home/customer/NewRecord.jst",
        "util/Form",
        "app/FormValidator"
    ],
    function ($, Class, Dialog, NewRecordTemplate, FormUtil, FormValidator) {
        
        var NewRecord = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.clientId
                * @param options.onOk
                * @param options.onCancel
                * 
             */
            function (options) {
                var self = this;
                options = options || {};
                options = $.extend({
                    title: "新增小记",
                    clientId: "",
                    onOk: function () {},
                    onCancel: function () {}
                }, options)
                
                var formUtil = null;
                var formValidator = null;
                
                this.listen("show", function (dialog) {
                	var form = self.getDOM().find("form");
                	formUtil = new FormUtil({
                		form: form,
                		disableAutoAjaxSubmit: true,
                		success: function (data) {
                			if(data.code == 0)
            				{
                				alert("done");
            				}
                		}
                	});
                	
                	formValidator = new FormValidator({
                		form: form
                	});
                });
                
                self._super({
                    title: options.title,
                    content: NewRecordTemplate.render({
                        data: {
                        	clientId: options.clientId
                        }
                    }),
                    buttons: [
                        {
                            text: options.ok.text || "确定",
                            click: function (d) {
                            	formValidator.validate({
                            		pass: function () {
                                    	formUtil.ajaxSubmit();
                                        d.destroy();
                            			options.onOk();
                            		}
                            	});
                            }
	                        
                        },
                        {
                            text: options.cancel.text || "取消",
                            click: function (d) {
                            	self.destroy();
                            	options.onCancel();
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
        
        return NewRecord;
    }
);
