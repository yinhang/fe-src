define(
    [
        "lib/jQueryMobile",
        "widget/QuickSelector",
        "base/Class",
        "widget/WheelSelector",
        "util/Number",
        "util/FunctionalMarker",
        "util/Date"
    ],
    function ($, QuickSelector, Class, WheelSelector, Number, FunctionalMarker, DateUtil) {
        
        var DateTimeWheelSelector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.onChange
                * @param options.valueList [{value: 1, data: {}}]
                * @param options.selectedValue
                * 
                * @param options.x
                * @param options.y
                * @param options.height
                * @param options.width
                * @param options.target
             */
            function (options) {
                this._super({
                    onChange: options.onChange,
                    valueList: options.valueList,
                    defaultValue: options.selectedValue,
                    x: options.x,
                    y: options.y,
                    height: options.height,
                    width: options.width,
                    target: options.target
                });
            },
            {
                
            },
            WheelSelector
        );
        
        var YearWheelSelector= Class.define(
            /**
                * @param {Object} options
                * @param options.onChange
                * @param options.selectedValue
                * 
                * @param options.x
                * @param options.y
                * @param options.height
                * @param options.width
                * @param options.target
             */
            function(options) {
                var valueList = [];
                var yearNow = (new Date()).getFullYear();
                
                for(var i = yearNow - 50, l = yearNow + 50; i <= l; ++i)
                {
                      valueList.push({
                          value: i + "年",
                          data: {}
                      });
                }
                
                this._super({
                    onChange: options.onChange,
                    valueList: valueList,
                    selectedValue: options.selectedValue + "年",
                    x: options.x,
                    y: options.y,
                    height: options.height,
                    width: options.width,
                    target: options.target
                });
            },
            {
            },
            DateTimeWheelSelector
        );
        
        var MonthWheelSelector= Class.define(
            function(options) {
                var valueList = [];
                
                for(var i = 1, l = 12; i <= l; ++i)
                {
                      valueList.push({
                          value: i + "月"
                      });
                }
                
                this._super({
                    onChange: options.onChange,
                    valueList: valueList,
                    selectedValue: options.selectedValue + "月",
                    x: options.x,
                    y: options.y,
                    height: options.height,
                    width: options.width,
                    target: options.target
                });
            },
            {
                setYear: function (value) {
                    
                }
            },
            DateTimeWheelSelector
        );
        
        var DateWheelSelector= Class.define(
            function(options) {
                var valueList = [];
                
                for(var i = 1, l = 31; i <= l; ++i)
                {
                      valueList.push({
                          value: i + "日"
                      });
                }
                
                this._super({
                    onChange: options.onChange,
                    valueList: valueList,
                    selectedValue: options.selectedValue + "日",
                    x: options.x,
                    y: options.y,
                    height: options.height,
                    width: options.width,
                    target: options.target
                });
            },
            {
                setYearAndMonth: function (year, month) {
                    if($.inArray(month, [1,3,5,7,8,10,12]) != -1)
                    {
                        this.enableValue(29 + "日");
                        this.enableValue(30 + "日");
                        this.enableValue(31 + "日");
                    }
                    else if($.inArray(month, [4,6,9,11]) != -1)
                    {
                        this.enableValue(29 + "日");
                        this.enableValue(30 + "日");
                        this.disableValue(31 + "日");
                    }
                    else
                    {
                        if(( year % 4 == 0 && year % 100 != 0) || ( year % 400 == 0 ))
                        {
                            this.enableValue(29 + "日");
                            this.disableValue(30 + "日");
                            this.disableValue(31 + "日");
                        }
                        else
                        {
                            this.disableValue(29 + "日");
                            this.disableValue(30 + "日");
                            this.disableValue(31 + "日");
                        }
                    }
                }
            },
            DateTimeWheelSelector
        );
        
        var HourWheelSelector= Class.define(
            function(options) {
                var valueList = [];
                
                for(var i = 0, l = 23; i <= l; ++i)
                {
                      valueList.push({
                          value: Number.makeUpZero(i, 2) + "时"
                      });
                }
                
                this._super({
                    onChange: options.onChange,
                    valueList: valueList,
                    selectedValue: Number.makeUpZero(options.selectedValue, 2) + "时",
                    x: options.x,
                    y: options.y,
                    height: options.height,
                    width: options.width,
                    target: options.target
                });
            },
            {
                
            },
            DateTimeWheelSelector
        );
        
        var MinuteWheelSelector= Class.define(
            function(options) {
                var valueList = [];
                
                for(var i = 0, l = 59; i <= l; ++i)
                {
                      valueList.push({
                          value: Number.makeUpZero(i, 2) + "分"
                      });
                }
                
                this._super({
                    onChange: options.onChange,
                    valueList: valueList,
                    selectedValue: Number.makeUpZero(options.selectedValue, 2) + "分",
                    x: options.x,
                    y: options.y,
                    height: options.height,
                    width: options.width,
                    target: options.target
                });
            },
            {
                
            },
            DateTimeWheelSelector
        );
        
        var DateTimeSelector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.onOk
                * @param options.defaultTime
                * @param select ["year", "month", "date", "hour", "minute"]
             */
            function (options) {
                var self = this;

                var date = new Date();

                date.setTime(options.defaultTime);
                
                options = $.extend({
                    defaultTime: new Date().getTime(),
                    onOk: function () {},
                    select:  ["year", "month", "date", "hour", "minute"]
                }, options);
                
                self.options = options;
                
                var date = new Date();

                date.setTime(options.defaultTime);
                
                this.value = date;
                
                this._super({
                    onSure: function () {
                        options.onOk(self.getValue());
                        self.destroy();
                    },
                    height: 200,
                    title: "选择时间",
                    className: "datetime-selector",
                    onResize: function (dialog) {
                        
                    },
                    onShow: function (dialog) {
                        var size = dialog.getContentSize();
                        var width = size.width / options.select.length;
                        var height = size.height;
                        var y = 0;
                        
                        var select = options.select;
                        
                        for(var i = 0, l = select.length; i < l; ++ i)
                        {
                            switch(select[i])
                            {
                                case "year":
                        
                                    self.yearWheelSelector = new YearWheelSelector({
                                        target: $(dialog.getContent()),
                                        height: height,
                                        width: width,
                                        y: y,
                                        selectedValue: self.value.getFullYear(),
                                        onChange: function (value, data) {
                                            if(self.dateWheelSelector) 
                                            {
                                                self.dateWheelSelector.setYearAndMonth(parseInt(value), parseInt(self.monthWheelSelector.getValue()));
                                            }
                                        }
                                    });
                                break;
                                case "month":
                                    self.monthWheelSelector = new MonthWheelSelector({
                                        target: $(dialog.getContent()),
                                        height: height,
                                        width: width,
                                        y: y,
                                        selectedValue: self.value.getMonth() + 1,
                                        onChange: function (value, data) {
                                            if(self.dateWheelSelector)
                                            {
                                                self.dateWheelSelector.setYearAndMonth(parseInt(self.yearWheelSelector.getValue()), parseInt(value));
                                            }
                                        }
                                    });
                                break;
                                case "date":
                                    self.dateWheelSelector = new DateWheelSelector({
                                        target: $(dialog.getContent()),
                                        height: height,
                                        width: width,
                                        y: y,
                                        selectedValue: self.value.getDate(),
                                        onChange: function (value, data) {
                                            date.setMonth(parseInt(value) - 1);
                                            date.setDate(parseInt(value));
                                        }
                                    });
                                    
                                    self.dateWheelSelector.setYearAndMonth(parseInt(self.yearWheelSelector.getValue()), parseInt(self.monthWheelSelector.getValue()));
                                break;
                                case "hour":
                                    self.hourWheelSelector = new HourWheelSelector({
                                        target: $(dialog.getContent()),
                                        height: height,
                                        width: width,
                                        y: y,
                                        selectedValue: self.value.getHours(),
                                        onChange: function (value, data) {
                                            
                                        }
                                    });
                                break;
                                case "minute":
                                    self.minuteWheelSelector = new MinuteWheelSelector({
                                        target: $(dialog.getContent()),
                                        height: height,
                                        width: width,
                                        y: y,
                                        selectedValue: self.value.getMinutes(),
                                        onChange: function (value, data) {
                                            
                                        }
                                    });
                                break;
                            }
                        }
                    }
                });
                
               self.show();
            },
            {
                getValue: function () {
                    var self = this;
                    var date = new Date();

                    date.setTime(0);
                    
                    var select = self.options.select;
                    
                    for(var i = 0, l = select.length; i < l; ++ i)
                    {
                        switch(select[i])
                        {
                            case "year":
                                date.setYear(parseInt(self.yearWheelSelector.getValue()));
                            break;
                            case "month":
                                date.setMonth(parseInt(self.monthWheelSelector.getValue()) - 1);
                            break;
                            case "date":
                                date.setDate(parseInt(self.dateWheelSelector.getValue()));
                            break;
                            case "hour":
                                date.setHours(parseInt(self.hourWheelSelector.getValue()));
                            break;
                            case "minute":
                                date.setMinutes(parseInt(self.minuteWheelSelector.getValue()));
                            break;
                        }
                    }
                    
                    return date.getTime();
                }
            },
            QuickSelector
        );
        
        FunctionalMarker.regist({
            packageName: "widget/DateTimeSelector",
            init: function (element, params, name) {
                var $element = $(element);
                $element.attr("readonly", "readonly");
                
                var select = ["year", "month", "date", "hour", "minute"];
                
                if(params.noSelect && params.noSelect.length > 0)
                {
                    params.noSelect = params.noSelect.split(",");
                    for(var i = params.noSelect.length - 1; i >= 0; -- i)
                    {
                        var testIndex = $.inArray(params.noSelect[i], select);
                        if(testIndex != -1)
                        {
                            select.splice(testIndex, 1);
                        }
                    }
                }

                $element.bind("click", function () {

                    var defaultTime = $(this).data(name + "SelectedTimestamp");

                    new DateTimeSelector({
                        select: select,
                        defaultTime: ( defaultTime && (defaultTime + "").length > 0 ) ? defaultTime : undefined,
                        onOk: function (value) {
                            $element.data(name + "SelectedTimestamp", value);
                            var date = new Date();
                            date.setTime(value);
                            
                            var inputValueFormat = params.inputvalueFormat;
                            if(!(inputValueFormat && inputValueFormat.length > 0))
                            {
                                inputValueFormat = "Y-M-d h:m:s";
                            }
                            
                            $element.val(DateUtil.format(inputValueFormat, date));
                            
                            var saveValueElementSelector = params.savevalueElementSelector;
                            
                            if(saveValueElementSelector && saveValueElementSelector.length > 0)
                            {
                                var savevalueFormat = params.savevalueFormat;
                                if(!(savevalueFormat && savevalueFormat.length > 0))
                                {
                                    savevalueFormat = inputValueFormat;
                                }
                                
                                $(saveValueElementSelector).val(DateUtil.format(savevalueFormat, date));
                            }
                        }
                    });
                });
            }
        });
        
        return DateTimeSelector;
    }
);
