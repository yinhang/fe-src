define(
    [
        "base/Class",
        "base/Loader"
    ],
    function (Class, Loader) {
        
        var ImageLoader = Class.define(
            function () {
                var self = this;
                self._super(function (complete, source) {
                    var image = new Image();
                    image.onload = function () {
                        complete(image);
                    };
                    image.onerror = function () {
                    };
                    image.src = source;
                });
            },
            {
            },
            Loader
        );
        
        return new ImageLoader();
    }
);
