define(
    [
        "lib/jQueryMobile",
        "util/Touch",
        "Runner",
        "base/Class",
        "Config"
    ],
    function ($, Touch, Runner, Class, Config) {
        
        var selectorList = [];
        
        var runDelay = 60;
        
        var runner = new Runner(function () {
            for(var i = 0, l = selectorList.length; i < l; ++ i)
            {
                selectorList[i].draw();
            }
        }, runDelay);
        
        runner.start();
        
        /**
         * 基础组件
         */
        var Component = Class.define(
            /**
             * options.x
             * options.y
             * options.height
             * options.width
             * options.onDraw
             * @param options.target
             */
            function (options) {
                options = options || {};
                options = $.extend({
                    x: 0,
                    y: 0,
                    height: 0,
                    width: 0,
                    onDraw: function () {}
                }, options);
                
                this.dom = $("<div style='overflow: hidden; position: absolute; top: 0px; left: 0px;'></div>");
                
                this.setX(options.x);
                this.setY(options.y);
                this.setWidth(options.width);
                this.setHeight(options.height);
                
                this.onDraw = options.onDraw;
                
                options.target.append(this.getDOM());
                
                this._redraw = false;
                
                this.addClass("component");
                
                this.redraw();
            },
            {
                getDOM: function () {
                    return this.dom;
                },
                addClass: function (className) {
                    this.dom.addClass(className);
                },
                removeClass: function (className) {
                    this.dom.removeClass(className);
                },
                setHeight: function (height) {
                    this.height = height;
                    this.redraw();
                },
                setWidth: function (width) {
                    this.width = width;
                    this.redraw();
                },
                setX: function (x) {
                    this.x = x;
                    this.redraw();
                },
                resize: function () {
                    
                },
                setY: function (y) {
                    this.y = y;
                    this.redraw();
                },
                destroy: function () {
                    this.dom.remove();
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
                redraw: function () {
                    this._redraw = true;
                },
                draw: function () {
                    if(this._redraw)
                    {
                        var self = this;
                        
                        var width = self.getWidth();
                        var height = self.getHeight();
                        self.dom.css({
                            width: width ? width + "px" : "auto",
                            height: height ? height + "px" : "auto"
                        });
                        
                        self.dom.css({
                            "transform": "translate3d(" + self.getX() + "px, " + self.getY() + "px, 0px)"
                        });
                        
                        self.onDraw(self);
                        
                        this._redraw = false;
                    }
                }
            }
        );
        
        /**
         * 刻度组件
         */
        var Calibration = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.value
                * @param options.data
                * @param options.x
                * @param options.y
                * @param options.width
                * @praam options.height
                * @param options.target
             */
            function (options) {
                this._super({
                    x: options.x,
                    y: options.y,
                    width: options.width,
                    height: options.height,
                    target: options.target,
                    onDraw: function (calibration) {
                        calibration.getDOM().css({
                            lineHeight: calibration.getHeight() + "px"
                        });
                    }
                });
                
                this.value = options.value;
                
                this.data = options.data;
                
                this._enabled = true;
                
                this.getDOM().html(this.value);
                
                this.addClass("calibration");
            },
            {
                getValue: function () {
                    return this.value;
                },
                enable: function () {
                    this._enabled = true;
                    this.removeClass("disabled");
                },
                getData: function () {
                    return this.data;
                },
                disable: function () {
                    this._enabled = false;
                    this.addClass("disabled");
                },
                disabled: function () {
                    return this._enabled ? false : true;
                }
            },
            Component
        );
        
        /**
         * 选择框组件
         */
        var Select = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.selector
             */
            function (options) {
                
                var selector = options.selector;
                
                var x = 0;
                var width = selector.getWidth();
                
                var selectorHeight = selector.getHeight();
                var height = selectorHeight / selector.getViewportWheelNum();
                
                var y = selectorHeight / 2 - height / 2;
                
                this._super({
                    target: selector.getDOM(),
                    x: x,
                    y: y,
                    width: width,
                    height: height
                });
                
                this.addClass("select");
            },
            {
                getViewPortX: function () {
                    return this.getX();
                },
                getViewPortY: function () {
                    return this.getY();
                },
                getViewPortWidth: function () {
                    return this.getWidth();
                },
                getViewPortHeight: function () {
                    return this.getHeight();
                }
            },
            Component
        );
        
        /**
         * 选择框组件
         */
        var Mask = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.selector
             */
            function (options) {
                
                var selector = options.selector;
                
                var width = selector.getWidth();
                
                this._super({
                    target: selector.getDOM(),
                    x: 0,
                    y: 0,
                    width: width,
                    height: 0
                });
                
                this.addClass("mask");
            },
            {
            },
            Component
        );
        
        /**
         * 选择框组件
         */
        var TopMask = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.selector
             */
            function (options) {
                var self = this;
                
                this._super({
                    selector: options.selector
                });
                
                var selector = options.selector;
                
                var select = selector.getSelect();
                
                this.setX(0);
                this.setY(0);
                this.setHeight(select.getY());
            },
            {
                
            },
            Mask
        );
        
        /**
         * 选择框组件
         */
        var BottomMask = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.selector
             */
            function (options) {
                var self = this;
                
                this._super({
                    selector: options.selector
                });
                
                var selector = options.selector;
                
                var select = selector.getSelect();
                
                this.setX(0);
                this.setY(select.getY() + select.getHeight());
                this.setHeight(selector.getHeight() - ( select.getY() + select.getHeight() ));
            },
            {
                
            },
            Mask
        );
        
        var CalibrationGroup = Class.define(
            function () {
                this.map = {};
                this.list = [];
            },
            {
                addCalibration: function (calibration) {
                    var self = this;
                    this.map[calibration.getValue()] = {
                        calibration: calibration,
                        index: self.list.push(calibration) - 1
                    };
                },
                each: function (iter) {
                    var list = this.list;
                    for(var i = 0, l = list.length; i < l; ++ i)
                    {
                        if(iter(list[i], i) == false)
                        {
                            break;
                        }
                    }
                },
                removeAll: function () {
                    for(var i = 0, l = this.list.length; i < l; ++ i)
                    {
                        this.list[i].destroy();
                    }
                    this.list = [];
                    this.map = {};
                },
                getCalibration: function (value) {
                    return this.map[value].calibration;
                },
                getCalibrationByPosition: function (x, y) {
                    var targetCalibration = null;
                    var minDistance = null;
                    this.each(function (calibration) {
                        var distance = Math.abs(y - ( calibration.getY() + (calibration.getHeight() / 2)));
                        if(minDistance == null || distance < minDistance)
                        {
                            minDistance =  distance;
                            targetCalibration = calibration;
                        }
                    });
                    
                    return targetCalibration;
                },
                enableCalibration: function (value) {
                    this.getCalibration(value).enable();
                },
                disableCalibration: function (value) {
                    this.getCalibration(value).disable();
                },
                getCloseTo: function (value) {
                    var closeCalibration = null;
                    var targetFound = false;
                    this.each(function (calibration) {
                        if(calibration.getValue() != value && calibration.disabled() == false)
                        {
                            closeCalibration = calibration;
                        }
                        if(calibration.getValue() == value)
                        {
                            targetFound = true;
                        }
                        if(targetFound && closeCalibration != null)
                        {
                            return false;
                        }
                    });
                    return closeCalibration;
                }
            }
        );
        
        
        /**
         * 滚轮组件
         */
        var Wheel = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.valueList
                * @param options.viewportWheelNum
                * @param options.onMovingStop
                * 
                * @param options.x
                * @param options.y
                * @param options.width
                * @param options.target
             */
            function (options) {
                
                var self = this;
                
                options = $.extend({
                    valueList: [],
                    viewportWheelNum: 5,
                    onMovingStop: function () {
                        
                    }
                }, options);
                
                this._super({
                    x: options.x,
                    y: options.y,
                    width: options.width,
                    target: options.target
                });
                
                var valueList = options.valueList;
                
                this.calibrationGroup = new CalibrationGroup();
                
                this.onMovingStop = options.onMovingStop;
                    
                this.viewportWheelNum = options.viewportWheelNum;
                
                this.viewPortHeight = options.height;
                    
                this.calibrationHeight = this.getViewPortHeight() / this.getViewportWheelNum();
                
                this.setValueList(options.valueList);
                
                //速度衰减值
                this.defaultFriction = 100 / runDelay;
                this.friction = this.defaultFriction;
                
                this.moveDY = null;
                this.moveDX = null;
                this.moveStartTime = null;
                this.moveSpeedY = null;
                this.moveForward = true;
                
                this.beforeMoving = function () {};
                
                this.movePX = 1;
                
                this.moving = false;
                
                this.addClass("wheel");
                
            },
            {
                getViewPortHeight: function () {
                    return this.viewPortHeight;
                },
                setValueList: function (valueList) {
                    
                    var self = this;
                    
                    var initCW = this.getWidth();
                    var initCH = this.getCalibrationHeight();
                    var initX = 0;
                    var initY = 0;
                    
                    this.calibrationGroup.removeAll();
                    
                    for(var i = 0, l = valueList.length; i < l; ++ i)
                    {
                        var value = valueList[i];
                        this.calibrationGroup.addCalibration(new Calibration({
                            x: initX,
                            y: initY,
                            width: initCW,
                            height: initCH,
                            data: value.data,
                            target: self.getDOM(),
                            value: value.value
                        }));
                        
                        initY += initCH;
                    }
                },
                getViewportWheelNum: function () {
                    return this.viewportWheelNum;
                },
                getCalibrationHeight: function () {
                    return this.calibrationHeight;
                },
                moveYTo: function (dy, animate) {
                    var distanceY = dy - this.getY();
                    this.moveDY = dy;
                    var speedY = Math.sqrt(2 * this.friction * Math.abs(distanceY));
                    this.move(speedY, distanceY > 0, animate == false ? speedY : this.friction);
                },
                getHeight: function () {
                    var height = 0;
                    
                    this.calibrationGroup.each(function (calibration) {
                        height += calibration.getHeight();
                    });
                    
                    return height;
                },
                getCalibrationByPosition: function (x, y) {
                    return this.calibrationGroup.getCalibrationByPosition(x, y);
                },
                getCalibration: function (value) {
                    return this.calibrationGroup.getCalibration(value);
                },
                getCalibrationGroup: function () {
                    return this.calibrationGroup;
                },
                /**
                 * speedY 每1/60秒移动距离
                 * fiction 每1/60秒衰减速度
                 */
                move: function (speedY, forward, friction, beforeMoving) {
                    this.moving = true;
                    this.moveSpeedY = speedY;
                    this.moveForward = forward ? true : false;
                    this.movePX = 1;
                    if(friction == 0 || friction)
                    {
                        this.friction = friction;
                    }
                    else
                    {
                        this.friction = this.defaultFriction;
                    }
                    this.beforeMoving = beforeMoving || function () {};
                },
                stopMoving: function (noCallback) {
                    this.moving = false;
                    this.friction = this.defaultFriction;
                    this.movePX = 1;
                    this.moveDY = null;
                    this.beforeMoving = function () {};
                    if(noCallback != true)
                    {
                        this.onMovingStop(this);
                    }
                },
                draw: function () {
                    var self = this;
                    if(self.moving)
                    {
                        var dy = this.moveSpeedY - ( this.movePX * 0.5 * this.friction);
                        this.movePX += 2;
                        if(dy <= 0)
                        {
                            if(this.moveDY != null)
                            {
                                this.setY(this.moveDY);
                            }
                            self.stopMoving();
                        }
                        else
                        {
                            if(self.beforeMoving({
                                wheel: self,
                                dy: dy,
                                forward: this.moveForward
                            }) != false)
                            {
                                if(this.moveForward)
                                {
                                    self.setY(self.getY() + dy);
                                }
                                else
                                {
                                    self.setY(self.getY() - dy);
                                }
                            }
                        }
                    }
                    
                    self.calibrationGroup.each(function (calibration) {
                        calibration.draw();
                    });
                    
                    self._super.draw();
                }
            },
            Component
        );
        
        var Selector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.onChange
                * @param options.valueList
                * @param options.defaultValue
                * 
                * @param options.x
                * @param options.y
                * @param options.height
                * @param options.width
                * @param options.target
             */
            function (options) {
                
                var self = this;
                
                options = $.extend({
                    onChange: function () {},
                    valueList: []
                }, options);
                
                this._super({
                    x: options.x,
                    y: options.y,
                    width: options.width,
                    height: options.height,
                    target: options.target
                });
                
                this.onChange = options.onChange;
                
                this.addClass("selector");
                
                this.wheel = new Wheel({
                    valueList: options.valueList,
                    x: 0,
                    y: 0,
                    defaultValue: options.defaultValue,
                    target: self.getDOM(),
                    width: options.width,
                    height: options.height,
                    onMovingStop: function (wheel) {
                        var wheelY = wheel.getY();
                        var select = self.select;
                        
                        var selectViewPortX= select.getViewPortX();
                        var selectViewPortY= select.getViewPortY();
                        var selectViewPortWidth= select.getViewPortWidth();
                        var selectViewPortHeight= select.getViewPortHeight();
                        
                        var calibrationSearchY = selectViewPortY + selectViewPortHeight / 2 + wheelY * -1;
                        
                        var calibration = wheel.getCalibrationByPosition(selectViewPortX, calibrationSearchY);
                        self.setValue(calibration.getValue());
                    }
                });
                
                this.select = new Select({
                    selector: self
                });
                
                this.topMask = new TopMask({
                    selector: self
                });
                
                this.bottomMask = new BottomMask({
                    selector: self
                });
                
                this.getDOM().bind("touchmove", function (e) {
                    e.preventDefault();
                });
                
                var swipeStartY = null;
                
                Touch.swipe({
                    target: self.getDOM(),
                    start: function (data) {
                        self.wheel.stopMoving(true);
                        swipeStartY = self.wheel.getY();
                    },
                    swipe: function (data) {
                        var nextY = swipeStartY + data.distanceY;
                        var select = self.select;
                        var selectY = select.getY();
                        if(nextY >= selectY)
                        {
                            nextY = selectY;
                        }
                        var height = self.getHeight();
                        var minY = height - self.wheel.getHeight() - ( height - selectY - select.getHeight() );
                        if(nextY <= minY)
                        {
                            nextY = minY;
                        }
                        self.wheel.setY(nextY);
                    },
                    end: function (data) {
                        self.wheel.move(this.speedY, data.distanceY > 0, null, function (movingData) {
                            var wheel = movingData.wheel;
                            var wheelY = wheel.getY();
                            var dy = movingData.dy;
                            var forward = movingData.forward;
                            var nextY = 0;
                            if(forward)
                            {
                                nextY = wheelY + dy;
                            }
                            else
                            {
                                nextY= wheelY - dy;
                            }
                            
                            var select = self.select;
                            var selectY = select.getY();
                            var height = self.getHeight();
                            
                            if(nextY >= selectY)
                            {
                                wheel.setY(selectY);
                                wheel.stopMoving();
                                return false;
                            }
                            
                            var minY = height - wheel.getHeight() - ( height - selectY - select.getHeight() );
                            if(wheelY <= minY)
                            {
                                wheel.setY(minY);
                                wheel.stopMoving();
                                return false;
                            }
                        });
                    }
                });
                
                selectorList.push(this);
                
                if(options.defaultValue == null || options.defaultValue == undefined)
                {
                    var calibration = this.wheel.getCalibrationByPosition(0, 0);
                    options.defaultValue = calibration.getValue();
                }
                
                this.setValue(options.defaultValue, false);
                
            },
            {
                destroy: function () {
                    this.wheel.destroy();
                    this.select.destroy();
                    this._super.destroy();
                    for(var i = 0, l = selectorList.length; i < l; ++ i)
                    {
                        selectorList.splice(i, 1);
                        continue;
                    }
                },
                draw: function () {
                    this.wheel.draw();
                    this.select.draw();
                    this.topMask.draw();
                    this.bottomMask.draw();
                    this._super.draw();
                },
                setValueList: function (valueList, defaultValue) {
                    this.wheel.setValueList(valueList);
                    var calibration = null;
                    if(defaultValue != undefined && defaultValue != null)
                    {
                        var calibration = this.wheel.getCalibration(defaultValue);
                    }
                    else
                    {
                        var calibration = this.wheel.getCalibrationByPosition(0, 0);
                    }
                    this.setValue(calibration.getValue());
                },
                disableValue: function (value) {
                    this.wheel.getCalibrationGroup().disableCalibration(value);
                    if(value == this.getValue())
                    {
                        var calibration = this.wheel.getCalibrationGroup().getCloseTo(value);
                        if(calibration != null)
                        {
                            this.setValue(calibration.getValue());
                        }
                    }
                },
                enableValue: function (value) {
                    this.wheel.getCalibrationGroup().enableCalibration(value);
                },
                getViewportWheelNum: function () {
                    return this.wheel.getViewportWheelNum();
                },
                getValue: function () {
                    return this.value;
                },
                getData: function () {
                    return this.data;
                },
                setValue: function (value, animate) {
                    var calibration = this.wheel.getCalibration(value);
                    if(calibration.disabled())
                    {
                        var closeCalibration = this.wheel.getCalibrationGroup().getCloseTo(value);
                        if(closeCalibration)
                        {
                            this.setValue(closeCalibration.getValue());
                            return;
                        }
                    }
                    if(value != this.value)
                    {
                        this.onChange(value, calibration.getData());
                    }
                    var moveY = (this.select.getViewPortY() - calibration.getY());
                    if((value != this.value) || (moveY != this.wheel.getY()))
                    {
                        this.wheel.moveYTo(moveY, animate);
                        this.value = value;
                        this.data = calibration.getData();
                    }
                },
                getSelect: function () {
                    return this.select;
                }
            },
            Component
        );
        
        var WheelSelector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.onChange
                * @param options.valueList [{value: 1, data: {}}]
                * @param options.defaultValue
                * 
                * @param options.x
                * @param options.y
                * @param options.height
                * @param options.width
                * @param options.target
             */
            function (options) {
                
                var self = this;
                
                this.dom = $("<div class='wheel-selector'></div>");
                
                this.selector = new Selector({
                    onChange: options.onChange,
                    valueList: options.valueList,
                    defaultValue: options.defaultValue,
                    x: options.x,
                    y: options.y,
                    height: options.height,
                    width: options.width,
                    target: self.dom
                });
                
                this.dom.css({
                    width: options.width,
                    height: options.height,
                    position: "relative"
                });
                
                options.target.append(self.dom);
            },
            {
                setValue: function (value) {
                    this.selector.setValue(value);
                },
                disableValue: function (value) {
                    this.selector.disableValue(value);
                },
                enableValue: function (value) {
                    this.selector.enableValue(value);
                },
                getValue: function () {
                    return this.selector.getValue();
                },
                getData: function () {
                    return this.selector.getData();
                },
                setValueList: function (valueList, defaultValue) {
                    this.selector.setValueList(valueList, defaultValue);
                },
                getSelectViewPortDOM: function () {
                    return this.selector.getSelect().getDOM();
                },
                destroy: function () {
                    this.selector.destroy();
                    this.dom.remove();
                }
            }
        );
        
        return WheelSelector;
    }
);
