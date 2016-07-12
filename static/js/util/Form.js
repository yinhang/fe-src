define(
    [
        "lib/jQuery",
        "base/Class",
        "util/FunctionalMarker",
        "app/XHR"
    ],
    function ($, Class, FunctionalMarker, XHR) {
        var Form = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.form
                * @param options.disableAutoAjaxSubmit
                * @param options.beforeSubmit
                * @param options.beforeSend
                * @param options.success
                * @param options.error
                * @param options.complete
                * @param options.disableArrayToString
                * @param options.arrayToStringSpliter
                * @param options.submitLocker
                * @param options.submitLockerUnlockOn
             */
            function (options) {
                var self = this;
                options = $.extend({
                    disableAutoAjaxSubmit: false,
                    disableArrayToString: false,
                    arrayToStringSpliter: ",",
                    submitLocker: false,
                    submitLockerUnlockOn: [
                        "error"
                    ]
                }, options);
                
                self = $.extend(self, options);
                
                $.extend(self, {
                    form: $(self.form),
                    submitLocked: false
                });
                
                if(self.disableAutoAjaxSubmit != true)
                {
                    $(options.form).bind("submit", function (e) {
                        self.ajaxSubmit();
                        e.preventDefault();
                        return false;
                    });
                }
                
                this.formDataSnapshot = {};
                
                this.submitDisabled = false;
            },
            {
                snapshotFormData: function () {
                    this.formDataSnapshot = this.getParams();
                },
                getChanges: function () {
                    var self = this;
                    var changes = [];
                    var formData = self.getParams();
                    
                    for(var name in self.formDataSnapshot)
                    {
                        if(self.formDataSnapshot[name] != formData[name])
                        {
                            changes.push({
                                name: name,
                                snapshotValue: self.formDataSnapshot[name]
                            });
                        }
                        delete formData[name];
                    }
                    
                    for(var name in formData)
                    {
                        if(formData[name] != self.formDataSnapshot[name])
                        {
                            changes.push({
                                name: name,
                                snapshotValue: self.formDataSnapshot[name]
                            });
                        }
                    }
                    
                    return changes;
                },
                disableSubmit: function () {
                    this.submitDisabled = true;
                },
                enableSubmit: function () {
                    this.submitDisabled = false;
                },
                serialize: function () {
                    var kvs = this.form.serialize().split("&");
                    var newKVS = [];
                    var obj = {};
                    
                    for(var i = 0,l = kvs.length; i < l; ++ i)
                    {
                        var kv = kvs[i].split("=");
                        kv[0] = decodeURIComponent(kv[0]);
                        kv[1] = decodeURIComponent(kv[1].replace(/\+/g, "%20"));
                        if(kv[0].substr(0, 6) == "#json:")
                        {
                            var jsonSymbol = $.trim(kv[0].substr(6));
                            var jsonVars = jsonSymbol.split(".");
                            //生成对象
                            //取得引用，向obj里边添加数据
                            var curObj = obj;
                            //开始
                            for(var ii = 0, ll = jsonVars.length; ii < ll; ++ ii)
                            { 
                                var jsonVar = jsonVars[ii];
                                var jsonVarType = jsonVar.substr(jsonVar.length - 2);
                                switch(jsonVarType)
                                {
                                    case "[]":
                                        //创建一个数组元素，类型为map。
                                        if(jsonVar.substr(0, 1) == "#")
                                        {
                                            var objName = jsonVar.substring(1, jsonVar.length - 2);
                                            var last = {};
                                            //如果是数组（不是第一次访问此对象），添加一个对象元素。
                                            if($.isArray(curObj[objName]))
                                            {
                                                curObj[objName].push(last);
                                            }
                                            else
                                            {
                                                //不是数组（第一次访问此对象），创建一个数组并且添加一个对象元素。
                                                curObj[objName] = [last];
                                            }
                                            //把让curObj持最后一个元素的引用
                                            curObj = last;
                                        }
                                        else
                                        {
                                            var objName = jsonVar.substr(0, jsonVar.length - 2);
                                            //如果数组标记为最后一位，直接插入value
                                            if(ii == ll - 1)
                                            {
                                                //如果是数组（不是第一次访问此对象），直接插入。
                                                if($.isArray(curObj[objName]))
                                                {
                                                    curObj[objName].push(kv[1]);
                                                }
                                                else
                                                {
                                                    //不是数组（第一次访问此对象），创建一个数组并且插入元素。
                                                    curObj[objName] = [last];
                                                }
                                            }
                                            else
                                            {
                                                //如果标记不是最后一位，并且不带#即不需要创建一个新的对象元素，说明后边的属性直接写入到数组最后一个元素中即可。
                                                curObj = curObj[objName][curObj[objName].length - 1];
                                            }
                                        }
                                        break;
                                    default:
                                        //对象的处理
                                        var objName = jsonVar;
                                        //如果是最后一位，直接把value写入到父对象中即可
                                        if(ii == ll - 1)
                                        {
                                            curObj[objName] = kv[1];
                                        }
                                        else
                                        {
                                            //不是最后一位，且不是对象，需要创建一个对象待子元素操作。
                                            if($.isPlainObject(curObj[objName]) == false)
                                            {
                                                //让curObj持新对象引用
                                                curObj[objName] = {};
                                            }
                                            curObj = curObj[objName];
                                        }
                                        break;
                                }
                            }
                        }
                        else
                        {
                            newKVS.push(encodeURIComponent(kv[0]) + "=" + encodeURIComponent(kv[1]));
                        }
                    }
                    
                    
                    for(var objName in obj)
                    {
                        newKVS.push(objName + "=" + encodeURIComponent(JSON.stringify(obj[objName])));
                    }
                    
                    var paramsStr = [];
                    if(this.disableArrayToString == false)
                    {
                        var params = {};
                        for(var i = 0, l = newKVS.length; i < l; ++ i)
                        {
                            var kv = newKVS[i].split("=");
                            if(params.hasOwnProperty(kv[0]))
                            {
                                if(kv[1].length > 0)
                                {
                                    params[kv[0]] += this.arrayToStringSpliter + kv[1];
                                }
                            }
                            else
                            {
                                params[kv[0]] = kv[1];
                            }
                        }
                        for(var name in params)
                        {
                            paramsStr.push(name + "=" + params[name]);
                        }
                    }
                    else
                    {
                        paramsStr = newKVS;
                    }
                    return (paramsStr.join("&"));
                },
                getParams: function () {
                    // 将querystr转换为obj
                    var query = this.serialize();
                    var kvs = query.split("&");
                    var obj = {};
                    for(var i = 0, l = kvs.length; i < l; ++ i)
                    {
                        var kv = kvs[i].split("=");
                        obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
                    }
                    return obj;
                },
                submitLock: function () {
                    this.form.addClass("utilform-submit-locked");
                    this.submitLocked = true;
                },
                submitUnlock: function () {
                    this.form.removeClass("utilform-submit-locked");
                    this.submitLocked = false;
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.beforeSend
                    * @param options.success
                    * @param options.error
                    * @param options.beforeSubmit
                    * @param options.complete
                 */
                ajaxSubmit: function(options) {
                    if(this.submitDisabled || ( this.submitLocker && this.submitLocked ))
                    {
                        return;
                    }
                    if(this.submitLocker)
                    {
                        this.submitLock();
                    }
                    var self = this;
                    var form = self.form;
                    options = options || {};
                    if(self.submitLocker && $.inArray("beforeSubmit", self.submitLockerUnlockOn) != -1)
                    {
                        self.submitUnlock();
                    }
                    if(self.beforeSubmit)
                    {
                        if(self.beforeSubmit() == false)
                            return;
                    }   
                    if(options.beforeSubmit)
                    {
                        if(options.beforeSubmit() == false)
                            return;
                    }     
                    // var data = {};
                    // var params = this.getParams();
                    // for(var name in params)
                    // {
                        // data[name] = decodeURIComponent(params[name]);
                    // }
                    XHR.request({
                        url: form.attr("action"),
                        type: form.attr("method"),
                        data: self.serialize(),
                        success: function () {
                            if(self.success)
                              self.success.apply(this, arguments);
                            if(options.success)
                              options.success.apply(this, arguments);
                            if(self.submitLocker && $.inArray("success", self.submitLockerUnlockOn) != -1)
                            {
                                self.submitUnlock();
                            }
                        },
                        error: function () {
                            if(self.error)
                              self.error.apply(this, arguments);
                            if(options.error)
                              options.error.apply(this, arguments);
                            if(self.submitLocker && $.inArray("error", self.submitLockerUnlockOn) != -1)
                            {
                                self.submitUnlock();
                            }
                        },
                        complete: function () {
                            if(self.complete)
                              self.complete.apply(this, arguments);
                            if(options.complete)
                              options.complete.apply(this, arguments);
                            if(self.submitLocker && $.inArray("complete", self.submitLockerUnlockOn) != -1)
                            {
                                self.submitUnlock();
                            }
                        },
                        beforeSend: function () {
                            if(self.beforeSend)
                              self.beforeSend.apply(this, arguments);
                            if(options.beforeSend)
                              options.beforeSend.apply(this, arguments);
                            if(self.submitLocker && $.inArray("beforeSend", self.submitLockerUnlockOn) != -1)
                            {
                                self.submitUnlock();
                            }
                        }
                    });
                }
            }
        );
        
        
        /**
         * 
            * @param {Object} options
            * @param options.form
         */
        Form.RESET_TO_CLEAN = function (options) {
            var form = $(options.form);
            $(form).find("input[type='reset']").bind("click", function (e) {
                form.find("input[type='text']").val("");
                form.find("select").each(function () {
                    this.selectedIndex = 0;
                }).trigger("change");
                form.find("textarea").html("");
                e.preventDefault();
                return false;
            });
        };
        
        FunctionalMarker.regist({
           packageName: "util/Form",
           init: function (element, params) {
               if(params.resetToClean == true)
                   Form.RESET_TO_CLEAN({
                       form: element
                   });
           } 
        });
        
        return Form;
    }
);
