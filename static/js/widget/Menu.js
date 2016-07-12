define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        
        var Menu = Class.define(
            /**
             * @param options.className
             */
            function (options) {
                var self = this;
                options = options || {};
                options = $.extend({
                    className: ""
                }, options);
                
                this.ul = $("<ul class='widget-menu " + options.className + "' style='display: none;'></ul>");
                this.items = {};
                this.init = false;
                this._shown = false;
            },
            {
                destroy: function () {
                    var self = this;
                    self.hide(function () {
                        var items = self.items;
                        for(var id in items)
                        {
                            self.removeItem({
                                item: items[id]
                            });
                        }
                        self.ul.remove();
                    });
                },
                getDOM: function () {
                    return this.ul;
                },
                /**
                 * @param options.item
                 */
                addItem: function (options) {
                    var item = options.item;
                    this.ul.append(item.getDOM());
                    this.items[item.getID()] = item;
                    var self = this;
                    item.listen("select", function (item) {
                        self.send("select", item);
                    });
                },
                shown: function () {
                    return this._shown;
                },
                /**
                 * @param options.item
                 */
                removeItem: function (options) {
                    var item = options.item;
                    this.ul.find("li[data-id='" + item.getID() + "']").remove();
                    delete this.items[item.getID()];
                    item.destroy();
                },
                /**
                 * 
                    * @param {Object} options
                 */
                show: function (options) {
                    if(this.init == false)
                    {
                        $(document.body).append(this.ul);
                        this.init = true;
                    }
                    this.ul.fadeIn(100);
                    this._shown = true;
                },
                hide: function (complete) {
                    this.ul.fadeOut(60, complete);
                    this._shown = false;
                }
            }
        );
        
        return Menu;
    }
);
