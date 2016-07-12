define(
    [
        "lib/jQueryMobile",
        "base/Class",
        "widget/Modal",
        "vendor/Swiper",
        "util/IntelImageLoader",
        "Browser"
    ],
    function ($, Class, Modal, Swiper, IntelImageLoader, Browser) {
        
        var ImageViewer = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.imageSrcList [{src: "", initialSlide: true}]
                * @param options.onClose
                * @param options.pagingTip
             */
            function (options) {
                
                var self = this;
                
                this._super({
                    html: "<div class='picture-box'><button type='button' class='close'></button><div class='bottom-panel'></div></div>",
                    imageLoader: function (src) {
                        return src;
                    },
                    onBeforeSizeAdjust: function () {
                        self.resizeImage();
                    },
                    className: "image-viewer",
                    overlayClassName: "image-viewer"
                });
                
                options = $.extend({
                    imageSrcList: [],
                    onClose: function () {},
                    pagingTip: true
                }, options);
                
                var wrapper = $("<div class='swiper-wrapper'></div>");
                
                var swiperCon = $("<div class='swiper-container'></div>");
                
                var dom = this.getDOM();
                
                var bottomPanel = dom.find("div.bottom-panel");
                
                dom.css({
                    "backgroundColor": "transparent"
                });
                
                var pictureBox = dom.find("div.picture-box");
                
                if(options.pagingTip == false)
                {
                    pictureBox.addClass("no-paging-tip");
                }
                
                swiperCon.append(wrapper);
                
                this.imageSrcList = options.imageSrcList;
                
                self.initialSlide = 0;
                
                self.init = false;
                
                for(var i = 0, l = options.imageSrcList.length; i < l; ++ i)
                {
                    var imageSrc = self.imageSrcList[i];
                    wrapper.append("<div class='swiper-slide' style=''><div class='viewer' data-src='" + imageSrc.src + "' data-index='" + i + "' style='position: relative;'></div></div>");
                    if(imageSrc.initialSlide == true)
                    {
                        self.initialSlide = i;
                    }
                }
                
                pictureBox.append(swiperCon);
                self.swiper = new Swiper(swiperCon.get(0), {
                    onTransitionStart: function (swiper) {
                        bottomPanel.attr("data-pagebar-str", swiper.activeIndex + 1 + "/" + swiper.slides.length);
                        if(self.intelImageLoader)
                        {
                            self.intelImageLoader.load(swiper.activeIndex);
                        }
                    },
                    onInit: function (swiper) {
                        bottomPanel.attr("data-pagebar-str", swiper.activeIndex + 1 + "/" + swiper.slides.length);
                    }
                });
                
                pictureBox.find("button.close").bind("click", function () {
                    self.destroy({
                        complete: function () {
                            options.onClose();
                        }
                    });
                });
                
                self.show();
                
                self.resizeImage();
            },
            {
                resizeImage: function (swiper) {
                    var self = this;
                    var imageList = [];
                    
                    var width = document.documentElement.clientWidth;
                    var height = document.documentElement.clientHeight;
                    
                    self.getDOM().find("div.picture-box, div.picture-box div.viewer").css({
                        width: width + "px",
                        height: height + "px"
                    });
                    
                    swiper = swiper || self.swiper;
                                    
                    swiper.update(true);
                    
                    self.adjust();
                                    
                    if(self.init == false)
                    {
                        swiper.slideTo(self.initialSlide, 0);
                    }
                    
                    self.init = true;
                    
                    for(var i = 0, l = this.imageSrcList.length; i < l; ++ i)
                    {
                        imageList.push({
                            src: self.imageSrcList[i].src + "?imageView2/2/w/" + width * Browser.devicePixelRatio + "/h/" + height * Browser.devicePixelRatio,
                            onLoad: function (image, _i) {
                                
                                if(document.documentElement.clientWidth == width && document.documentElement.clientHeight == height)
                                {
                                
                                    var imageWidth = image.width / Browser.devicePixelRatio;
                                    var imageHeight = image.height / Browser.devicePixelRatio;
                                    
                                    $(image).css({
                                        position: "absolute",
                                        top: height / Browser.devicePixelRatio - imageHeight / Browser.devicePixelRatio + "px",
                                        left: width / Browser.devicePixelRatio - imageWidth / Browser.devicePixelRatio + "px",
                                        height: imageHeight + "px",
                                        width: imageWidth + "px"
                                    });
                                    
                                    self.getDOM().find("div.viewer[data-index='" + _i + "']").empty().append(image);
                                    
                                }
                                
                            }
                        });
                    }
                    
                    this.intelImageLoader = new IntelImageLoader({
                        imageList: imageList
                    });
                    
                    this.intelImageLoader.load(swiper.activeIndex);
                }
            },
            Modal
        );
        
        var imageViewer = null;
        
        return {
            /**
             * 
                * @param {Object} options
                * @param options.imageSrcList
                * @param options.pagingTip
             */
            show: function (options) {
                if(imageViewer == null)
                {
                    imageViewer = new ImageViewer({
                        pagingTip: options.pagingTip,
                        imageSrcList: options.imageSrcList,
                        onClose: function () {
                            imageViewer = null;
                        }
                    });
                }
            }
        };
    }
);
