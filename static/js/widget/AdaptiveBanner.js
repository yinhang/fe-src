define(
    [
        "lib/jQuery",
        "base/Class",
        "loadjst!widget/adaptive_banner.jst",
        "Browser",
        "util/FunctionalMarker"
    ],
    function ($, Class, AdaptiveBannerJST, Browser, FunctionalMarker) {
        
        var AdaptiveBanner = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.imageList
                * @param options.target
                * @param options.height
             */
            function (options) {
                var self = this;
                
                self.options = options;
                
                self.dom = $(AdaptiveBannerJST.render());
                
                self.intelImageLoader = null;
                
                self.dom.css({
                    height: options.height + "px"
                });
                
                options.target.append(self.dom);
                
                var conWidth = self.dom.width();
                var conHeight = self.options.height;
                var imageList = [];
                
                var imageListDOM = self.dom.find("ul.list");
               
                var optionsImageList = self.options.imageList;
                
                self.leftFillId = 0;
                self.rightFillId = 0;
                var initFillNum = 0;
                
                var image = new Image();
                
                image.onload = function () {
                    var reqConWidth = self.dom.width();
                    var reqConHeight = self.options.height;
                    
                    image.height = reqConHeight;
                    
                    $(image).css({
                        height: reqConHeight + "px",
                        width: "auto",
                        visibility: "hidden"
                    });
                    
                    var li = $("<li data-index='0' class='current'></li>");
                    
                    imageListDOM.append(li);
                    
                    li.append(image).animate({
                        opacity: 1
                    }, 150);
                    
                    var imageWidth = $(image).width();
                    
                    self.dom.removeClass("loading");
                    
                    self.dom.find("div.mask").animate({
                        width: conWidth / 2 - imageWidth / 2 + "px"
                    }, 150);
                    
                    imageListDOM.css({
                        left: reqConWidth / 2 - $(image).width() / 2 + "px"
                    });
                        
                    $(image).css({
                        visibility: "visible"
                    });
                    
                    self.fillLeft(++ self.leftFillId, null, function () {
                        if(++ initFillNum >= 2)
                        {
                            self.adjustPageButton();
                            $(window).bind("resize", function () {
                                self.adjust();
                            });
                        }
                    });
                    
                    self.fillRight(++ self.rightFillId, null, function () {
                        if(++ initFillNum >= 2)
                        {
                            self.adjustPageButton();
                            $(window).bind("resize", function () {
                                self.adjust();
                            });
                        }
                    });
                };
                
                image.src = optionsImageList[0] + "?imageView2/2/h/" + Browser.devicePixelRatio * conHeight;
                
                self.dom.find("button.page").bind("click", function () {
                    var button = $(this);
                    if(button.hasClass("prev"))
                    {
                        self.prev();
                    }
                    else
                    {
                        self.next();
                    }
                });
                
            },
            {
                adjustPageButton: function () {
                    var self = this;
                    
                    var conHeight = self.dom.height();
                    
                    self.dom.find("button.page").each(function () {
                        var pageButton = $(this);
                        pageButton.css({
                            top: conHeight / 2 - pageButton.outerHeight() / 2 + "px",
                            visibility: "visible"
                        });
                    });
                },
                adjust: function () {
                    var self = this;
                    
                    var conWidth = self.dom.width();
                    var conHeight = self.dom.height();
                    var imageListDOM = self.dom.find("ul.list");
                    var x = parseFloat(imageListDOM.css("left"));
                    var currentImage = imageListDOM.find("li.current");
                    
                    var currentImagePos = currentImage.position();
                    
                    var currentImageLeftInView = currentImagePos.left + x;
                    
                    var targetCurrentImageLeftInView = conWidth / 2 - currentImage.width() / 2;
                    
                    self.adjustPageButton();
                    
                    imageListDOM.css({
                        left: targetCurrentImageLeftInView - currentImageLeftInView + x + "px"
                    });
                    
                    self.fillLeft(++ self.leftFillId);
                    self.fillRight(++ self.rightFillId);
                    
                    var imageWidth = $(currentImage).width();
                    self.dom.find("div.mask").css({
                        width: conWidth / 2 - imageWidth / 2 + "px"
                    });
                },
                focus: function () {
                    var self = this;
                    if(self.focusLocked)
                    {
                        return;
                    }
                    self.focusLocked = true;
                    self.goPageLocked = true;
                    self.focusFillDone = 0;
                    
                    var conWidth = self.dom.width();
                    var imageListDOM = self.dom.find("ul.list");
                    var x = parseFloat(imageListDOM.css("left"));
                    var currentImage = imageListDOM.find("li.current");
                    
                    var currentImagePos = currentImage.position();
                    
                    var currentImageLeftInView = currentImagePos.left + x;
                    
                    var targetCurrentImageLeftInView = conWidth / 2 - currentImage.width() / 2;
                    
                    var imageWidth = $(currentImage).width();
                    self.dom.find("div.mask").animate({
                        width: conWidth / 2 - imageWidth / 2 + "px"
                    }, 500);
                    
                    imageListDOM.animate({
                        left: targetCurrentImageLeftInView - currentImageLeftInView + x + "px"
                    }, 500, function () {
                        self.fillLeft(++ self.leftFillId, null, function () {
                            if(++ self.focusFillDone >= 2)
                            {
                                self.focusLocked = false;
                                self.goPageLocked = false;
                                self.focusFillDone = 0;
                            }
                        });
                        self.fillRight(++ self.rightFillId, null, function () {
                            if(++ self.focusFillDone >= 2)
                            {
                                self.focusLocked = false;
                                self.goPageLocked = false;
                                self.focusFillDone = 0;
                            }
                        });
                    });
                    
                },
                leftBufferSize: function () {
                    var self = this;
                    
                    var conWidth = self.dom.width();
                    var imageListDOM = self.dom.find("ul.list");
                    var x = parseFloat(imageListDOM.css("left"));
                    if(x >= 0)
                    {
                        return 0;
                    }
                    x *= -1;
                    var leftWidth = 0;
                    var count = 0;
                    imageListDOM.find("li").each(function () {
                        leftWidth += $(this).width();
                        if(leftWidth <= x)
                        {
                            ++ count;
                        }
                        else
                        {
                            return false;
                        }
                    });
                    
                    return count;
                    
                },
               rightBufferSize: function() {
                   var self = this;
                   
                   var conWidth = self.dom.width();
                   var imageListDOM = self.dom.find("ul.list");
                   var x = parseFloat(imageListDOM.css("left"));
                   
                   var leftWidth = x;
                   var count = 0;
                   imageListDOM.find("li").each(function () {
                       if(leftWidth > conWidth)
                       {
                           ++ count;
                       }
                       leftWidth += $(this).width();
                   });
                   
                   return count;
               },
               fillLeft: function (id, endPageNo, complete) {
                   complete = complete || function () {};
                   
                   var self = this;
                   
                   var conWidth = self.dom.width();
                   var imageListDOM = self.dom.find("ul.list");
                   var x = parseFloat(imageListDOM.css("left"));
                   
                   if(x > 0 || self.leftBufferSize() < 1 || endPageNo)
                   {
                       var index = imageListDOM.find("li").first().data("index");
                       var prevIndex = index - 1;
                       var maxIndex = self.options.imageList.length - 1;
                       if(prevIndex < 0)
                       {
                           prevIndex = maxIndex;
                       }
                       var leftImage = new Image();
                       
                       var conHeight = self.options.height;
                       
                       leftImage.onload = function () {
                           if($(this).data("leftFillId") != self.leftFillId)
                           {
                               return;
                           }
                           if(prevIndex == endPageNo - 1)
                           {
                               endPageNo = null;
                           }
                           leftImage.height = conHeight;
                           var li = $("<li data-index='" + prevIndex + "'></li>");
                           
                           $(leftImage).css({
                               height: conHeight + "px",
                               width: "auto"
                           });
                           
                           li.css({
                               visibility: "hidden",
                               position: "absolute"
                           });
                           
                           li.append(leftImage);
                           
                           imageListDOM.prepend(li);
                           
                           x -= $(leftImage).width();
                           
                           li.css({
                               visibility: "visible",
                               position: "static"
                           });
                           
                           imageListDOM.css({
                               left: x + "px"
                           });
                           
                           li.animate({
                               opacity: 1
                           }, 150);
                           
                           self.fillLeft(id, endPageNo, complete);
                           
                       };
                       
                       $(leftImage).data("leftFillId", id);
                       
                       leftImage.src = self.options.imageList[prevIndex] + "?imageView2/2/h/" + Browser.devicePixelRatio * conHeight;
                   }
                   else
                   {
                       complete();
                   }
                   
               },
               fillRight: function (id, endPageNo, complete) {
                   complete = complete || function () {};
                   
                   var self = this;
                   
                   var conWidth = self.dom.width();
                   var imageListDOM = self.dom.find("ul.list");
                   var x = parseFloat(imageListDOM.css("left"));
                   var listWidth = imageListDOM.width();
                   var maxIndex = self.options.imageList.length - 1;
                   if(x + listWidth <= conWidth || self.rightBufferSize() < 1 || endPageNo)
                   {
                       var index = imageListDOM.find("li").last().data("index");
                       var nextIndex = index + 1;
                       if(nextIndex > maxIndex)
                       {
                           nextIndex = 0;
                       }
                       var rightImage = new Image();
                       
                       var conHeight = self.options.height;
                       
                       rightImage.onload = function () {
                           if($(this).data("rightFillId") != self.rightFillId)
                           {
                               return;
                           }
                           if(nextIndex == endPageNo - 1)
                           {
                               endPageNo = null;
                           }
                           
                           rightImage.height = conHeight;
                           var li = $("<li data-index='" + nextIndex + "'></li>");
                           
                           $(rightImage).css({
                               height: conHeight + "px",
                               width: "auto"
                           });
                           
                           li.css({
                               visibility: "hidden",
                               position: "absolute"
                           });
                           
                           li.append(rightImage);
                           
                           imageListDOM.append(li);
                           
                           li.css({
                               visibility: "visible",
                               position: "static"
                           });
                           
                           li.animate({
                               opacity: 1
                           }, 150);
                           
                           self.fillRight(id, endPageNo, complete);
                           
                       };
                       
                       $(rightImage).data("rightFillId", id);
                       
                       rightImage.src = self.options.imageList[nextIndex] + "?imageView2/2/h/" + Browser.devicePixelRatio * conHeight;
                   }
                   else
                   {
                       complete();
                   }
               },
               go: function (pageNo, right) {
                   if(this.goPageLocked)
                   {
                       return;
                   }
                   this.goPageLocked = true;
                   var self = this;
                   var currentImage = self.dom.find("ul.list").find("li.current");
                   var imageListData = self.options.imageList;
                   var maxIndex = imageListData.length - 1;
                   var currentIndex = currentImage.data("index");
                   var nextImage = null;
                   var nextIndex = pageNo - 1;
                   
                   if(right)
                   {
                       nextImage = currentImage.nextAll("li[data-index='" + nextIndex + "']").first();
                   }
                   else 
                   {
                       nextImage = currentImage.prevAll("li[data-index='" + nextIndex + "']").first();
                   }
                   
                   if(nextImage && nextImage.length > 0)
                   {
                       currentImage.removeClass("current");
                       
                       nextImage.addClass("current");
                       
                       self.focus();
                   }
                   else
                   {
                       if(right)
                       {
                           self.fillRight(++ self.rightFillId, pageNo, function () {
                               self.goPageLocked = false;
                               self.go(pageNo, right);
                           });
                       }
                       else
                       {
                           self.fillLeft(++ self.leftFillId, pageNo, function () {
                               self.goPageLocked = false;
                               self.go(pageNo, right);
                           });
                       }
                   }
                   
               },
               next: function () {
                   var self = this;
                   var currentImage = self.dom.find("ul.list").find("li.current");
                   var imageListData = self.options.imageList;
                   var maxIndex = imageListData.length - 1;
                   var currentIndex = currentImage.data("index");
                   
                   if(++ currentIndex > maxIndex)
                   {
                       currentIndex = 0;
                   }
                   
                   self.go(currentIndex + 1, true);
               },
               prev: function () {
                   var self = this;
                   var currentImage = self.dom.find("ul.list").find("li.current");
                   var imageListData = self.options.imageList;
                   var maxIndex = imageListData.length - 1;
                   var currentIndex = currentImage.data("index");
                   
                   if(-- currentIndex < 0)
                   {
                       currentIndex = maxIndex;
                   }
                   
                   self.go(currentIndex + 1, false);
               }
            }
        );
            
        FunctionalMarker.regist({
             packageName: "widget/AdaptiveBanner",
             init: function (element, params) {
                 new AdaptiveBanner({
                    target: $(element),
                    height: params.height,
                    imageList: $.trim(params.imagelist.replace(/[\s]+/, " ")).split(" ")
                });
             }
        });
        
        return AdaptiveBanner;
    }
);
