define(
    [
        "lib/jQuery",
        "base/Class",
        "widget/Overlay",
        "base/EventCenter",
        "util/FunctionalMarker"
    ],
    function ($, Class, Overlay, EventCenter, FunctionalMarker) {
        
        var Modal = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.html
                * @param options.className
                * @param options.overlayClassName
                * @param options.onShow
                * @param options.onBeforeSizeAdjust
                * @param options.onOverlayClick
             */
            function (options) {
                var self = this;
                options = $.extend({
                    html: "",
                    className: "",
                    overlayClassName: "",
                    onShow: function () {},
                    onBeforeSizeAdjust: function () {},
                    onOverlayClick: function () {}
                }, options);
                
                self.onShow = options.onShow;
                
                self.content = $("<div class='widget-modal-content " + options.className + "' style='position: fixed; display: none;z-index: 20000;'></div>");
                self._shown = false;
                self.overlay = new Overlay({
                    className: options.overlayClassName,
                    onClick: function () {
                        options.onOverlayClick(self);
                    }
                });
                var doc = $(document.documentElement);
                if(options.hasOwnProperty("html"))
                {
                    this.setHTML({
                        html: options.html
                    });
                }
                $(document.body).append(self.content);
                FunctionalMarker.scan();
                self.adjust_events_listener = function () {
                    options.onBeforeSizeAdjust();
                    self.adjust();
                };
                $(window).bind("resize", self.adjust_events_listener);
                EventCenter.listen("viewbeforechange", function () {
                    self.destroy();
                });
            },
            {
                shown: function () {
                    return this._shown;
                },
                getDOM: function () {
                    return this.content;
                },
                adjust: function () {
                    if(this.shown() == true)
                    {
                        var self = this;
                        var contentSize = {
                            width: self.content.width(),
                            height: self.content.height()
                        };
                        var screenSize = {
                            width: document.documentElement.clientWidth,
                            height: document.documentElement.clientHeight
                        };
                        this.content.css({
                            top: ( screenSize.height / 2 - contentSize.height / 2 )  + "px",
                            left: ( screenSize.width / 2 - contentSize.width / 2 )  +  "px"
                        });
                    }
                },
                show: function () {
                	var self = this;
                    if(this._shown == false)
                    {
                        var self = this;
                        this.overlay.show();
                        this.content.fadeIn(100, function () {
                            self.onShow(self);
                        });
                        this._shown = true;
                        this.adjust();
                    }
                },
                /**
                 * @param options.complete
                 */
                hide: function (options) {
                    if(this._shown == true)
                    {
                        var self = this;
                        this.content.fadeOut(60, function () {
                            self.content.hide();
                            self.overlay.hide();
                            self._shown = false;
                            options && options.complete && options.complete();
                        });
                    }
                },
                /**
                 * @param options.complete
                 */
                destroy: function (options) {
                	options = options || {};
                    this.send("beforeDestroy", this);
                    var self = this;
                    this.hide({
                        complete: function () {
                            self.overlay.destroy();
                            self.content.remove();
                            $(window).unbind("resize", self.adjust_events_listener);
                            self.send("destroy", self);
                            options.complete && options.complete();
                        }
                    });
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.html
                 */
                setHTML: function (options) {
                    this.content.html(options.html);
                }
            }
        );
        
        return Modal;
    }
);
