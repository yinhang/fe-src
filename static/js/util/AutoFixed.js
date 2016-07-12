define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        
        var AutoFixed = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
                * @param options.onFixed
                * @param options.fixedOffset
                * @param options.onRestore
             */
            function (options) {
                var self = this;
                options = options || {};
                
                options = $.extend({
                    onFixed: function () {},
                    onRestore: function () {},
                    fixedOffset: 0
                }, options);
                
                $.extend(options, {
                    target: $(options.target)
                });
                $.extend(self, options);
                self.viewport = $(window);
                self.state = null;
                self.targetMocker = self.target.clone();
                self.targetMocker.css({
                    visibility: "hidden",
                    display: "none"
                });
                self.target.after(self.targetMocker);
                $(function () {
                    self.adjust();
                    self.viewport.bind("scroll resize", function (e) {
                        if(e.type == "resize")
                            self.adjust(true);
                        else
                        {
                            self.adjust();
                        }
                    });
                });
                
                self.disabled = false;
            },
            {
                disable: function () {
                    this.restore();
                    this.disabled = true;
                },
                enable: function () {
                    this.disabled = false;
                    this.adjust();
                },
                fixed: function () {
                    var self = this;
                    var targetDOM = self.target.get(0);
                    self.target.data("def_size", {
                        width: targetDOM.style.width,
                        height: targetDOM.style.height
                    });
                    self.target.css({
                        width: self.target.width() + "px",
                        height: self.target.height() + "px"
                    });
                    var children = [];
                    self.target.find("*").each(function () {
                        var $el = $(this);
                        var $elDOM = $el.get(0);
                        $el.data("def_size", {
                            width: $elDOM.style.width,
                            height: $elDOM.style.height
                        });
                        children.push($el);
                        children.push($el.width() + "px");
                        children.push($el.height() + "px");
                    });
                    self.target.hide();
                    for(var i = 0, l = children.length; i < l; i += 3)
                    {
                        children[i].css({
                            width: children[i + 1],
                            height: children[i + 2]
                        });
                    }
                    self.target.show();
                    self.targetMocker.show();
                    self.target.css({
                        position: "fixed",
                        top: 0
                    });
                    self.onFixed(self.target);
                    self.state = "leave";
                },
                restore: function () {
                    var self = this;
                    var defSize = self.target.data("def_size");
                    if(defSize)
                    {
                        self.target.css({
                            width: defSize.width,
                            height: defSize.height
                        });
                    }
                    self.target.find("*").each(function () {
                        var $el = $(this);
                        var defSize = $el.data("def_size");
                        if(defSize)
                        {
                            $el.css({
                                width: defSize.width,
                                height: defSize.height
                            });
                        }
                    });
                    self.targetMocker.css({
                        display: "none"
                    });
                    self.target.css({
                        position: "",
                        top: ""
                    });
                    self.onRestore(self.target);
                    self.state = "enter";
                },
                adjust: function (reset) {
                    if(this.disabled == true)
                    {
                        return;
                    }
                    var self = this;
                    if(self.viewport.scrollTop() >= self.target.offset().top - self.fixedOffset)
                    {
                        if(self.state != "leave")
                        {
                            self.fixed();
                        }
                    }
                    if((self.state == "leave" && self.viewport.scrollTop() < self.targetMocker.offset().top - self.fixedOffset) || reset === true)
                    {
                        self.restore();
                        if(reset === true)
                            self.adjust();
                    }

                }
            }
        );
        
        return AutoFixed;
    }
);