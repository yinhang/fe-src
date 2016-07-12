define(
    [
        "lib/jQuery",
        "base/Class",
        "util/Tab",
        "util/View"
    ],
    function ($, Class, Tab, View) {
        
        var TabView = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.tab
                * @param options.view
             */
            function (options) {
                var self = this;
                
                options.view.each(function () {
                    $this.addClass("nodis");
                });
                
                self.view = new View({
                    taget: options.view,
                    onSwitch: function (data) {
                        data.prevViewDOM ? data.prevViewDOM.addClass("nodis active") : void(0);
                        data.viewDOM.removeClass("nodis active");
                    }
                });
                
                self.tab = new Tab({
                    taget: options.tab,
                    onChange: function (data) {
                        data.tabDOM.addClass("active");
                        data.prevTabDOM.removeClass("active");
                        self.view.switchTo(data.tabName);
                    }
                });
                
            },
            {
                /**
                 * 
                    * @param {Object} options
                    * @param options.tabName
                 */
                active: function (options) {
                    this.tab({
                        tabName: options.tabName
                    });
                }
            }
        );
        
        return TabView;
    }
);
