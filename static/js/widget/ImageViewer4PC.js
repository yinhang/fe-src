define(
    [
        "lib/jQuery",
        "widget/Modal",
        "base/Class",
        "loadjst!widget/imageviewer4pc.jst",
        "util/FunctionalMarker"
    ],
    function ($, Modal, Class, ImageViewer4PCJST, FunctionalMarker) {
        
        var ImageViewer4PC = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.imageList
                * @param options.onDestroy
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    onDestroy: function () {}
                }, options);
                
                this.onDestroy = options.onDestroy;
                
                self._super({
                    html: ImageViewer4PCJST.render(),
                    className: "imageviewer4pc",
                    overlayClassName: "imageviewer4pc"
                });
                
                self.imageNum = 0;
                
                self.imageList = [];
                
                self.doResize = function() {
                    self.adjustImage();
                };
                
                self.doKeyDown = function(e) {
                    switch(e.keyCode)
                    {
                        case 27: 
                            self.destroy();
                        break;
                        case 37: 
                            self.prev();
                        break;
                        case 39:
                            self.next();
                        break;
                    }
                };
                
                $(window).bind("resize", self.doResize);
                $(window).bind("keydown", self.doKeyDown);
                
                for(var i = 0, l = options.imageList.length; i < l; ++ i)
                {
                   this.add({
                       url: options.imageList[i].url
                   });
                }
                
                this.pageNo = 0;
                
                this.next();
                var $DOM = $(this.getDOM());
                
                $DOM.find("a.page-control.prev").bind("click", function() {
                    self.prev();
                });
                
                $DOM.find("a.page-control.next").bind("click", function() {
                    self.next();
                });
                
                $DOM.find("a.quit").bind("click", function () {
                    self.destroy();
                });
                
            },
            {
                destroy: function () {
                    this._super.destroy();
                    $(window).unbind("resize", this.doResize);
                    $(window).unbind("keydown", this.doKeyDown);
                    this.onDestroy();
                },
                next: function () {
                    if(this.pageNo < this.imageList.length)
                    {
                        this.go({
                            pageNo: this.pageNo + 1
                        });
                    }
                },
                prev: function () {
                    if(this.pageNo > 1)
                    {
                        this.go({
                            pageNo: this.pageNo - 1
                        });
                    }
                },
                /**
                 * @param options
                 * @param options.pageNo
                 * 
                 */
                go: function (options) {
                    var self = this;
                    var image = self.imageList[options.pageNo - 1];
                    
                    if(image)
                    {
                        var $image = $(image.image);
                        var curImage = self.imageList[self.pageNo - 1];
                        if(curImage)
                        {
                            $(curImage.image).css("opacity", 0).removeClass("show");
                        }
                        self.pageNo = options.pageNo;
                        
                        if(image.loaded)
                        {
                            self.loadingComplete();
                            $image.addClass("show");
                            self.adjustImage();
                            $image.animate({
                                opacity: 1
                            }, 150);
                        }
                        else
                        {
                            this.loading();
                            $image.one("load", function () {
                                if(options.pageNo == self.pageNo)
                                {
                                    self.loadingComplete();
                                    $image.addClass("show");
                                    self.adjustImage();
                                    $image.animate({
                                        opacity: 1
                                    }, 150);
                                }
                            });
                        }
                        $(this.getDOM()).find("div.num span.cur").html(self.pageNo);
                    }
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.url
                 */
                add: function (options) {
                    var self = this;
                    var image = new Image();
                    var imageNum = self.imageList.push({
                        loaded: false,
                        image: image
                    });
                    
                    var $DOM = $(self.getDOM());
                    
                    $DOM.find("div.num span.count").html(imageNum);
                    
                    var $image = $(image);
                    
                    $image.addClass("img");
                    
                    $image.one("load", function () {
                        var imageInfo = self.imageList[imageNum - 1];
                        imageInfo.loaded = true;
                        $image.data("swidth", image.width);
                        $image.data("sheight", image.height);
                    });
                    
                    $DOM.find("div.viewer").append(image);
                    
                    image.src = options.url + "?imageView2/2/w/720";
                },
                loading: function () {
                    var self = this;
                    var image = $(self.getDOM()).find("div.viewer img.img");
                    var loadingImage = image.filter(".loading");
                    loadingImage.addClass("show");
                    self.adjustImage();
                    loadingImage.animate({
                        opacity: 1
                    }, 150);
                },
                loadingComplete: function () {
                    $(this.getDOM()).find("div.viewer img.img.loading").removeClass("show");
                },
                show: function () {
                    this._super.show();
                    this.adjustImage();
                },
                adjustImage: function () {
                    var self = this;
                    var $DOM = $(self.getDOM());
                    var viewer = $DOM.find("div.viewer");
                    var image = viewer.find("img.img.show");
                    var imageDOM = image.get(0);
                    var imageWidth = image.data("swidth");
                    var imageHeight = image.data("sheight");
                    var viewerWidth = viewer.outerWidth();
                    var viewerHeight = viewer.outerHeight();
                    
                    var sizeChange = false;
                    
                    if(imageHeight > viewerHeight)
                    {
                        image.css({
                            height: viewerHeight + "px",
                            width: "auto"
                        });
                        sizeChange = true;
                    }
                    
                    if(image.outerWidth() > viewerWidth)
                    {
                        image.css({
                            width: viewerWidth + "px",
                            height: "auto"
                        });
                        sizeChange = true;
                    }
                    if(sizeChange == false)
                    {
                        image.css({
                            height: imageHeight + "px",
                            width: imageWidth + "px",
                        });
                    }
                    
                    var $image = $(image);
                    
                    var top = ( viewerHeight - image.outerHeight() ) / 2;
                    var left = ( viewerWidth - image.outerWidth() ) / 2;
                    
                    image.css({
                        left: left + "px",
                        top: top + "px"
                    });
                }
            },
            Modal
        );
        
        var shown = false;
        
        var ImageViewer4PCFactory = {
            /**
             * 
                * @param {Object} options
                * @param options.imageList
             */
            show: function (options) {
                shown = true;
                var imageList = options.imageList;
                if(imageList && imageList.length > 0)
                {
                    (new ImageViewer4PC({
                        imageList: options.imageList,
                        onDestroy: function () {
                            shown = false;
                        }
                    })).show();
                }
            }
        };
        
        FunctionalMarker.regist({
            packageName: "widget/ImageViewer4PC",
            init: function (element, params) {
                
                var imageList = [];
                params.urlList = params.urlList.split(" ");
                for(var i = 0, l = params.urlList.length; i < l; ++ i)
                {
                    var url = $.trim(params.urlList[i]);
                    if(url && url.length > 0)
                    {
                        imageList.push({
                            url: url
                        });
                    }
                }
                
                $(element).bind("click", function () {
                    ImageViewer4PCFactory.show({
                        imageList: imageList
                    });
                });
            }
        });
        
        return ImageViewer4PCFactory;
        
    }
);
