define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        var Item = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.html
                * @param options.data
             */
            function (options) {
                options = $.extend({
                    html: "",
                    data: {}
                }, options);
                this.li = $("<li class='item'></li>");
                this.id = ++ Item.ID;
                this.data = options.data;
                this.setHTML({
                    html: options.html
                });
                this.li.attr("data-id", this.id);
            },
            {
                destroy: function () {
                },
                getData: function () {
                    return this.data;
                },
                getDOM: function () {
                    return this.li;
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.html
                 */
                setHTML: function (options) {
                    this.li.html(options.html);
                },
                getID: function () {
                    return this.id;
                }
            }
        );
        
        Item.ID = 0;
        
        return Item;
    }
);
