define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        
        var View = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
                * @param options.onSwitch
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    /**
                     * 
                        * @param {Object} data
                        * @param data.viewName
                        * @param data.prevViewName
                        * @param data.viewDOM
                        * @param data.prevViewDOM
                     */
                    onSwitch: function (data) {
                        
                    }
                }, options);
                
                $.extend(self, options);
                
                self.target = options.target;
            },
            {
                /**
                 * 
                    * @param {Object} options
                    * @param options.viewName
                 */
                switchTo: function (options) {
                    var self = this;
                    
                    var target = self.target;
                    
                    var curViewName = self.viewName;
                    self.viewName = options.viewName;
                    
                    this.onSwitch({
                        viewName: options.viewName,
                        prevViewName: curViewName,
                        viewDOM: target.filter("[data-name='" + options.viewName + "']"),
                        prevViewDOM: target.filter("[data-name='" + curViewName + "']")
                    });
                }
            }
        );
        
        return View;
    }
);
