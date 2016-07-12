define(
    [
        "lib/jQuery",
        "base/Cache"
    ],
    function ($, Cache) {
        var packageInfo = new Cache();
        
        var REG_EXP = {
            R_UPPERCASE: /(A-Z)/g,
            M_UN: /^fmuse[A-Z]+/,
            M_UNPERCASE_START: /^[A-Z]/
        };
        
        function getElementParams(element, name) {
            element = $(element);
            var data = element.data();
            var params = {};
            for(var key in data)
            {
                if(REG_EXP.M_UN.test(key))
                {
                    var unParams = key.substr(5).split("");
                    unParams[0] = unParams[0].toLowerCase();
                    unParams = unParams.join("");
                    if(unParams.indexOf(name) == 0)
                    {
                        unParams = unParams.substr(name.length);
                        if(unParams.length > 0 && REG_EXP.M_UNPERCASE_START.test(unParams))
                        {
                            unParams = unParams.split("");
                            unParams[0] = unParams[0].toLowerCase();
                            unParams = unParams.join("");
                            params[unParams] = data[key];
                        }
                    }
                }
            }
            return params;
        };
        
        var AccessRecord = {
            _extendParams: new Cache(),
            _initApply: new Cache(),
            saveExtendParams: function (element, objName, extendParams) {
                var list = AccessRecord._extendParams.fetch(objName) || [];
                
                list.push({
                    element: element,
                    extendParams: extendParams
                });
                
                AccessRecord._extendParams.save(objName, list);
            },
            saveInitApply: function (element, objName, initApply) {
                var list = AccessRecord._initApply.fetch(objName) || [];
                
                list.push({
                    element: element,
                    initApply: initApply ? true : false
                });
                
                AccessRecord._initApply.save(objName, list);
            },
            fetch: function (element, objName) {
                var extendParamsList = AccessRecord._extendParams.fetch(objName) || [];
                var initApplyList = AccessRecord._initApply.fetch(objName) || [];
                
                var data = {};
                
                for(var i = 0, l = extendParamsList.length; i < l; ++ i)
                {
                    if(extendParamsList[i].element == element)
                    {
                        data.extendParams = extendParamsList[i].extendParams;
                        break;
                    }
                }
                
                for(var i = 0, l = initApplyList.length; i < l; ++ i)
                {
                    if(initApplyList[i].element == element)
                    {
                        data.initApply = initApplyList[i].initApply;
                        break;
                    }
                }
                
                return data;
            }
        };
        
        function FunctionalMarker(element, objName) {
            var packageInfo = getPackageInfo(element, objName);
            var elementInfo = null;
            if(packageInfo)
            {
                elementInfo = packageInfo.elementInfo;
            }
            
            return {
                extendParams: function (params) {
                    if(elementInfo)
                    {
                        elementInfo.extParams = $.extend(elementInfo.extParams, params);
                    }
                    else
                    {
                        AccessRecord.saveExtendParams(element, objName, params);
                    }
                },
                init: function () {
                    if(elementInfo)
                    {
                        init(element, objName);
                    }
                    else
                    {
                        AccessRecord.saveInitApply(element, objName, true);
                    }
                }
            };
            
        };
        
        function init(element, objName) {
            var packageInfo = getPackageInfo(element, objName);
            var elementInfo = packageInfo.elementInfo;
            
            if(elementInfo.instantiation && elementInfo.initialized == false)
            {
                var params = getElementParams(element, objName);
                params = params || {};
                params = $.extend(params, elementInfo.extParams);
                packageInfo.init(element, params, objName);
                elementInfo.initialized = true;
            }
        };
        
        function getPackageInfo(element, objName) {
            var info = null;
            
            packageInfo.each(function (key, value) {
                var elementList = value.elementList;
                for(var i = 0, l = elementList.length; i < l; ++ i)
                {
                    if(element == elementList[i].dom && objName == elementList[i].instanceName)
                    {
                        info = {
                            packageName: key, 
                            init: value.init,
                            elementInfo: elementList[i]
                        };
                        return false;
                    }
                }
            });
            
            return info;
        };
        
        /**
         * 
            * @param {Object} options
            * @param options.packageName
            * @param options.init
         */
        FunctionalMarker.regist = function (options) {
            if(packageInfo.has(options.packageName) == false)
            {
                packageInfo.save(options.packageName, {
                    init: options.init,
                    elementList: []
                });
            }
        };
        
        FunctionalMarker.scan = function () {
            $("[data-fmuse]").each(function () {
                var $this = $(this);
                var data = $this.data();
                var unFunctionalMarkerInit = data["un_functional_marker_init"];
                if(!unFunctionalMarkerInit)
                    unFunctionalMarkerInit = {};
                var _require = data["fmuse"].split(" ");
                for(var i = 0, l = _require.length; i < l; ++ i)
                {
                    var regDefined = $.trim(_require[i]).split(":");
                    if(regDefined.length > 1)
                    {
                        var name = $.trim(regDefined[0]);
                        var pack = $.trim(regDefined[1]);
                        if(unFunctionalMarkerInit[name] != true)
                        {
                            unFunctionalMarkerInit[name] = true;
                            (function (_this, _name, _pack) {
                                require([_pack], function () {
                                    
                                    var accessRecord = AccessRecord.fetch(_this, _name);
                                    var extParams = {};
                                    
                                    if(accessRecord)
                                    {
                                        extParams = accessRecord.extendParams || {};
                                    }
                                    var info = packageInfo.fetch(_pack);
                                    var elementInfo = {
                                        dom: $this.get(0),
                                        instance: null,
                                        instanceName: null,
                                        extParams: extParams,
                                        instantiation: info.init ? true : false,
                                        initialized: false
                                    };
                                    
                                    elementInfo.instanceName = name;
                                    info.elementList.push(elementInfo);
                                    
                                    var params = getElementParams(_this, _name);
                                    
                                    if(params.hasOwnProperty("notAutoInit") == false || params.notAutoInit === false || accessRecord.initApply)
                                    {
                                        init(_this, _name);
                                    }
                                    
                                });
                            })(this, name, pack);
                        }
                    }
                }
                $this.data("un_functional_marker_init", unFunctionalMarkerInit);
            });
        };
        
        return FunctionalMarker;
    }
);
