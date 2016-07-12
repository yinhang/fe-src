define(
    [
        "util/Number"
    ],
    function (NumberUtil) {
        var UDate = {
            SECOND_MS: 1000,
            reminder: function (time, length) {
                length = length || 3;
                var diffTime = time - ( new Date() ).getTime();
                
                diffTime -= UDate.HOUR_MS * 8;
                
                var diff = new Date(diffTime);
                
                var temporalScale = [
                    {
                        unit: "年",
                        value: diff.getFullYear() - 1970
                    },
                    {
                        unit: "个月",
                        value: diff.getMonth()
                    },
                    {
                        unit: "天",
                        value: diff.getDate() - 1
                    },
                    {
                        unit: "小时",
                        value: diff.getHours()
                    },
                    {
                        unit: "分",
                        value: diff.getMinutes()
                    },
                    {
                        unit: "秒",
                        value: diff.getSeconds()
                    }
                ];
                
                var text = [];
                
                var result =  [];
                
                for(var i = 0, l = temporalScale.length, add = false, count = 0; i < l; ++ i)
                {
                    var scale = temporalScale[i];
                    if(scale.value != 0)
                    {
                        add = true;
                    }
                    if(add)
                    {
                        result.push(scale);
                        if( ++ count >=  length)
                        {
                            break;
                        }
                    }
                }
                
                for(var i = result.length - 1, add = false, count = 0; i >= 0; -- i)
                {
                    var scale = result[i];
                    if(scale.value != 0)
                    {
                        add = true;
                    }
                    if(add)
                    {
                        text.push("<span class='value'>" + scale.value + "</span>" + scale.unit);
                        if( ++ count >=  length)
                        {
                            break;
                        }
                    }
                }
                
                text.reverse();
                
                return text.join("");
            },
            durationText: function (startTime) {
                var now = (new Date()).getTime();
                var timeDiff = now - startTime;
                var createOn = timeDiff / ( UDate.DAY_MS * 365 );
                
                if(createOn < 1)
                {
                    createOn = timeDiff / ( UDate.DAY_MS );
                    if(createOn < 1)
                    {
                        createOn = timeDiff / ( UDate.HOUR_MS );
                        if(createOn < 1)
                        {
                            createOn = timeDiff / ( UDate.MINUTE_MS );
                            if(createOn < 1)
                            {
                                createOn = timeDiff / ( UDate.SECOND_MS );
                                if(createOn < 1)
                                {
                                    createOn = 1;
                                }
                                return parseInt(createOn) + "秒";
                            }
                            else
                            {
                                return parseInt(createOn) + "分钟";
                            }
                        }
                        else
                        {
                            return parseInt(createOn) + "小时";
                        }
                    }
                    else
                    {
                        return parseInt(createOn) + "天";
                    }
                }
                else
                {
                    return parseInt(createOn) + "年";
                }
            },
            format: function (format, date) {
                date = date || new Date();
                var dateTimeMarker = {
                    "M": date.getMonth() + 1, // month  
                    "d": date.getDate(), // day  
                    "h": NumberUtil.makeUpZero(date.getHours(), 2), // hour  
                    "m": NumberUtil.makeUpZero(date.getMinutes(), 2), // minute  
                    "s": NumberUtil.makeUpZero(date.getSeconds(), 2), // second
                    "Y": date.getFullYear(),
                    "y": date.getYear(),
                    "t": date.getTime()
                };
                
                var str = "";
                var escape = false;
                
                for(var i = 0, l = format.length; i < l; ++ i)
                {
                    var ch = format.charAt(i);
                    if(escape)
                    {
                        str += ch;
                        escape = false;
                        continue;
                    }
                    if(ch == "\\")
                    {
                        escape = true;
                        continue;
                    }
                    var time = dateTimeMarker[ch];
                    if(isNaN(time) == false)
                    {
                        str += time;
                        continue;
                    }
                    str += ch;
                }
                return str;
            }  
        };
        
        UDate.MINUTE_MS = UDate.SECOND_MS * 60;
        UDate.HOUR_MS = UDate.MINUTE_MS * 60;
        UDate.DAY_MS = UDate.HOUR_MS * 24;
        
        return UDate;
    }
);
