define(
    [
        "base/Class",
        "widget/menu/Item",
        "lib/jQuery"
    ],
    function (Class, Item, $) {
        var DividingLine = Class.define(
            /**
             * 
                * @param {Object} options
             */
            function () {
                this._super({
                    html: "<hr/>"
                });
                $(this.getDOM()).addClass("dividing-line");
            },
            {
            },
            Item
        );
        
        return DividingLine;
    }
);
