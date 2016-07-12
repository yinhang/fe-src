define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        
        var IntelImage = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.src
                * @param options.onLoad
                * @param options.name
             */
            function (options) {
                var self = this;
                
                self.options = options;
                
                this.src = options.src;
                this.name = options.name;
                this.image = new Image();
                this.state = IntelImage.STATE_NAME.STANDBY;
            },
            {
                load: function () {
                    var self = this;
                    if(self.state != IntelImage.STATE_NAME.STANDBY)
                    {
                        return;
                    }
                    self.image.onload = function () {
                        self.state = IntelImage.STATE_NAME.LOADED;
                        self.options.onLoad(self);
                    };
                    self.image.src = self.src;
                    self.state = IntelImage.STATE_NAME.LOADING;
                },
                getImage: function () {
                    return this.image;
                },
                getState: function () {
                    return this.state;
                },
                getName: function () {
                    return this.name;
                }
            }
        );
        
        IntelImage.STATE_NAME = {
            LOADED: 1,
            LOADING: 2,
            STANDBY: 3
        };
        
        function getLeftStandByImage(list, index) {
            for(var i = index - 1; i >= 0; -- i)
            {
                if(list[i].getState() == IntelImage.STATE_NAME.STANDBY)
                {
                    return list[i];
                }
            }
            return null;
        };
        
        function getRightStandByImage(list, index) {
            for(var i = index + 1, l = list.length; i < l; ++ i)
            {
                if(list[i].getState() == IntelImage.STATE_NAME.STANDBY)
                {
                    return list[i];
                }
            }
            return null;
        };
        
        var IntelImageLoader = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.onLoad
                * @param options.imageList [
                *   {
                *       src: "http://baidu.com/image",
                *       name: "name",
                *       onLoad: function () {
                *     
                *       }
                *   }
                * ]
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    onLoad: function () {
                        
                    },
                    imageList: []
                }, options);
                
                self.options = options;
                
                self.list = [];
                
                var imageList = options.imageList;
                
                for(var i = 0, l = imageList.length; i < l; ++ i)
                {
                    var imageData = imageList[i];
                    self.list.push(new IntelImage({
                        src: imageData.src,
                        name: imageData.name || i,
                        onLoad: (function (_i, _loader) {
                            return function () {
                                var intelImage = self.list[_i];
                                var imageDOM = intelImage.getImage();
                                
                                options.onLoad(imageDOM, _i, intelImage.getName());
                                
                                var imageData = imageList[_i];
                                imageData.onLoad && imageData.onLoad(imageDOM, _i, intelImage.getName());
                                
                                var prev = getLeftStandByImage(self.list, _i);
                                var next = getRightStandByImage(self.list, _i);
                                if(prev)
                                {
                                    prev.load();
                                }
                                if(next)
                                {
                                    next.load();
                                }
                                
                            };
                        })(i, self)
                    }));
                }
            },
            {
                getSize: function () {
                    return this.list.length;
                },
                load: function (index) {
                    this.list[index].load();
                }
            }
        );
        
        return IntelImageLoader;
        
    }
);
