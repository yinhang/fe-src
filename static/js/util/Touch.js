define(
    [
        "lib/jQuery"
    ],
    function ($) {
        
        var $body = $(document.body);
        
        var SWIPE_TOUCHES = {};
        
        var SCALE_INFO = [];
        
        function getScaleDistance(touches) {
            var a = null, b = null;
            for(var id in touches)
            {
                if(a == null)
                {
                    a = touches[id].x;
                }
                else
                {
                    a = Math.abs(a - touches[id].x);
                }
                if(b == null)
                {
                    b = Math.abs(touches[id].y);
                }
                else
                {
                    b = Math.abs(b - touches[id].y);
                }
            }
            return Math.sqrt(a * a + b * b);
        };
        
        $body.bind("touchmove", function (e) {
            e = e.originalEvent;
            var touches = e.touches;
            for(var i = 0, l = touches.length; i < l; ++ i)
            {
                var touch = touches[i];
                var dataList = SWIPE_TOUCHES[touch.identifier];
                if(dataList)
                {
                    for(var ii = 0, ll = dataList.length; ii < ll; ++ ii)
                    {
                        var data = dataList[ii];
                        if(data)
                        {
                            var x = touch.clientX;
                            var y = touch.clientY;
                            calSwipePosition(x, y, data);
                            calSwipeSpeed(x, y, data);
                            data.onSwipe(data);
                        }
                    }
                }
            }
        });
        
        $body.bind("touchend", function (e) {
            e = e.originalEvent;
            var touches = e.changedTouches;
            for(var i = 0, l = touches.length; i < l; ++ i)
            {
                var touch = touches[i];
                var dataList = SWIPE_TOUCHES[touch.identifier];
                if(dataList)
                {
                    for(var ii = dataList.length - 1; ii >= 0; -- ii)
                    {
                        var data = dataList[ii];
                        if(data)
                        {
                            var x = touch.clientX;
                            var y = touch.clientY;
                            calSwipePosition(x, y, data);
                            calSwipeSpeed(x, y, data);
                            data.onEnd(data);
                            dataList.splice(ii, 1);
                        }
                    }
                    delete SWIPE_TOUCHES[touch.identifier];
                }
            }
        });
        
        //scale
        $body.bind("touchmove", function (e) {
            e = e.originalEvent;
            var touches = e.touches;
            var actTouches = {};
            for(var i = 0, l = touches.length; i < l; ++ i)
            {
                var touch = touches[i];
                for(var scaleInfoI = 0, scaleInfoL = SCALE_INFO.length; scaleInfoI < scaleInfoL; ++ scaleInfoI)
                {
                    var touchInfo = SCALE_INFO[scaleInfoI];
                    if(touchInfo.touchNum >= 2)
                    {
                        var scaleTouches = touchInfo.touches;
                        if(scaleTouches.hasOwnProperty(touch.identifier))
                        {
                            var scaleTouch = scaleTouches[touch.identifier];
                            scaleTouch.x = touch.clientX;
                            scaleTouch.y = touch.clientY;
                            actTouches[touchInfo.id] = actTouches[touchInfo.id] || {
                                touches: {},
                                scaleInfo: touchInfo
                            };
                            actTouches[touchInfo.id].touches[touch.identifier] = {
                                x: touch.clientX,
                                y: touch.clientY
                            };
                        }
                    }
                }
            }
            for(var id in actTouches)
            {
                var actTouch = actTouches[id];
                var info = actTouch.scaleInfo;
                info.ratio = getScaleDistance(actTouch.touches) / actTouch.scaleInfo.distance;
                info.onScale(info);
            }
        });
        
        $body.bind("touchend", function (e) {
            e = e.originalEvent;
            var touches = e.changedTouches;
            for(var i = 0, l = touches.length; i < l; ++ i)
            {
                var touch = touches[i];
                for(var scaleInfoI = SCALE_INFO.length - 1; scaleInfoI >= 0; -- scaleInfoI)
                {
                    var scaleInfo = SCALE_INFO[scaleInfoI];
                    var scaleTouches = scaleInfo.touches;
                    if(scaleTouches.hasOwnProperty(touch.identifier))
                    {
                        delete scaleTouches[touch.identifier];
                        if(scaleInfo.touchNum == 2)
                        {
                            scaleInfo.onEnd(scaleInfo);
                        }
                        -- scaleInfo.touchNum;
                    }
                    if(scaleInfo.touchNum <= 0)
                    {
                        $(scaleInfo.target).removeData("touch_scale_data");
                        SCALE_INFO.splice(scaleInfoI, 1);
                    }
                }
            }
        });
        
        function calSwipePosition(x, y, data) {
            if(data.x != x)
            {
                data.lastX = data.x;
                data.x = x;
                data.distanceX = x - data.startX;
            }
            if(data.y != y)
            {
                data.lastY = data.y;
                data.y = y;
                data.distanceY = y - data.startY;
            }
        };
        
        function calSwipeSpeed(x, y, data) {
            var now = new Date().getTime();
            if(now - data.timeStepStartTime >= data.timeStep)
            {
                data.speedX = Math.abs(x - data.timeStepStartX);
                data.speedY = Math.abs(y - data.timeStepStartY);
                data.timeStepStartX = x;
                data.timeStepStartY = y;
                data.timeStepStartTime = now;
            }
        };
        
        var Touch = {
            SWIPE_DIRECTION: {
                TOP: 0,
                RIGHT: 1,
                BOTTOM: 2, 
                LEFT: 3
            },
            counter: 0,
            /**
             * @param options.target
             * @param options.start
             * @param options.scale
             * @param options.end
             */
            scale: function (options) {
                options.target.bind("touchstart", function (e) {
                    e = e.originalEvent;
                    var touches = e.targetTouches;
                    var self = this;
                    var $this = $(self);
                    var data = $this.data("touch_scale_data");
                    if(!data)
                    {
                        data = {
                            id: "touch_scale_" + ( ++ Touch.counter ) + "_" + ( new Date().getTime() ),
                            touches: {},
                            touchNum: 0,
                            target: self,
                            onStart: options.start,
                            onScale: options.scale,
                            onEnd: options.end,
                            distance: 0,
                            ratio: 1
                        };
                        $this.data("touch_scale_data", data);
                        SCALE_INFO.push(data);
                    }
                    
                    for(var i = 0, l = touches.length; i < l; ++ i)
                    {
                        var touch = touches[i];
                        
                        var scaleTouches = data.touches;
                        if(data.touchNum < 2 && scaleTouches.hasOwnProperty(touch.identifier) == false)
                        {
                            scaleTouches[touch.identifier] = {
                                startX: touch.clientX,
                                startY: touch.clientY,
                                x: touch.clientX,
                                y: touch.clientY
                            };
                            
                            ++ data.touchNum;
                        }
                    }
                    
                    if(data.touchNum == 2)
                    {
                        data.distance = getScaleDistance(data.touches);
                        data.onStart(data);
                    }
                    
                });
            },
            /**
             * 
             * options.target
             * options.start
             * options.swipe
             * options.end
             */
            swipe: function (options) {
                function touchStart(e) {
                    e = e.originalEvent;
                    var touches = e.targetTouches;
                    for(var i = 0, l = touches.length; i < l; ++ i)
                    {
                        var touch = touches[i];
                        var startTime = new Date().getTime();
                        var x = touch.clientX;
                        var y = touch.clientY;
                        var data = {
                            target: e.currentTarget,
                            onStart: options.start,
                            onSwipe: options.swipe,
                            startTime: startTime,
                            startX: x,
                            startY: y,
                            timeStepStartX: x,
                            timeStepStartY: y,
                            timeStepStartTime: startTime,
                            onEnd: options.end,
                            distanceX: 0,
                            distanceY: 0,
                            speedX: 0,
                            speedY: 0,
                            lastX: null,
                            lastY: null,
                            x: x,
                            y: y,
                            timeStep: 1000 / 60
                        };
                    
                        SWIPE_TOUCHES[touch.identifier] = SWIPE_TOUCHES[touch.identifier] || [];
                        
                        SWIPE_TOUCHES[touch.identifier].push(data);
                        
                        data.onStart(data);
                    }
                };
                
                $(options.target).bind("touchstart", touchStart);
            }
        };
        
        return Touch;
    }
);
