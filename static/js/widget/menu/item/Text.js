define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/menu/Item"
    ],
    function ($, Class, Item) {
        var Text = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.text
                * @param options.data
                * @param options.domEventListeners
             */
            function (options) {
                options.html = "<span>" + options.text + "</span>";
                this._super(options);
            },
            {
                /**
                 * 
                    * @param {Object} options
                    * @param options.text
                 */
                setText: function (options) {
                    this.setHTML({
                        html: "<span>" + options.text + "</span>"
                    });
                }
            },
            Item
        );
        
        return Text;
    }
);
