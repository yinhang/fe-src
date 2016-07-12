define(
    [
        "lib/jQuery",
        "base/Class",
        "Config",
        "base/EventCenter",
        "Runner"
    ],
    function ($, Class, Config, EventCenter, Runner) {
        
        var Toast = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.text
                * @param options.duration
                * @param options.onDestroy
             */
            function (options) {
                var self = this;
                options = $.extend({
                    duration: 2000,
                    text: "",
                    onDestroy: function () {
                    }
                }, options);
                
                $.extend(self, options);
                
                self.content = $("<div class='toast' style='position: fixed; display: none;z-index: 20000;'></div>");
                self._shown = false;
                $(document.body).append(self.content);
                
                self.setText({
                    text: options.text
                });
                
                self.resize_handle = function () {
                    self.resize();
                };
                
                self.tap_handle = function () {
                    self.destroy();
                };
                
                $(window).bind("resize", self.resize_handle);
                
                self.runner = new Runner(function () {
                    if((new Date()).getTime() - self.startTime >= self.duration)
                    {
                        self.destroy();
                        self.runner.pause();
                    }
                }, 60);
                
                EventCenter.listen("viewbeforechange", function () {
                    self.onDestroy = function () {};
                    self.destroy();
                });
                
                self.show();
            },
            {
                shown: function () {
                    return this._shown;
                },
                resize: function () {
                    if(this.shown() == true)
                    {
                        var self = this;
                        var contentSize = {
                            width: self.content.outerWidth(),
                            height: self.content.outerHeight()
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
                    if(this._shown == false)
                    {
                        var self = this;
                        clearTimeout(self.tid);
                        this.content.fadeIn(100, function () {
                            $(window).bind("click touchstart keydown keyup", self.tap_handle);
                            self.startTime = (new Date()).getTime();
                            self.runner.start();
                        });
                        this._shown = true;
                        this.resize();
                    }
                },
                /**
                 * @param options.complete
                 */
                hide: function (options) {
                    if(this._shown == true)
                    {
                        var self = this;
                        self.runner.pause();
                        this.content.fadeOut(60, function () {
                            self.content.hide();
                            self._shown = false;
                            options && options.complete && options.complete();
                        });
                    }
                },
                destroy: function () {
                    var self = this;
                    this.hide({
                        complete: function () {
                            self.content.remove();
                            $(window).unbind("resize", self.resize_handle);
                            $(window).unbind("click touchstart keydown keyup", self.tap_handle);
                            self.send("destroy", self);
                            self.onDestroy(self);
                        }
                    });
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.text
                 */
                setText: function (options) {
                    this.content.html(options.text);
                }
            }
        );
        
        return Toast;
    }
);
