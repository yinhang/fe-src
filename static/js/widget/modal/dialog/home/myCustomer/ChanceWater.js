define(
    [
        "lib/jQuery",
        "base/Class",
        "util/ResLoader",
        "widget/modal/Dialog",
        "loadjst!widget/modal/dialog/home/customer/ChanceHai.jst",
        "app/XHR",
        "util/TabView"
    ],
    function ($, Class, ResLoader, Dialog, ChanceHaiTemplate, XHR, TabView) {
        var ChanceHai = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.id
                * 
             */
            function (options) {
                var self = this;
                options = options || {};
                options = $.extend({
                    title: "客户详情"
                }, options);
                
                XHR.request({
                	url: "/public/getPublicClientDetail.do",
                	type: "get",
                	data: "clientId=" + options.id,
                	async: false,
                	success: function (data) {
                		if(data.code == 0)
            			{
                            self.listen("show", function (dialog) {
                                
                                var tabView = new TabView({
                                    tab: self.getDOM().find("a.tab"),
                                    view: self.getDOM().find("a.view")
                                });
                                
                                tabView.active("联系小记");
                                
                            });
                            
                			self._super({
                                title: options.title,
                                content: ChanceHaiTemplate.render({
                                    data: {
                                    	
                                    }
                                }),
                                buttons: [
                                    {
                                        text: "提取",
                                        click: function (d) {
                                        	
                                        }
                                    }
                               ]
                           });
                			
                           self.show();
                           
                           $("button.close").bind("click", function () {
                        	   self.destroy();
                           });
                           
                           $("a.handleRecord").bind("click", function(){
                        	   $("div.table-view").addClass("show-hide");
                        	   $("div.operateRecord").removeClass("show-hide");
                           });
                           
            			}
                	}
                });
            },
            {
            },
            Dialog
        );
        
        return ChanceHai;
    }
);
