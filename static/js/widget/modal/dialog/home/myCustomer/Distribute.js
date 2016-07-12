define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/modal/Dialog",
        "loadjst!widget/modal/dialog/home/customer/Distribute.jst",
        "app/XHR",
        "widget/Toast"
    ],
    function ($, Class, Dialog, DistributeTemplate, XHR, Toast) {
        
        var Distribute = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.onOk
                * @param options.onCancel
                * @param options.clientId
             */
            function (options) {
                var self = this;
                options = options || {};
                options = $.extend({
                    onOk: function () {},
                    onCancel: function () {}
                }, options);
                
                XHR.request({
                	url: "/client/getSellerList.do",
                	async: false,
                	
                	success: function (data) {
                		if(data.code == 0)
            			{
                            self._super({
                                title: "客户分配",
                                content: DistributeTemplate.render({
                                    data: data.data.sellerList
                                }),
                                buttons: [
                                    {
                                        text: "取消",
                                        click: function (d) {
                                            d.destroy();
                                        	options.onCancel();
                                        }
                                    }
                                ]
                            });
                            self.show();
                            
                            self.getDOM().find("li a").bind("dblclick", function () {
                                var $this = $(this);
                                XHR.request({
                                    url: "/client/allocateClient.do",
                                    type: "post",
                                    async: false,
                                    data: "clientIdInfo=" + options.clientId + "&uid=" + $this.data("id"),
                                    success: function (data) {
                                        if(data.code == 0)
                                        {
                                            self.destroy();
                                            new Toast({
                                                text: "成功分配给：" + $this.data("name"),
                                                onDestroy: function () {
                                                    location.reload();
                                                }
                                            });
                                        }
                                    }
                                });
                            });
            			}
                	}
                });
                
            },
            {
            },
            Dialog
        );
        
        return Distribute;
    }
);
