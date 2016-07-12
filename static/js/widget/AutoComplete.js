define(
    [
        "lib/jQuery"
    ],
    function ($) {
        /**
         * 
            * @param {Object} options
            * @param options.input
            * @param options.getter
            * @param options.onComplete
         */
        function AutoComplete(options) {
            var self = this;
            options = options || {};
            options.input = $(options.input);
            self.onComplete = function () {};
            this.listUl = $("<ul></ul>");
            this.list = $("<div></div>");
            this.list.css({
                border: "1px solid #c6c6c6",
                borderBottom: "none",
                display: "none",
                position: "absolute",
                backgroundColor: "#ffffff",
                zIndex: 20001
            });
            this.listUl.css({
                listStyle: "none",
                fontSize: "12px",
                padding: "0",
                margin: "0",
                backgroundColor: "#ffffff"
            });
            this.list.append(this.listUl);
            $.extend(this, options);
            $(document.documentElement).append(this.list).bind("click", function () {
                self.hide();
            });
            self.input
            .bind("click", function (e) {
                e.stopPropagation();
                return false;
            })
            .bind("keydown keyup", function (e) {
                switch(e.keyCode) {
                    case 38:
                        if(self.shown == true && e.type == "keydown")
                        {
                            self.focusPrev();
                            e.stopPropagation();
                            return false;
                        }
                        break;
                    case 40:
                        if(self.shown == true && e.type == "keydown")
                        {
                            self.focusNext();
                            e.stopPropagation();
                            return false;
                        }
                        break;
                    case 9:
                        if(self.shown == true && e.type == "keydown")
                        {
                            self.focusNext();
                            e.stopPropagation();
                            return false;
                        }
                        break;
                    case 13:
                        var hoverItem = self.listUl.find("li.js-item.js-hover");
                        if(self.shown == true && e.type == "keydown" && hoverItem && hoverItem.length > 0)
                        {
                            hoverItem.trigger("click");
                            e.stopPropagation();
                            return false;
                        }
                        break;
                    default: 
                        var value = self.input.val();
                        if(e.keyCode != undefined)
                        {
                            self.input.removeClass("completed");
                        }
                        if(value.length <= 0)
                            self.hide();
                        else
                        {
                            self.getter(self.input.val(), function (result) {
                                self.clean();
                                self.hide();
                                if(result && result.length > 0)
                                {
                                    self.fill(result);
                                    self.show();
                                }
                            }); 
                        } 
                        break;
                }
            })
            .bind("focus", function () {
                $(this).trigger("keydown");
            });
            this.focusIndex = 0;
            this.listLen = 0;
            this.shown = false;
            setInterval(function () {
                self.adjust();
            }, 16);
        };
        
        AutoComplete.prototype.focusNext = function () {
            var index = 0;
            if(this.focusIndex >= this.listLen)
            {
                index = 1; 
            }
            else
            {
                index = this.focusIndex + 1;
            }
            this.focusItem(index);
        };
        
        AutoComplete.prototype.focusPrev = function () {
            var index = 0;
            if(this.focusIndex <= 1)
            {
                index = this.listLen; 
            }
            else
            {
                index = this.focusIndex - 1;
            }
            this.focusItem(index);
        };
        
        AutoComplete.prototype.focusItem = function (index) {
            if(this.focusIndex > 0 && this.focusIndex <= this.listLen)
            {
                this.blurItem(this.focusIndex);
            }
            this.focusIndex = index;
            var focusItem = this.listUl.find("li.js-item[data-index='" + index + "']");
            if(focusItem && focusItem.length > 0)
            {
                focusItem.css({
                    "fontWeight": "bold",
                    "backgroundColor": "#E0FFFF"
                }).addClass("js-hover"); 
                return true;
            }
            return false;
        };
        
        AutoComplete.prototype.blurItem = function (index) {
            this.focusIndex = 0;
            var focusItem = this.listUl.find("li.js-item[data-index='" + index + "']");
            if(focusItem && focusItem.length > 0)
            {
                focusItem.css({
                    "fontWeight": "",
                    "backgroundColor": ""
                }).removeClass("js-hover"); 
                return true;
            }
            return false;
        };
        
        AutoComplete.prototype.fill = function (data) {
            this.clean();
            var self = this;
            var list = [];
            for(var i = 0, l = data.length; i < l; ++ i)
            {
                var content= data[i].content;
                list.push("<li data-index='" + ( i + 1 ) + "' style='padding-left: 2px; padding-right: 2px; padding-top: 1px; padding-bottom: 1px; cursor: pointer; border-bottom: 1px solid #c6c6c6;' class='js-item' data-query='" + content + "'>" + content + "</li>");
            }
            self.listLen = list.length;
            list = $(list.join(""));
            this.listUl.html(list);
            this.listUl.find("li.js-item").hover(
                function () {
                    var index = parseInt($(this).attr("data-index"));
                    self.blurItem(index - 1);
                    self.focusItem(index);
                },
                function () {
                    self.blurItem($(this).attr("data-index"));
                }
            )
            .bind("click", function () {
                self.complete($(this).attr("data-query"), data[$(this).attr("data-index") - 1]);
                self.hide();
            });
            this.show();
        };
        
        AutoComplete.prototype.complete = function (result, data) {
            this.input.addClass("completed");
            this.input.val(result);
            this.hide();
            this.onComplete(data, result);
        };
        
        AutoComplete.prototype.adjust = function () {
            var inputPosition = this.input.offset();
            var inputTop = inputPosition.top;
            var inputLeft = inputPosition.left;
            var inputHeight = this.input.outerHeight();
            var inputBottom = inputTop + inputHeight;
            var inputWidth = this.input.innerWidth();
            this.list.css({
                left: inputLeft + "px",
                top: inputBottom + 2 + "px",
                minWidth: inputWidth
            });
        };
        
        AutoComplete.prototype.show = function () {
            if(this.input.hasClass("completed"))
                return;
            this.shown = true;
            this.focusIndex = 0;
            this.adjust();
            this.list.show();
        };
        
        AutoComplete.prototype.clean = function (data) {
            this.listLen = 0;
            this.listUl.html("");
        };
        
        AutoComplete.prototype.hide = function (data) {
            this.shown = false;
            this.focusIndex = 0;
            this.list.hide();
        };
        
        return AutoComplete;
    }
);