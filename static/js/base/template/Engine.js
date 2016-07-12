define(function () {
    var REG_EXP = {
        R_N: /\n/g,
        R_R: /\r/g,
        R_T: /\t/g,
        R_F: /\f/g,
        R_QUOTE: /\"/g,
        R_SLASH: /\\/g,
        R_TRIM: /(^\s*)|(\s*$)/g,
        R_AB: /[&<>"]/igm,
    };

    var escapehash = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#x27;",
        "/": "&#x2f;"
    };
    
    function replaceAB(m) {
        return escapehash[m];
    };
    
    function trim(str) {
        return str.replace(REG_EXP.R_TRIM, "");
    };
    
    var RUNTIME = "#TERUNTIME";
    var TEMPLATES = {};
    
    window[RUNTIME] = {
        outputVal: function (value, filter_data) {
            if(value == undefined)
                return "";
            if(filter_data != "false")
                return wrou(value);
            else {
                return value;
            }
        },
        outputUnicode: function (str) {
            return typeof(str) == "string" ? str.replace(REG_EXP.R_AB, replaceAB) : str;
        },
        register: function (uri, template) {
            TEMPLATES[uri] = template;
        },
        include: function (cacheid, data) {
            if(TEMPLATES[cacheid] == undefined)
                throw "include exception: cacheid \"" + cacheid + "\" not found.";
            return TEMPLATES[cacheid].render({
                data: data
            });
        }
    };
    
    //此方法调用过于频繁，缓存其以提高效率。
    var wrou = window[RUNTIME].outputUnicode;
    
    //分为两种setting，一种是渲染时的控制settings，一种是非渲染时控制settings。
    var templateObjSettingsName = {
        "filter_data": false,
        "cacheid": true
    };
    
    /**
     * @option source
     */
    var Translater = {
        COUNT: 0,
        /**
         * 开始翻译
         * @option source 源代码
         */
        start: function (source) {
            ++ Translater.COUNT;
            //生成内容存储器变量名称
            var contentValName = "TEC" + Translater.COUNT + "_" + new Date().getTime();
            //设置存储器的变量名称
            var settingsValName = "TES" + Translater.COUNT + "_" + new Date().getTime();
            //静态内容缓存
            var staticContent = [];
            //脚本缓存
            var javascript = ["var data=arguments[0];var " + contentValName + "=\"\";var " + settingsValName + "={};"];
            //输出标记缓存
            var outputValue = [];
            //设置语句缓存
            var settings = [];
            //原始内容缓存
            var sourceContent = [];
            //语法开始标记
            var codeMarker = false;
            //设置语句标记
            var settingsMarker = false;
            //变量输出标记
            var outputMarker = false;
            //原始内容输出标记
            var sourceMarker = false;
            //模板对象设置
            var templateObjSettings = {
                include: []
            };
            //模板包含标记
            var includeMarker = false;
            //模板包含缓存
            var includes = [];
            for(var i = 0, l = source.length; i < l; ++ i)
            {
                var str = source.charAt(i);
                //处理代码段
                if(codeMarker == true)
                {
                    if(str == "%" && ( i < source.length - 1 ) && source.charAt(i + 1) == ">")
                    {
                        codeMarker = false;
                        ++ i;
                        continue;
                    }
                    javascript.push(str);
                    continue;
                }
                //处理输出代码段
                if(outputMarker == true)
                {
                    if(str == "%" && ( i < source.length - 1 ) && source.charAt(i + 1) == ">")
                    {
                        if(outputValue.length > 0)
                            javascript.push(contentValName + "+=window[\"" + RUNTIME + "\"].outputVal(" + outputValue.join("") + "," + settingsValName + "[\"filter_data\"]);");
                        outputValue = [];
                        outputMarker = false;
                        ++ i;
                        continue;
                    }
                    outputValue.push(str);
                    continue;
                }
                //处理包含语句段
                if(includeMarker == true)
                {
                    if(str == "%" && ( i < source.length - 1 ) && source.charAt(i + 1) == ">")
                    {
                        if(includes.length > 0)
                        {
                            var kv = includes.join("").split("(");
                            kv[0] = trim(kv[0]);
                            kv[1] = kv[1] ? ( trim(kv[1].split(")")[0]) || "data" ) : "data";
                            javascript.push(contentValName + "+=window[\"" + RUNTIME + "\"].include(\"" + kv[0] + "\"," + kv[1] + ");");  
                            templateObjSettings["include"].push(kv[0]);      
                        }
                        includes = [];
                        includeMarker = false;
                        ++ i;
                        continue;
                    }
                    includes.push(str);
                    continue;
                }
                //处理输出原始内容代码段
                if(sourceMarker == true)
                {
                    if(str == "%" && ( i < source.length - 1 ) && source.charAt(i + 1) == ">")
                    {
                        if(sourceContent.length > 0)
                            javascript.push(contentValName + "+=\"" + window[RUNTIME].outputUnicode(sourceContent.join("")) + "\";");
                        sourceContent = [];
                        sourceMarker = false;
                        ++ i;
                        continue;
                    }
                    sourceContent.push(str);
                    continue;
                }
                //处理设置代码段
                if(settingsMarker == true)
                {
                    if(str == "%" && ( i < source.length - 1 ) && source.charAt(i + 1) == ">")
                    {
                        if(settings.length > 0)
                        {
                            var kv = settings.join("").split("=");
                            kv[0] = trim(kv[0]);
                            kv[1] = trim(kv[1]);
                            if(templateObjSettingsName[kv[0]])
                                templateObjSettings[kv[0]] = kv[1];
                            else
                            {
                                javascript.push(settingsValName + "[\"" + kv[0] + "\"]=\"" + kv[1] + "\";");
                            }
                        }
                        settings = [];
                        settingsMarker = false;
                        ++ i;
                        continue;
                    }
                    settings.push(str);
                    continue;
                }
                //是否进入代码段判断
                if(str == "<" && ( i < source.length - 1 ) && source.charAt(i + 1) == "%")
                {
                    if(staticContent.length > 0)
                    {
                        var finalStaticContent = staticContent.join("").replace(REG_EXP.R_SLASH, "\\\\").replace(REG_EXP.R_QUOTE, "\\\"");
                        if(finalStaticContent.length > 0)
                            javascript.push(contentValName + "+=\"" + finalStaticContent + "\";");
                    }
                    staticContent = [];
                    if(( i < source.length - 2 ) && source.charAt(i + 2) == "=")
                    {
                        outputMarker = true;
                        i += 2;
                        continue;
                    }
                    //检测是否为设置语句
                    if(( i < source.length - 2 ) && source.charAt(i + 2) == ":")
                    {
                        settingsMarker = true;
                        i += 2;
                        continue;
                    }
                    //检测是否要显示为源内容
                    if(( i < source.length - 2 ) && source.charAt(i + 2) == ">")
                    {
                        sourceMarker = true;
                        i += 2;
                        continue;
                    }
                    //检测是否为包含语句段
                    if(( i < source.length - 2 ) && source.charAt(i + 2) == "<")
                    {
                        includeMarker = true;
                        i += 2;
                        continue;
                    }
                    codeMarker = true;
                    ++ i;
                    continue; 
                }
                else {
                    staticContent.push(str);
                }
            }
            if(staticContent.length > 0)
            {
                var finalStaticContent = staticContent.join("").replace(REG_EXP.R_SLASH, "\\\\").replace(REG_EXP.R_QUOTE, "\\\"");
                if(finalStaticContent.length > 0)
                    javascript.push(contentValName + "+=\"" + finalStaticContent + "\";");
            }
            return {
                builderSource: (javascript.join("") + "return " + contentValName + ";").replace(REG_EXP.R_N, "\\n").replace(REG_EXP.R_R, "\\r").replace(REG_EXP.R_T, "\\t").replace(REG_EXP.R_F, "\\f"),
                settings: templateObjSettings
            };
        }
    };
    
    /**
     * @option source
     * @option complete
     */
    function Template (options) {
        this.compiled = Translater.start(options.source);
        this.builder = new Function(this.compiled.builderSource);
        var settings = this.compiled.settings;
        if(settings["cacheid"])
        {
            var cacheid = trim(settings["cacheid"]);
            window[RUNTIME].register(cacheid, this);
            this.cacheid = cacheid;
        }
        var includeList = settings["include"];
        if(includeList.length > 0)
        {
            var self = this;
            var loadedCount = 0;
            for(var i = 0, l = includeList.length; i < l; ++ i)
            {
                Engine.getTemplate({
                    cacheid: includeList[i],
                    complete: function () {
                        if(++ loadedCount >= l)
                        {
                            if(options.complete)
                            {
                                options.complete(self);
                            }
                        }
                    }
                });
            }
        }
        else
        {
            if(options.complete)
                options.complete(this);
        }
    };
    
    /**
     * data
     */
    Template.prototype.render = function (options) {
        options = options || {};
        return this.builder(options.data || {});
    };
    
    var templateLoader = undefined;
    var TEMPLATE_LOADING_WAITS = {};
    
    function loadTemplate(cacheid, complete) {
        //所有载入请求都加入到waits里，载入完成后一并回复。
        var waits = TEMPLATE_LOADING_WAITS[cacheid] || [];
        waits.push(complete);
        //之前如果waits中有请求，直接返回等待回复。
        TEMPLATE_LOADING_WAITS[cacheid] = waits;
        if(waits.length != 1)
            return;
        if(templateLoader == undefined)
            throw "have not tempalteLoader.";
        templateLoader(cacheid, function(source) {
            Engine.compile({
                source : source,
                complete : function(template) {
                    for(var i = 0, l = waits.length; i < l; ++ i)
                    {
                        waits[i](template);
                    }
                }
            });
        });
    };
    
    var Engine = {
        /**
         * loader
         */
        setLoader : function(options) {
            templateLoader = options.loader;
        },
        /**
         * cacheid
         * complete
         */
        getTemplate : function(options) {
            options  = options || {};
            if(TEMPLATES.hasOwnProperty(options.cacheid)) {
                if(options.complete)
                    options.complete(TEMPLATES[options.cacheid]);
            } else {
                loadTemplate(options.cacheid, function(template) {
                    if(options.complete)
                        options.complete(template);
                });
            }
        },
        /**
         * return void
         * @option source
         * @option data
         * @option complete
         */
        renderFromSource: function (options) {
            new Template({
                source: options.source,
                complete: function (template) {
                    if(options.complete)
                        options.complete(template.render({
                            data: options.data
                        }));
                }
            });
        },
        /**
         * return String
         * @option cacheid
         */
        deleteTemplate: function (options) {
            delete TEMPLATES[options.cacheid];
        },
        /**
         * return void
         * @option template
         * @option data
         */
        render: function (options) {
            return options.template.render({
                data: options.data
            });
        },
        /**
         * return void
         * @option source
         * @option complete
         */
        compile: function (options) {
            new Template({
                source: options.source,
                complete: function (template) {
                    if(options.complete)
                        options.complete(template);
                }
            });
        }
    };
    
    return Engine;
});
