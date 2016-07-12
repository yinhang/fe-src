define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/Modal",
        "Config"
    ],
    function ($, Class, Modal, Config) {
        
        var PictureViewer = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.srcList
             */
            function (options) {
               var self = this;
               
               this.bodytap_handle = function (e) {
                   self.destroy();
                   e.stopPropagation();
                   e.preventDefault();
                   return false;
               };
               
               this.bodytouchstart_handle = function (e) {
                   e.preventDefault();
               };
               
               this._super({
                   className: "picture-viewer",
                   html: "<div class='viewer'><img/></div>",
                   onShow: function () {
                       $(document.body).bind(Config.TAP_EVENTNAME, self.bodytap_handle);
                       $(document.body).bind("touchstart", self.bodytouchstart_handle);
                   }
               });
               
               var dom = self.getDOM();
               
               var img = dom.find("div.viewer img");
               
               img.bind("load", function () {
                   self.show();
               });
               
               img.attr("src", options.srcList[0]);
            },
            {
                destroy: function () {
                    $(document.body).unbind(Config.TAP_EVENTNAME, self.bodytap_handle);
                    $(document.body).unbind("touchstart", self.bodytouchstart_handle);
                    this._super.destroy();
                }
            },
            Modal
        );
        
        return PictureViewer;
    }
);
