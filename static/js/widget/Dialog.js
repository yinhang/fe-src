define(
    [
        "lib/jQueryMobile",
        "base/Class",
        "widget/Overlay",
        "Config",
        "vendor/jQueryTransit"
    ],
    function ($, Class, Overlay, Config, $) {
        
        var Dialog = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.className
                * @param options.html
                * @param options.from left | top | right | bottom
                * @param options.size
                * @param options.onShow
                * @param options.onResize
                * @param optoins.onHide
                * @param options.onOverlayClick
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    html: "",
                    className: "",
                    from: "bottom",
                    size: null,
                    onShow: function () {},
                    onHide: function () {},
                    onResize: function () {},
                    onOverlayClick: function () {
                        
                    }
                }, options);
                
                this.onShow = options.onShow;
                this.onHide = options.onHide;
                this.onResize = options.onResize;
                
                this.size = options.size;
                this.from = options.from;
                
                self.content = $("<div class='widget-dialog-content " + options.className + "' style='position: fixed; display: none;z-index: 20000;'></div>");
                self._shown = false;
                self.overlay = new Overlay({
                    className: options.className,
                    onClick: options.onOverlayClick
                });
                self.setHTML(options.html);
                
                self.disable_event_handle = function (e) {
                    e.stopPropagation();
                    return false;
                };
                
                self.resize_handle = function () {
                    self.resize();
                };
                
                $(window).bind("resize", self.resize_handle);
                
                $(document.body).append(self.content);
                
                this.resize();
            },
            {
                getDOM: function () {
                    return this.content.get(0);
                },
                setHTML: function (html) {
                    this.content.html(html);
                },
                show: function () {
                    var self = this;
                    if(self._shown != true)
                    {
                        self._shown = true;
                        self.content.find("*").bind("click mousedown touchstart", self.disable_event_handle);
                        self.overlay.show();
                        self.content.css({
                            "-webkitTransform": self.startTransform3d,
                            "transform": self.startTransform3d,
                            opacity: 1
                        });
                        self.content.css({
                            display: "block"
                        });
                        self.content.transition({
                            transform: self.targetTransform3d,
                            opacity: 1
                        }, Config.ANIMATE.DURATION.IN, Config.ANIMATE.FUNCTION.IN, function () {
                            self.content.find("*").unbind("click mousedown touchstart", self.disable_event_handle);
                            self.onShow(self);
                        });
                    }
                },
                resize: function () {
                    var self = this;
                    
                    this.docClientWidth = document.documentElement.clientWidth; 
                    this.docClientHeight = document.documentElement.clientHeight; 
                    
                    if(self.size)
                    {
                    
                        switch(self.from)
                        {
                            case "left":
                                self.targetTransform3d = "translate3d(-" + ( self.docClientWidth + self.size ) + "px, 0px, 0px)";
                            break;
                            case "right":
                                self.targetTransform3d = "translate3d(" + ( self.docClientWidth - self.size ) + "px, 0px, 0px)";
                            break;
                            case "top":
                                self.targetTransform3d = "translate3d(0px, -" + ( self.docClientHeight + self.size ) + "px, 0px)";
                            break;
                            case "bottom":
                                self.targetTransform3d = "translate3d(0px, " + ( self.docClientHeight - self.size ) + "px, 0px)";
                            break;
                        }
                        
                    }
                    else
                    {
                        self.targetTransform3d = "translate3d(0px, 0px, 0px)";
                    }
                    
                    switch(self.from)
                    {
                        case "left":
                            self.startTransform3d = "translate3d(-" + self.docClientWidth + "px, 0px, 0px)";
                        break;
                        case "right":
                            self.startTransform3d = "translate3d(" + self.docClientWidth + "px, 0px, 0px)";
                        break;
                        case "top":
                            self.startTransform3d = "translate3d(0px, -" + self.docClientHeight + "px, 0px)";
                        break;
                        case "bottom":
                            self.startTransform3d = "translate3d(0px, " + self.docClientHeight + "px, 0px)";
                        break;
                    }
                    
                    if(self._shown)
                    {
                        self.content.css({
                            "transform": self.targetTransform3d
                        });
                        this.onResize(this);
                    }
                },
                hide: function (complete) {
                    var self = this;
                    self._shown = false;
                    self.content.find("*").blur();
                    self.content.transition({
                        transform: self.startTransform3d,
                        opacity: 0
                    }, Config.ANIMATE.DURATION.OUT, Config.ANIMATE.FUNCTION.OUT, function () {
                        self.content.css({
                            display: "none"
                        });
                        self.onHide(self);
                        self.overlay.hide();
                        complete && complete();
                    });
                    
                },
                destroy: function () {
                    var self = this;
                    self.hide(function () {
                        self.content.remove();
                        self.overlay.destroy();
                        $(window).unbind("resize", self.resize_handle);
                    });
                }
            }
        );
        
        return Dialog;
    }
);
