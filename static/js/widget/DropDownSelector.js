define(
    [
        "lib/jQuery",
        "base/Class",
        "util/FunctionalMarker"
    ],
    function ($, Class, FunctionalMarker) {
        
        var DropDownSelector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target	
                * @param options.onChange
                * @param options.options
                * @param optoins.placeholder
             */
            function (options) {
            	var self = this;
            	
            	options = $.extend({
            		placeholder: "",
            		onChange: function () {},
            		options: []
            	}, options);
            	
            	self.options = options;
            	self.target = options.target;
            	self.target.addClass("dropdownselector");
            	self.target.append("<button type='button' class='above'><p>" + options.placeholder + "</p><span class='icon'></span></button><ul class='below'></ul>");
            	self.list = self.target.find("ul.below");
            	self.selector = self.target.find("button.above");
            	
            	var defIndex = null;
            	
            	for(var i = 0, l = options.options.length; i < l; ++ i)
        		{
            		var option = options.options[i];
            		if(option.selected)
        			{
            			defIndex = i;
        			}
            		
            		var item = $("<li><button type='button' data-index='" + i + "' data-text='" + option.text + "' data-value='" + option.value + "'>" + option.text + "</button></li>");
            		item.find("button").bind("click", (function (_onClick) {
            			return function () {
            				_onClick && _onClick();
            			};
            		})(option.onClick));
            		self.list.append(item);
        		}
            	
            	if(defIndex == null && options.placeholder.length <= 0)
        		{
        			defIndex = 0;
        		}
            	
            	if(defIndex != null)
        		{
            		this.setValue(defIndex);
        		}
            	
            	options.target.find("button.above").click(function (event) {
            		event.stopImmediatePropagation();
            		self.list.toggleClass("active");
            	});
            	
            	$(document).click(function(){
            		self.list.removeClass("active");
				});
            	
        		options.target.find("ul.below li button").click(function(){
        			self.setValue($(this).data("index"));
        		});
        		
        		this.adjust();
        		$(window).bind("resize", function () {
        			self.adjust();
        		});
            },
            {
            	adjust: function () {
            		var pos = this.selector.offset();
            		var width = this.selector.outerWidth();
            		var height = this.selector.outerHeight();
            		this.list.css({
            			top: height + "px"
            		});
            	},
            	setValue: function (index) {
            		var optionButton = this.target.find("ul.below button[data-index='" + index + "']");
        			this.selector.find("p").html(optionButton.data("text"));
        			this.selector.data("text", optionButton.data("text"));
        			this.selector.data("value", optionButton.data("value"));
        			this.options.onChange(this);
        			this.selector.addClass("selected");
            	},
            	getSelected: function () {
            		var self = this;
            		return {
            			text: self.selector.data("text"),
            			value: self.selector.data("value")
            		};
            	}
            }
        );
        
        FunctionalMarker.regist({
        	packageName: "widget/DropDownSelector",
        	init: function (element, params) {
        		var $element = $(element);
        		var options = [];
        		
        		$element.find("div").each(function () {
        			var $option = $(this);
        			
        			options.push({
        				text: $option.data("text"),
        				value: $option.data("value"),
        				selected: $option.data("selected") != undefined ? true : false,
        				onClick: (function (_$option) {
        					var onclickStr = _$option.data("onclick");
        					if(onclickStr && onclickStr.length > 0)
    						{
            					return function () {
            						eval("(" + _$option.data("onclick") + ")");
            					};
    						}
        					else
        					{
        						return function () {};
        					}
        				})($option)
        			});
        		});
        		
        		$element.empty();
        		
            	new DropDownSelector({
            		target: $(element),
            		options: options,
            		placeholder: params.placeholder,
            		onChange: params.onChange || function () {}
            	});
        	}
        });
        
        return DropDownSelector;
    }
);
