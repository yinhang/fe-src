define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/menu/Item"
    ],
    function ($, Class, Item) {
        var Link = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.text
                * @param options.link
                * @param options.attr
                * @param options.data
             */
            function (options) {
                options = options || {};
                options = $.extend({
                    link: "javascript: void(0);"
                }, options);
                this.id = "linkitem_id_" + ( ++ Link.COUNTER );
                options.html = "<a href='" + options.link + "' id='" + this.id + "'>" + options.text + "</a>";
                this._super(options);
                this.a = $("#" + this.id);
                if(options.attr)
                {
                    for(var name in options.attr)
                    {
                        this.setAttr(name, options.attr[name]);
                    }
                }
                $(this.getDOM()).addClass("link");
            },
            {
                setAttr: function (name, data) {
                    this.a.attr(name, data);
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.text
                 */
                setText: function (options) {
                    this.a.html(options.text);
                }
            },
            Item
        );
        
        Link.COUNTER = 0;
        
        return Link;
    }
);
