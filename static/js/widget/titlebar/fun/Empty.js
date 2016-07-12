define(
    [
        "base/Class",
        "widget/titlebar/Fun"
    ],
    function (Class, Fun) {
        var Empty = Class.define(
            /**
             * 
                * @param {Object} options
             */
            function (options) {
                this._super({
                    className: "empty"
                });
            },
            {
                
            },
            Fun
        );
        
        return Empty;
    }
);
