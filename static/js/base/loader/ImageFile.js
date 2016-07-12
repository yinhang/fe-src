define(
    [
        "base/Class",
        "base/Loader"
    ],
    function (Class, Loader) {
        
        var FileLoader = Class.define(
            function () {
                var self = this;
                self._super(function (complete, file) {
                    var fileReader = new FileReader();
                    
                    fileReader.onload = function () {
                        var image = new Image();
                        image.onload = function () {
                            complete({
                                size: file.size,
                                image: image,
                                base64: fileReader.result,
                                mime: file.type
                            });
                        };
                        image.src = fileReader.result;
                    };
                    
                    fileReader.readAsDataURL(file);
                });
            },
            {
            },
            Loader
        );
        
        return new FileLoader();
    }
);
