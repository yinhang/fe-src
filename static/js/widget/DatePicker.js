define(
    [
        "lib/jQueryMobile",
        "widget/overlay/Singleton",
        "util/Touch",
        "Runner",
        "base/Class",
        "util/Date",
        "util/Number",
        "Config"
    ],
    function ($, Overlay, Touch, Runner, Class, DateUtil, NumberUtil, Config) {
        
        /**
         * 基础组件
         */
        var Component = Class.define(
            /**
             * options.x
             * options.y
             * options.height
             * options.width
             */
            function (options) {
                options = options || {};
                options = $.extend({
                    x: 0,
                    y: 0,
                    height: 0,
                    width: 0
                }, options);
                
                $.extend(this, options);
            },
            {
                setDOM: function (dom) {
                    this.dom = dom;
                },
                getDOM: function () {
                    return this.dom;
                },
                setHeight: function (height) {
                    this.dom.css("height", height + "px");
                    this.height = height;
                },
                setWidth: function (width) {
                    this.dom.css("width", width + "px");
                    this.width = width;
                },
                setX: function (x) {
                    this.dom.css("left", x + "px");
                    this.x = x;
                },
                setY: function (y) {
                    this.dom.css("top", y + "px");
                    this.y = y;
                },
                getX: function () {
                    return this.x;
                },
                getY: function () {
                    return this.y;
                },
                getHeight: function () {
                    return this.height;
                },
                getWidth: function () {
                    return this.width;
                }, 
                render: function () {
                    
                }
            }
        );
        
        /**
         * 时间刻度组件
         */
        var Calibration = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.value
                * @param options.name
             */
            function (options) {
                this._super();
                options = $.extend({
                    value: "",
                    name: ""
                }, options);
                
                $.extend(this, options);
                
                this.setDOM($("<li style='position: absolute;' data-value='" + this.value + "'>" + this.name + "</li>"));
                
                this.enable();
            },
            {
                getValue: function () {
                   return this.value;
                },
                setHeight: function (height) {
                    this._super.setHeight(height);
                    this.getDOM().css({
                        lineHeight: height + "px",
                        fontSize: parseInt(( height * 0.3 )) + "px"
                    });
                },
                setWidth: function (width) {
                    this._super.setWidth(width);
                },
                enable: function () {
                    this.enabled = true;
                    this.getDOM().removeClass("disabled");
                },
                disabled: function () {
                    return this.enabled == true ? false : true;
                },
                disable: function () {
                    this.enabled = false;
                    this.getDOM().addClass("disabled");
                }
            },
            Component
        );
        
        /**
         * 滚轮组件
         */
        var Wheel = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.start
                * @param options.end
                * @param options.suffix
                * @param options.wheelSize
                * @param options.value
                * @param options.makeUpZero
                * @param options.onChange
                * 
             */
            function (options) {
                this._super();
                var self = this;
                
                options = $.extend({
                    start: 0,
                    end: 0,
                    suffix: "",
                    wheelSize: 5,
                    value: options.start,
                    makeUpZero: null,
                    onChange: function () {}
                }, options);
                
                if(this.wheelSize % 2 == 0)
                    throw new Error("wheelSize必须是奇数");
                
                $.extend(this, options);
                
                this.calibrationList = {};
                
                this.buffer = [];
                
                for(var i = this.start, l = this.end; i <= l; ++ i)
                {
                    this.addCalibration(new Calibration({
                        value: i,
                        name: ( self.makeUpZero ? NumberUtil.makeUpZero(i, self.makeUpZero) : i ) + self.suffix
                    }));
                }
                
                this.setDOM($("<ul class='wheel'></ul>"));
                
                this.setValue(options.value);
                
                this.speed = 0;
                
                this.speedAttenuation = 5;
            },
            {
                disableValue: function (value) {
                    this.calibrationList[value].disable();
                    this.setValue(this.getValue(), true);
                },
                enableValue: function (value) {
                    this.calibrationList[value].enable();
                    this.setValue(this.getValue(), true);
                },
                getSize: function () {
                    return this.wheelSize;
                },
                addCalibration: function (calibration) {
                    this.calibrationList[calibration.getValue()] = calibration;
                },
                getValue: function () {
                    return this.value;
                },
                setValue: function (value, force) {
                    if(value == this.value && force != true)
                        return;
                    var calibration = this.getCalibration(value);
                    if(calibration && calibration.disabled())
                    {
                        this.setValue(this.getPrevValue(value), true);
                        return;
                    }
                    this.value = value;
                    this.focusValue();
                    this.onChange(this.getValue());
                },
                getNextValue: function (value) {
                    ++ value;
                    if(value > this.end)
                    {
                        return this.start;
                    }
                    return value;
                },
                getCalibration: function (value) {
                    return this.calibrationList[value];
                },
                getPrevValue: function (value) {
                    -- value;
                    if(value < this.start)
                    {
                        return this.end;
                    }
                    return value;
                },
                fillBufferTail: function () {
                    var lastCalibration = this.buffer[this.buffer.length - 1];
                    var calibration = this.getCalibration(this.getNextValue(lastCalibration.getValue()));
                    calibration.setY(lastCalibration.getY() + lastCalibration.getHeight());
                    this.buffer.push(calibration);
                    this.dom.find("li[data-value='" + this.buffer.shift().getValue() + "']").remove();
                    this.dom.append(calibration.getDOM());
                },
                fillBufferHead: function () {
                    var firstCalibration = this.buffer[0];
                    var calibration = this.getCalibration(this.getPrevValue(firstCalibration.getValue()));
                    calibration.setY(firstCalibration.getY() - calibration.getHeight());
                    this.buffer.unshift(calibration);
                    this.dom.find("li[data-value='" + this.buffer.pop().getValue() + "']").remove();
                    this.dom.prepend(calibration.getDOM());
                },
                autoSelect: function () {
                    var viewHeight = this.getHeight() / this.wheelSize;
                    var viewTop = viewHeight * Math.floor(this.wheelSize / 2);
                    var viewBottom = viewHeight + viewTop;
                    var viewCenterY = viewBottom - viewHeight / 2;
                    
                    var selected = null;
                    var minCenterDiff = null;
                    
                    for(var i = 0, l = this.buffer.length; i < l; ++ i)
                    {
                        var calibration = this.buffer[i];
                        var top = calibration.getY();
                        var height = calibration.getHeight();
                        var bottom = top + height;
                        var centerY = bottom - height / 2;
                        var centerDiff = Math.abs(centerY - viewCenterY);
                        if(minCenterDiff == null || centerDiff < minCenterDiff)
                        {
                            minCenterDiff = centerDiff;
                            selected = calibration;
                        }
                    }
                    
                    this.setValue(selected.getValue());
                },
                focusValue: function () {
                    this.buffer = [this.getCalibration(this.getValue())];
                    var bufferSize = this.wheelSize + 2;
                    var halfBufferSize = ( bufferSize - 1 ) / 2;
                    for(var i = 0, value = this.getValue(); i < halfBufferSize; ++ i)
                    {
                        value = this.getPrevValue(value);
                        this.buffer.unshift(this.getCalibration(value));
                    }
                    for(var i = 0, value = this.getValue(); i < halfBufferSize; ++ i)
                    {
                        value = this.getNextValue(value);
                        this.buffer.push(this.getCalibration(value));
                    }
                    var startY = this.getHeight() / this.wheelSize * -1;
                    var dom = this.getDOM();
                    dom.html("");
                    for(var i = 0, l = this.buffer.length; i < l; ++ i)
                    {
                        var calibration = this.buffer[i];
                        calibration.setY(startY);
                        startY += calibration.getHeight();
                        dom.append(calibration.getDOM());
                    }
                },
                getCalibrationList: function () {
                    return this.calibrationList;
                },
                setHeight: function (height) {
                    this._super.setHeight(height);
                    var calibrationHeight = parseInt(height / this.wheelSize);
                    for(var name in this.calibrationList)
                    {
                        var calibration = this.calibrationList[name];
                        calibration.setHeight(calibrationHeight);
                    }
                    this.focusValue();
                },
                setWidth: function (width) {
                    this._super.setWidth(width);
                    var calibrationWidth = this.getWidth();
                    for(var i = 0, l = this.calibrationList.length; i < l; ++ i)
                    {
                        var calibration = this.calibrationList[i];
                        calibration.setWidth(calibrationWidth);
                    }
                    this.focusValue();
                },
                enableInertia: function () {
                    this.inertiaEnabled = true;
                },
                disableInertia: function () {
                    this.inertiaEnabled = false;
                    this.speed = 0;
                },
                moveDown: function (speed) {
                    this.move(speed);
                },
                move: function (speed) {
                    this.speed = speed;
                    var wheelHeight = this.getHeight();
                    var calibrationCache = [];
                    for(var i = 0, l = this.buffer.length; i < l; ++ i)
                    {
                        var calibration = this.buffer[i];
                        //设置坐标
                        calibration.setY(calibration.getY() + speed);
                        calibrationCache.push(calibration);
                    }
                    
                    for(var i = 0, l = calibrationCache.length; i < l; ++ i)
                    {
                        var calibration = calibrationCache[i];
                        //处理可能出现的溢出
                        var top = calibration.getY();
                        var bottom = top + calibration.getHeight();
                        if(bottom < 0)
                        {
                            //console.log("tail" + new Date().getTime());
                            this.fillBufferTail();
                        }
                        if(top > wheelHeight)
                        {
                            //console.log("head" + new Date().getTime());
                            this.fillBufferHead();
                        }
                    }
                },
                moveUp: function (speed) {
                    this.move(speed * -1);
                },
                render: function () {
                    if(this.inertiaEnabled)
                    {
                        var speed = this.speed;
                        if(speed != 0)
                        {
                            if(Math.abs(speed) >= this.speedAttenuation)
                            {
                                if(speed > 0)
                                {
                                    speed -= this.speedAttenuation;
                                }
                                else
                                {
                                    speed += this.speedAttenuation;
                                }
                            }
                            else
                            {
                                if(speed > 0)
                                {
                                    speed = this.speedAttenuation;
                                }
                                else
                                {
                                    speed = this.speedAttenuation * -1;
                                }
                            }
                            this.move(speed);
                        }
                        else
                        {
                            this.autoSelect();
                        }
                    }
                }
            },
            Component
        );
        
        var WheelYear = Class.define(
            function (options) {
                this._super({
                    start: 1,
                    end: 2050,
                    suffix: "年",
                    onChange: options.onChange,
                    value: options.value
                });
            },
            {
            }, 
            Wheel
        );
        
        var WheelMonth = Class.define(
            function (options) {
                this._super({
                    start: 1,
                    end: 12,
                    suffix: "月",
                    onChange: options.onChange,
                    value: options.value
                });
            },
            {
            }, 
            Wheel
        );
        
        var WheelDate = Class.define(
            function (options) {
                this._super({
                    start: 1,
                    end: 31,
                    suffix: "日",
                    onChange: options.onChange,
                    value: options.value
                });
            },
            {
            }, 
            Wheel
        );
        
        var WheelHour = Class.define(
            function (options) {
                this._super({
                    start: 0,
                    end: 23,
                    suffix: "时",
                    onChange: options.onChange,
                    value: options.value, 
                    makeUpZero: 2
                });
            },
            {
            }, 
            Wheel
        );
        
        var WheelMinute = Class.define(
            function (options) {
                this._super({
                    start: 0,
                    end: 59,
                    suffix: "分",
                    onChange: options.onChange,
                    value: options.value, 
                    makeUpZero: 2
                });
            },
            {
            }, 
            Wheel
        );
        
        /**
         * 选择器组件
         */
        var Selector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.wheel
                * @param options.onChange
             */
            function (options) {
                var self = this;
                options = $.extend({
                    wheel: null,
                    onChange: function () {}
                }, options);
                
                $.extend(this, options);
                
                this.setDOM($("<div class='selector' style='position: absolute;'><div class='mask top'></div><div class='mask bottom'></div></div>"));
                this.getDOM().append(this.wheel.getDOM());
                
                var dom = this.getDOM();
                
                var wheel = this.getWheel();
                
                this.mask = dom.find("div.mask");
                
                Touch.swipe({
                    target: dom,
                    start: function (data) {
                        wheel.disableInertia();
                    },
                    swipe: function (data) {
                        if(data.lastY > data.y)
                        {
                            wheel.moveUp(data.speedY);
                        }
                        else if(data.lastY < data.y)
                        {
                            wheel.moveDown(data.speedY);
                        }
                    },
                    end: function (data) {
                        wheel.enableInertia();
                    }
                });
                
            },
            {
                disableValue: function (value) {
                    this.getWheel().disableValue(value);
                },
                enableValue: function (value) {
                    this.getWheel().enableValue(value);
                },
                adjustMask: function () {
                    var height = this.getHeight();
                    var calibrationHeight = height / this.getWheel().getSize();
                    this.mask.css({
                        height: calibrationHeight * 2 + "px"
                    });
                },
                setValue: function (value) {
                    this.wheel.setValue(value);
                },
                getValue: function () {
                    this.wheel.getValue();
                },
                getWheel: function () {
                    return this.wheel;
                },
                setHeight: function (height) {
                    this._super.setHeight(height);
                    this.wheel.setHeight(height);
                    this.adjustMask();
                },
                setWidth: function (width) {
                    this._super.setWidth(width);
                    this.wheel.setWidth(width);
                    this.adjustMask();
                },
                render: function () {
                    this._super.render();
                    this.getWheel().render();
                }
            },
            Component
        );
        
        var SelectorYear = Class.define(
            /**
             * @param options
             * @param options.value
             * @param options.onChange
             */
            function (options) {
                var self = this;
                this._super({
                    onChange: options.onChange,
                    wheel: new WheelYear({
                        value: options.value,
                        onChange: function (value) {
                            options.onChange("year", value);
                        }
                    })
                });
            },
            {
                
            },
            Selector
        );
        
        var SelectorMonth = Class.define(
            /**
             * @param options
             * @param options.value
             * @param options.onChange
             */
            function (options) {
                var self = this;
                this._super({
                    onChange: options.onChange,
                    wheel: new WheelMonth({
                        value: options.value,
                        onChange: function (value) {
                            options.onChange("month", value);
                        }
                    })
                });
            },
            {
                
            },
            Selector
        );
        
        var SelectorDate = Class.define(
            /**
             * @param options
             * @param options.value
             * @param options.onChange
             */
            function (options) {
                var self = this;
                this._super({
                    onChange: options.onChange,
                    wheel: new WheelDate({
                        value: options.value,
                        onChange: function (value) {
                            options.onChange("date", value);
                        }
                    })
                });
            },
            {
                
            },
            Selector
        );
        
        var SelectorHour = Class.define(
            /**
             * @param options
             * @param options.value
             * @param options.onChange
             */
            function (options) {
                var self = this;
                this._super({
                    onChange: options.onChange,
                    wheel: new WheelHour({
                        value: options.value,
                        onChange: function (value) {
                            options.onChange("hour", value);
                        }
                    })
                });
            },
            {
                
            },
            Selector
        );
        
        var SelectorMinute = Class.define(
            /**
             * @param options
             * @param options.value
             * @param options.onChange
             */
            function (options) {
                var self = this;
                this._super({
                    onChange: options.onChange,
                    wheel: new WheelMinute({
                        value: options.value,
                        onChange: function (value) {
                            options.onChange("minute", value);
                        }
                    })
                });
            },
            {
                
            },
            Selector
        );
        
        var DatePicker = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.value
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    value: new Date().getTime(),
                    onChange: function () {},
                    onOk: function () {},
                    onClean: function () {}
                }, options);
                
                $.extend(this, options);
                
                this.dom = $("<div class='datepicker' style='position: fixed; left: 0px; right: 0px; bottom: 0px; display: none;z-index: 20000;'><div class='title'></div></div>");
                this.shown = false;
                
                this.selectorList = [
                    {
                        name: "year",
                        selector: new SelectorYear({
                            onChange: function (name, value) {
                                
                                var dateSelector = self.getSelector("date");
                                var monthSelector = self.getSelector("month");
                                var monthValue = monthSelector.getValue();
                                if(monthValue == 2)
                                {
                                    if((value % 4 == 0 && value % 100 != 0) || value % 400 == 0)
                                    {
                                        dateSelector.enableValue("29");
                                        dateSelector.disableValue("30");
                                        dateSelector.disableValue("31");
                                    }
                                    else
                                    {
                                        dateSelector.disableValue("29");
                                        dateSelector.disableValue("30");
                                        dateSelector.disableValue("31");
                                    }
                                }
                                
                                self.valueDate.setFullYear(value);
                                var dateString = self.getDateString();
                                var timestamp = self.getValue();
                                self.onChange(dateString, timestamp);
                                self.send("change", {
                                    dateString: dateString,
                                    timestamp: timestamp
                                });
                            }
                        }),
                        enabled: true
                    },
                    {
                        name: "month",
                        selector: new SelectorMonth({
                            onChange: function (name, value) {
                                
                                var yearSelector = self.getSelector("year");
                                var yearValue = yearSelector.getValue();
                                var dateSelector = self.getSelector("date");
                                if(value == 2)
                                {
                                    if((yearValue % 4 == 0 && yearValue % 100 != 0) || yearValue % 400 == 0)
                                    {
                                        dateSelector.enableValue("29");
                                        dateSelector.disableValue("30");
                                        dateSelector.disableValue("31");
                                    }
                                    else
                                    {
                                        dateSelector.disableValue("29");
                                        dateSelector.disableValue("30");
                                        dateSelector.disableValue("31");
                                    }
                                }
                                else
                                {
                                    if($.inArray(value, [1,3,5,7,8,10,12]) != -1)
                                    {
                                        dateSelector.enableValue("29");
                                        dateSelector.enableValue("30");
                                        dateSelector.enableValue("31");
                                    }
                                    else
                                    {
                                        dateSelector.enableValue("29");
                                        dateSelector.enableValue("30");
                                        dateSelector.disableValue("31");
                                    }
                                }
                                
                                self.valueDate.setMonth(value - 1);
                                var dateString = self.getDateString();
                                var timestamp = self.getValue();
                                
                                self.onChange(dateString, timestamp);
                                self.send("change", {
                                    dateString: dateString,
                                    timestamp: timestamp
                                });
                            }
                        }),
                        enabled: true
                    },
                    {
                        name: "date",
                        selector: new SelectorDate({
                            onChange: function (name, value) {
                                self.valueDate.setDate(value);
                                var dateString = self.getDateString();
                                var timestamp = self.getValue();
                                self.onChange(dateString, timestamp);
                                self.send("change", {
                                    dateString: dateString,
                                    timestamp: timestamp
                                });
                            }
                        }),
                        enabled: true
                    },
                    {
                        name: "hour",
                        selector: new SelectorHour({
                            onChange: function (name, value) {
                                self.valueDate.setHours(value);
                                var dateString = self.getDateString();
                                var timestamp = self.getValue();
                                self.onChange(dateString, timestamp);
                                self.send("change", {
                                    dateString: dateString,
                                    timestamp: timestamp
                                });
                            }
                        }),
                        enabled: true
                    },
                    {
                        name: "minute",
                        selector: new SelectorMinute({
                            onChange: function (name, value) {
                                self.valueDate.setMinutes(value);
                                var dateString = self.getDateString();
                                var timestamp = self.getValue();
                                self.onChange(dateString, timestamp);
                                self.send("change", {
                                    dateString: dateString,
                                    timestamp: timestamp
                                });
                            }
                        }),
                        enabled: true
                    }
                ];
                
                for(var i = 0, l = self.selectorList.length; i < l; ++ i)
                {
                    var selector = self.selectorList[i];
                    var selectorDOM = selector.selector.getDOM();
                    selectorDOM.addClass("datepicker-selector-" + selector.name);
                    this.dom.append(selectorDOM);
                }
                
                this.selector("year, month, date, hour, minute");
                
                this.runner = new Runner(function () {
                    for(var i = 0, l = self.selectorList.length; i < l; ++ i)
                    {
                        var selector = self.selectorList[i].selector;
                        selector.render();
                    }
                }, 60);
                
                var title = this.dom.find("div.title");
                
                title.append("<div class='panel left'><button class='op now'>此刻</button></div><div class='week'></div><div class='panel right'><button class='op ok'>确定</button><button class='op clean'>清空</button></div>");
                
                $(window).bind("resize", function () {
                    self.resize();
                });
                
                var panelRight = this.dom.find("div.title div.panel.right");
                
                panelRight.find("button.op.ok").bind(Config.TAP_EVENTNAME, function () {
                    self.onOk(self.getDateString(), self.getValue());
                    self.hide();
                });
                
                panelRight.find("button.op.clean").bind(Config.TAP_EVENTNAME, function () {
                    self.onClean(self.getDateString(), self.getValue());
                    self.hide();
                });
                
                var panelLeft = this.dom.find("div.title div.panel.left");
                
                panelLeft.find("button.op.now").bind(Config.TAP_EVENTNAME, function () {
                    self.setValue((new Date()).getTime());
                });
                
                $(document.body).append(this.dom);
                
                var week = title.find("div.week");
                
                var lastTimeStamp = null;
                self.listen("change", function (data) {
                    var date = new Date(data.timestamp);
                    week.html(DatePicker.DAY_NAME[date.getDay()]);
                });
                
                this.CLOSE_ON_TAPBODY_HANDLE = function () {
                    if(self.shown)
                    {
                        self.hide();
                    }
                };
                
                this.dom.bind(Config.TAP_EVENTNAME, function (e) {
                    e.stopPropagation();
                    return false;
                });
                
                this.valueDate = new Date();
                this.valueDate.setSeconds(0);
                this.setValue(this.value);
            },
            {
                getSelector: function (name) {
                    if(this.selectorCache)
                    {
                        var selector = this.selectorCache[name];
                        if(selector)
                        {
                            return selector;
                        }
                    }
                    else
                    {
                        this.selectorCache = {};
                    }
                    
                    for(var i = 0, l = this.selectorList.length; i < l; ++ i)
                    {
                        var selector = this.selectorList[i];
                        if(selector.name == name)
                        {
                            this.selectorCache[name] = selector.selector;
                            return this.selectorCache[name];
                        }
                    }
                },
                resize: function () {
                    var enabledSelector = [];
                    for(var i = 0, l = this.selectorList.length; i < l; ++ i)
                    {
                        var selector = this.selectorList[i];
                        if(selector.enabled)
                        {
                            enabledSelector.push(selector.selector);
                        }
                    }
                    
                    var selectorNum = enabledSelector.length;
                    var datePickerHeight = this.dom.height();
                    var selectorWidth = this.dom.width() / selectorNum;
                    var startX = 0;
                    for(var i = 0; i < selectorNum; ++ i)
                    {
                        var selector = enabledSelector[i];
                        selector.setWidth(selectorWidth);
                        selector.setHeight(datePickerHeight);
                        selector.setX(startX);
                        startX += selectorWidth;
                    }
                },
                selector: function (names) {
                    var names = names.split(",");
                    for(var i = 0, l = names.length; i < l; ++ i)
                    {
                        names[i] = $.trim(names[i]);
                    }
                    
                    for(var i = 0, l = this.selectorList.length; i < l; ++ i)
                    {
                        var selector = this.selectorList[i];
                        if($.inArray(selector.name, names) != -1)
                        {
                            selector.enabled = true;
                            this.dom.find(".datepicker-selector-" + selector.name).removeClass("nodis");
                        }
                        else
                        {
                            selector.enabled = false;
                            this.dom.find(".datepicker-selector-" + selector.name).addClass("nodis");
                        }
                    }
                    
                    this.resize();
                },
                getDateString: function (format) {
                    return DateUtil.format(format ? format : "Y-M-d h:m:00", this.valueDate);
                },
                getValue: function () {
                    return this.valueDate.getTime();
                },
                setValue: function (value) {
                    this.valueDate.setTime(value);
                    var valueDate = this.valueDate;
                    
                    for(var i = 0, l = this.selectorList.length; i < l; ++ i)
                    {
                        var selector = this.selectorList[i];
                        var selectorEntity = selector.selector;
                        switch(selector.name)
                        {
                            case "year":
                                selectorEntity.setValue(valueDate.getFullYear());
                            break;
                            case "month":
                                selectorEntity.setValue(valueDate.getMonth() + 1);
                            break;
                            case "date":
                                selectorEntity.setValue(valueDate.getDate());
                            break;
                            case "hour":
                                selectorEntity.setValue(valueDate.getHours());
                            break;
                            case "minute":
                                selectorEntity.setValue(valueDate.getMinutes());
                            break;
                        }
                    }
                    
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.title
                    * @param options.onChange
                    * @param options.onOk
                    * @param options.onClean
                    * @param options.value
                 */
                show: function (options) {
                    var self = this;
                    options = options || {};
                    options = $.extend({
                        title: "",
                        value: new Date().getTime(),
                        onChange: function () {},
                        onOk: function () {},
                        onClean: function () {}
                    }, options);
                    
                    if(this.shown == false)
                    {
                        $(document.body).bind("touchstart", DatePicker.DISABLE_BODY_SCROLL);
                        Overlay.show();
                        this.setValue(options.value);
                        this.dom.css({
                            opacity: 0,
                            bottom: "-50%",
                            visibility: "hidden"
                        });
                        this.dom.css({
                            display: "block"
                        });
                        this.resize();
                        this.dom.css({
                            visibility: "visible"
                        });
                        this.dom.animate({
                            opacity: 1,
                            bottom: "0%"
                        }, Config.ANIMATE.DURATION.IN, Config.ANIMATE.FUNCTION.IN, function () {
                            self.runner.start();
                            $(document.body).bind(Config.TAP_EVENTNAME, self.CLOSE_ON_TAPBODY_HANDLE);
                        });
                        this.shown = true;
                        this.onChange = options.onChange;
                        this.onOk = options.onOk;
                        this.onClean = options.onClean;
                    }
                },
                hide: function () {
                    var self = this;
                    $(document.body).unbind(Config.TAP_EVENTNAME, self.CLOSE_ON_TAPBODY_HANDLE);
                    self.runner.pause();
                    self.onChange = function () {};
                    self.onOk = function () {};
                    self.onClean = function () {};
                    self.dom.animate({
                        opacity: 0,
                        bottom: "-50%"
                    }, Config.ANIMATE.DURATION.OUT, Config.ANIMATE.FUNCTION.OUT, function () {
                        Overlay.hide();
                        self.dom.css("display", "none");
                        self.shown = false;
                        $(document.body).unbind("touchstart", DatePicker.DISABLE_BODY_SCROLL);
                    });
                }
            }
        );
        
        DatePicker.DISABLE_BODY_SCROLL = function (e) {
            e.preventDefault();
        };
        
        DatePicker.DAY_NAME = {
            0: "周日",
            1: "周一",
            2: "周二",
            3: "周三",
            4: "周四",
            5: "周五",
            6: "周六"
        };
        
        return new DatePicker();
    }
);
