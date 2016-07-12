define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        
        var Tab = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target jquery对象例如：$("a.tab")，选择到的所有对象都将被当做tab
                * @param options.onChange
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    /**
                     * 
                        * @param {Object} data
                        * @param data.tabName
                        * @param data.prevTabName
                        * @param data.tabDOM
                        * @param data.prevTabDOM
                     */
                    onChange: function (data) {
                        
                    }
                }, options);
                
                this.target = $(options.target);
                
                this.selected = null;
                
                this.target.bind("click", function () {
                    
                    if(self.selected && self.selected == this)
                    {
                        return;
                    }
                    
                    var prevSelected = self.selected;
                    self.selected = this;
                    
                    options.onChange({
                        tabName: $(self.selected).data("tabName"),
                        prevTabName: $(prevSelected).data("tabName"),
                        tabDOM: self.selected,
                        prevTabDOM: prevSelected
                    });
                    
                });
            },
            {
                /**
                 * 
                    * @param {Object} options
                    * @param options.tabName
                 */
                select: function (options) {
                    this.target.filter("[data-tab-name='" + options.tabName + "']").trigger("click");
                }
            }
        );
        
        return Tab;
    }
);
