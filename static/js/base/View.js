define(
    [
        "base/Class",
        "lib/jQuery",
        "util/FunctionalMarker",
        "base/EventCenter"
    ],
    function (Class, $, FunctionalMarker, EventCenter) {
        
        var View = Class.define(
           /**
            * 
            * @param {Object} options
            * @param options.parent
            * @param options.tpl
            */
           function (options) {
               this.parent = $(options.parent);
               this.tpl = options.tpl;
               this.content = null;
               this.eventCenterListenerList = {};
           },
           {
               /**
                * @param options.data
                */
               render: function (options) {
                   var self = this;
                   options = options || {};
                   var curView = self.parent.data("viewobj");
                   if(curView)
                   {
                       curView.destroy();
                       self.parent.removeData("viewobj");
                   }
                   
                   self.parent.empty();
                   
                   document.documentElement.scrollTop = document.body.scrollTop = 0;
                  
                   self.parent.html(self.tpl.render({
                       data: options.data || {}
                   }));
                   
                   // if(wx)
                   // {
                       // wx.showMenuItems({
                          // menuList: [
                            // 'menuItem:readMode', // 阅读模式
                            // 'menuItem:share:timeline', // 分享到朋友圈
                            // 'menuItem:copyUrl' // 复制链接
                          // ],
                          // success: function (res) {
                            // alert('已显示“阅读模式”，“分享到朋友圈”，“复制链接”等按钮');
                          // },
                          // fail: function (res) {
                            // alert(JSON.stringify(res));
                          // }
                        // });
                   // }
                   
                   self.parent.data("viewobj", self);
                   
                   FunctionalMarker.scan();
               },
               getContent: function () {
                   return this.parent;
               },
               listenEventCenter: function (name, listener) {
                   var listenerList = this.eventCenterListenerList[name] || [];
                   EventCenter.listen(name, listener);
                   listenerList.push(listener);
                   this.eventCenterListenerList[name] = listenerList;
               },
               /**
                * 
                    * @param {Object} options
                    * @param options.parent
                */
               setParent: function (options) {
                   this.parent = options.parent;
               },
               destroy: function () {
                   if(this.parent.data("viewobj") == this)
                   {
                       this.getContent().unbind().undelegate();
                       //删除正在监听的EventCenter发出的事件
                       for(var eventName in this.eventCenterListenerList)
                       {
                           var listenerList = this.eventCenterListenerList[eventName];
                           for(var i = 0, l = listenerList.length; i < l; ++ i)
                           {
                               EventCenter.unlisten(eventName, listenerList[i]);
                           }
                       }
                       this.parent.empty();
                       this.parent.removeData("viewobj");
                       EventCenter.send("viewdestroy", this);
                   }
               }
           }
       );
       
       return View;
    }
);
