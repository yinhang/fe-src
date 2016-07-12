define(
    [
        "lib/jQueryMobile",
        "base/Class",
        "widget/Modal"
    ],
    function ($, Class, Modal) {
        
        var Loading = Class.define(
            /**
             * 
                * @param {Object} options
                * 
             */
            function (options) {
               this._super({
                    html: "<div class='content'></div>",
                    className: "loading",
                    overlayClassName: "loading"
                });
            },
            {
                
            },
            Modal
        );
        
        return new Loading();
    }
);
