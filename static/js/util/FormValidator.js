/**

 *              //init form validate
                var formValidator = new FormValidator({
                    form: $("#form"),
                    triggers: "blur|focus|keydown"
                });
 */
define(
    [
        "util/data/Validator",
        "lib/jQuery",
        "base/Dispatcher"
    ],
    function (Rule, $, Dispatcher) {
        // 将要进行一番form验证： beforevalidate
        // 当进行了一番form验证后：validated
        // 当对整个form进行了验证通过后：pass
        // 当对整个form进行了验证失败后：notpass
        // 将要对一个field验证： beforefieldvalidate
        // 当一个field验证过后：fieldvalidated
        // 当field验证通过后: fieldpass
        // 当field验证失败后: fieldnotpass
        // 当Validator要自行提交form的时候：submit
        // **************************************
        // 均可通过return false;来阻止一定行为。
        /**
         * Validator，表单验证核心类。
         * @param options
         * @option form 目标form      like $("#form") default not null 
         * @option rules    rules集合 like {userName: "required: '必填', remoteTest: '远程失败'"}   default null
         * @option triggers 触发器 like "mousedown|blur"   default ""
         * @option submitValidate   是否在发生提交行为的时候，自动验证。 like false default true
         */
        function Validator(options) {
            this.dispatcher = new Dispatcher();
            var self = this;
            options = options || {};
            options = $.extend({
                triggers: "",
                rules: {},
                submitValidate: true,
                target: options.form
            }, options);
            $.extend(options, {
                form: $(options.form),
                triggers: options.triggers.split("|")
            });
            $.extend(self, options);
            $.extend(self, {
                submitIntercept: function () {
                    self.submit();
                    return false;
                }
            });
            //添加trigger
            for(var i = 0, l = self.triggers.length; i < l; ++ i)
            {
                //给所有元素添加trigger。
                self.addTrigger({
                    trigger: $.trim(self.triggers[i])
                });
            }
            //初始化rule&tip
            for(var elementName in self.rules)
            {
                addRuleAndTipByDataValidateTxt(elementName, self.rules[elementName], self);
            }
            //扫描form，根据标记设置validator。
            this.scan();
            //自动submit验证
            if(options.submitValidate == true)
            {
                this.form.bind("submit", self.submitIntercept);
            }
        };

        /**
         *  给Validator系统添加/设置一个新Rule
         * @param options
         * @option name 规则名称  like "userexist" default (all name)
         * @option test 测试方法    like function (value, testSuccess) {testSuccess(value == true);} default not null
         */
        Validator.addRule = function (options) {
            Rule.add({
                name: options.name,
                test: options.test
            });
        };
        
        //以下均为全局默认回调，在事件之后执行。不要被这片方法吓到，你如果不想写插件or扩展。完全可以略过。
        
        /**
         *@param results
         * 在 fieldvalidate 之后回调
         */
        Validator.onBeforeFieldValidate = function (results) {};
        
        /**
         *@param results
         * 在 beforevalidate 之后回调
         */
        Validator.onBeforeValidate = function (results) {};
        
        /**
         *@param results
         * 在 fieldpass之后回调
         */
        Validator.onFieldPass = function (results) {};
        
        /**
         *@param results
         * 在 pass 之后回调
         */
        Validator.onPass = function (results) {};
        
        /**
         *@param results
         * 在 fieldnotpass 之后回调
         */
        Validator.onFieldNotPass = function (results) {};
        
        /**
         *@param results
         * 在 notpass 之后回调
         */
        Validator.onNotPass = function (results) {};
        
        /**
         *@param results
         * 在 fieldvalidated 之后回调
         */
        Validator.onFieldValidated = function (results) {};
        
        /**
         *@param results
         * 在 validated 之后回调
         */
        Validator.onValidated = function (results) {};
        
        /**
         *@param results
         * 在 submit 之后回调
         */
        Validator.onSubmit = function (results) {};
        
        //***************************************
        
        /**
         * @param options.name
         * @param options.listener
         */
        Validator.prototype.listen = function (options) {
            this.dispatcher.regist(options.name, options.listener);
        };
        
        /**
         * @param options.name
         * @param options.listener
         */
        Validator.prototype.removeListener = function (options) {
            this.dispatcher.remove(options.name, options.listener);
        };
        
        
        /**
         * 添加一个验证触发事件
         * @param options
         * @option name 控件名称（name)  like "userName" default (all name)
         * @option ruleName 规则名称    like "required" default (all ruleName)
         * @option trigger  触发器名称（DOM事件名称）  like "blur" default not null
         */
        Validator.prototype.addTrigger = function (options) {
            var self = this;
            options = options || {};
            var targetSelector = options.name ? "[name='" + options.name + "']" : "input";
            var targetElement = this.form.find(targetSelector);
            targetElement.each(function () {
                var thisElement = $(this);
                if(RuleTrigger.hasRuleTrigger(thisElement, options.ruleName, options.trigger) == false)
                {
                    RuleTrigger.setRuleTrigger(thisElement, options.ruleName, options.trigger, function () {
                        self.validateField({
                            name: thisElement.attr("name"),
                            ruleName: options.ruleName
                        });
                    });
                }
            });
        };

        /**
         * 移除一个验证触发事件
         * @param options
         * @option name 控件名称（name)  like "userName" default (all name)
         * @option ruleName 规则名称    like "required" default (all ruleName)
         * @option trigger  触发器名称（DOM事件名称）  like "blur" default not null
         */
        Validator.prototype.removeTrigger = function (options) {
            var self = this;
            options = options || {};
            var targetSelector = options.name ? "[name='" + options.name + "']" : "input";
            var targetElement = this.form.find(targetSelector);
            targetElement.each(function () {
                RuleTrigger.removeRuleTrigger($(this), options.ruleName, options.trigger);
            });
        };

        /**
         * 验证整个form
         * @param options
         * @option validated 验证完成回调，同complete   like function () {} default null 
         * @option pass 验证成功回调  like function () {} default null
         * @option notPass 验证失败回调 like function () {} default null
         */
        Validator.prototype.validate = function (options) {
            options = options || {};
            //兼容complete
            options.complete = options.validated || options.complete;
            var self = this;
            var nameMap = {};
            var nameArr = [];
            // fire event
            if(this.dispatcher.send("beforevalidate", {
                formValidator: self
            }) == false)
                return;
            if(Validator.onBeforeValidate({
                formValidator: self
            }) == false)
                return;
            //获取form中的所有name，待优化。
            var allInput = this.form.find("input, textarea");
            allInput.each(function () {
                var $this = $(this);
                var name = $this.attr("name");
                if(name && name.length > 0 && nameMap[name] != true)
                {
                    nameArr.push(name);
                    nameMap[name] = true;
                }
            });
            var validateCount = 0;
            var results = {};
            //TODO 反转状态，以暂时禁用自动focus功能,设置为false开启。
            var focusErrorInput = true;
            //将每个name交由validateField去验证。将结果合并到results。
            for(var i = 0, l = nameArr.length; i < l; ++ i)
            {
                (function (index) {
                    
                    self.validateField({
                        name: nameArr[index],
                        complete: function (result) {
                            results[nameArr[index]] = result;
                            //focus第一个错误input
                            if(focusErrorInput == false)
                            {
                                for(var rrn in result)
                                {
                                    if(result[rrn].pass == false)
                                    {
                                        allInput.filter("[name='" + nameArr[index]  + "']:first").trigger("focus");
                                        focusErrorInput = true;
                                        break;
                                    }
                                }
                            }
                            //全部验证完成，进行complete操作。
                            if(++ validateCount >= l)
                            {
                                var eventData = {
                                    formValidator: self,
                                    results: results
                                };
                                var fvValidatedResult = self.dispatcher.send("validated", eventData);
                                if(fvValidatedResult != false)
                                {
                                    Validator.onValidated(eventData);
                                }
                                //检查结果，判断是否要发送pass事件。
                                if(fvValidatedResult == true)
                                {
                                    var allPass = true;
                                    for(var elementName in results)
                                    {
                                        if(allPass == false)
                                            break;
                                        var rules = results[elementName];
                                        for(var ruleName in rules)
                                        {
                                            if(rules[ruleName].pass == false)
                                            {
                                                allPass = false;
                                                break;
                                            }
                                        }
                                    }
                                    if(allPass == true)
                                    {
                                        if(!options.pass || options.pass(eventData) != false)
                                        {
                                            if(self.dispatcher.send("pass", eventData) != false)
                                                Validator.onPass(eventData);
                                        }
                                    }
                                    else
                                    {
                                        if(!options.notPass || options.notPass(eventData) != false)
                                        {
                                            if(self.dispatcher.send("notpass", eventData) != false)
                                                Validator.onNotPass(eventData);
                                        }
                                    }
                                }
                                if(options.complete)
                                    options.complete(eventData);
                            }
                        }
                    });
                })(i);
            }
        };
        
        function getQueryValue($obj) {
            var valueList = [];
            $obj.each(function () {
                var dom = this;
                if(dom.type == "radio" || dom.type == "checkbox")
                {
                    if(dom.checked)
                    {
                        valueList.push(dom.name + "=" + encodeURIComponent(dom.value)); 
                    }
                    else
                    {
                        valueList.push(dom.name + "="); 
                    }
                }
                else if(dom.options)
                {
                    if(dom.selected)
                    {
                        valueList.push(dom.name + "=" + encodeURIComponent(dom.value)); 
                    }
                    else
                    {
                        valueList.push(dom.name + "="); 
                    }
                }
                else
                {
                   valueList.push(dom.name + "=" + encodeURIComponent(dom.value)); 
                }
            });
            
            return valueList.join("&");
        };

        /**
         * 验证单个field
         * @param options
         * @option name 控件名称（name)  like "userName" default not null
         * @option ruleName 规则名称    like "required" default (all ruleName)
         * @option validated 验证完成回调，同complete   like function () {} default null 
         * @option pass 验证成功回调  like function () {} default null
         * @option notPass 验证失败回调 like function () {} default null
         */
        Validator.prototype.validateField = function (options) {
            options = options || {};
            //兼容complete
            options.complete = options.validated || options.complete;
            var self = this;
            var targetElement = this.form.find("[name='" + options.name + "']");
            var value = null;
            var kvs = null;
            //select特殊处理
            var targetElementDom = targetElement.get(0);
            kvs = getQueryValue(targetElement);
            
            //权宜之计：处理序列化之后的加号（空格）
            kvs = kvs.replace(/\+/g, " ");
            if(kvs && kvs.length > 0)
            {
                var kvArr = kvs.split("&");
                for(var i = 0, l = kvArr.length; i < l; ++ i)
                {
                    var kv = kvArr[i].split("=");
                    if(kv[1] && kv[1].length > 0)
                    {
                        if(value == null)
                        {
                            value = decodeURIComponent(kv[1]);
                        }
                        else
                        {
                            if($.isArray(value) == false)
                            {
                                value = [value];
                            }
                            value.push(decodeURIComponent(kv[1]));
                        }
                    }
                }
            }
            //取得规则。
            var rules = targetElement.data("formvalidator_rules");
            var disabledRules = targetElement.data("formvalidator_disabled_rules") || {};
            var disabledRulesAll = targetElement.data("formvalidator_disabled_rules_all");
            //有rule，并且没有被全rule禁止，且验证通知事件没被阻止。进行验证。
            if(rules && rules.length > 0 && disabledRulesAll != true)
            {
                // fire event,如果事件或者回调返回false，则终止验证。
                var beforeFieldValidate = self.dispatcher.send("beforefieldvalidate", {
                    formValidator: self, 
                    name: options.name
                });
                if(beforeFieldValidate != false)
                {
                    beforeFieldValidate = Validator.onBeforeFieldValidate({
                        formValidator: self, 
                        name: options.name
                    });
                }
                else
                {
                    if(options.complete)
                        options.complete({});
                    return;
                }
                if(beforeFieldValidate != false)
                {
                    var results = {};
                    var ruleNum = rules.length;
                    var index = -1;
                    function nextValid() {
                        if(++ index >= ruleNum)
                            return;
                        //rule当前不为指定rule，或者指定rule被禁止验证，直接进行下一个rule的验证。
                        if(( options.ruleName != undefined && rules[index] != options.ruleName ) || disabledRules[rules[index]] == true)
                            nextValid();
                        var elementName = targetElement.attr("name");
                        Rule.test({
                            name: rules[index],
                            value: value,
                            complete: function (result, data) {
                                var errorTipTemplate = self.getErrorTipTemplate({
                                    name: elementName,
                                    ruleName: rules[index]
                                }) || "";
                                
                                //==null则没有这个规则。
                                if(result != null)
                                {
                                    results[rules[index]] = {
                                        pass: result,
                                        data: data,
                                        errorTip: $.trim(errorTipTemplate)
                                    };
                                }
                                if(( index + 1 ) >= ruleNum || result == false)
                                {
                                    var eventData = {};
                                    eventData["results"] = results;
                                    eventData["name"] = elementName;
                                    eventData["formValidator"] = self;
                                    var fvFieldValidatedResult = self.dispatcher.send("fieldvalidated", eventData);
                                    if(fvFieldValidatedResult == true)
                                    {
                                        Validator.onFieldValidated(eventData);
                                    }
                                    //判断是否发送fieldpass事件。
                                    if(result != false && fvFieldValidatedResult == true)
                                    {
                                        if(!options.pass || options.pass(eventData) != false)
                                        {
                                            if(self.dispatcher.send("fieldpass", eventData) != false)
                                                Validator.onFieldPass(eventData);
                                        }
                                    }
                                    else
                                    {
                                        if(!options.notPass || options.notPass(eventData) != false)
                                        {
                                            if(self.dispatcher.send("fieldnotpass", eventData) != false)
                                                Validator.onFieldNotPass(eventData);
                                        }
                                    }
                                    if(options.complete)
                                        options.complete(results);
                                }
                                else
                                {
                                    nextValid();
                                }
                                
                                
                            }
                        });
                    };
                    nextValid();
                }
                else
                {
                    if(options.complete)
                        options.complete({});
                    return;
                }
            }
            else
            {
                if(options.complete)
                    options.complete({});
            }
        };
        
        /**
         *禁止验证
         * @param options
         * @option name 要禁止验证的元素名称  like "userName" default (all name)
         * @option ruleName 要禁止验证的规则名称  like "required" default (all ruleName)
         */
        Validator.prototype.disable = function (options) {
            var selector = options.hasOwnProperty("name") ? "[name='" + options.name + "']" : "input";
            var inputs = this.form.find(selector);
            disableRuleName(inputs, options.ruleName, true);
        };
        
        /**
         *开启验证
         * @param options
         * @option name 允许验证的元素名称   like "userName" default (all name)
         * @option ruleName 允许验证的规则名称   like "required" default (all ruleName)
         */
        Validator.prototype.enable = function (options) {
            var selector = options.hasOwnProperty("name") ? "[name='" + options.name + "']" : "input";
            var inputs = this.form.find(selector);
            disableRuleName(inputs, options.ruleName, false);
        };

        /**
         * 提交form
         */
        Validator.prototype.submit = function () {
            var self = this;
            this.validate({
                pass: function () {
                    self.form.unbind("submit", self.submitIntercept);
                    self.form.submit();
                }
            });
        };

        /**
         * 添加一个rule
         * @param options
         * @option name 控件名称（name)  like "userName" default not null
         * @option ruleName 规则名称    like "required" default not null
         */
        Validator.prototype.addRule = function (options) {
            var targetElements = this.form.find("[name='" + options.name + "']");
            targetElements.each(function () {
                var thisElement = $(this);
                //一个input的所有rule保存在此data。
                var curRules = thisElement.data("formvalidator_rules");
                curRules = curRules || [];
                if($.inArray(options.ruleName, curRules) == -1)
                {
                    curRules.push(options.ruleName);
                    thisElement.data("formvalidator_rules", curRules);
                }
            });
        };

        /**
         *  移除一个rule
         * @param options
         * @option name 控件名称（name)  like "userName" default not null
         * @option ruleName 规则名称    like "required" default not null
         */
        Validator.prototype.removeRule = function (options) {
            var targetElements = this.form.find("[name='" + options.name + "']");
            targetElements.each(function () {
                var thisElement = $(this);
                var curRules = thisElement.data("formvalidator_rules");
                if(curRules)
                {
                    for(var i = curRules.length - 1; i >= 0; -- i)
                    {
                        if(curRules[i] == options.ruleName)
                        {
                            curRules.splice(i, 1);
                            thisElement.data("formvalidator_rules", curRules);
                            return;
                        }
                    }
                }
            });
        };

        /**
         * 设置错误提示文案模板
         * @param options
         * @option name 控件名称（name)  like "userName" default not null
         * @option ruleName 规则名称    like "required" default not null
         * @option template 提示信息
         */
        Validator.prototype.setErrorTipTemplate = function (options) {
            var self = this;
            var targetElement = self.form.find("[name='" + options.name + "']");
            var errorTipTemplate = targetElement.data("formvalidator_error_tip_template") || {};
            errorTipTemplate[options.ruleName] = options.template;
            targetElement.data("formvalidator_error_tip_template", errorTipTemplate);
        };

        /**
         *  取得一个错误提示文案模板
         * @param options
         * @option name 控件名称（name)  like "userName" default not null
         * @option ruleName 规则名称    like "required" default not null
         */
        Validator.prototype.getErrorTipTemplate = function (options) {
            var self = this;
            var errorTipTemplate = self.form.find("[name='" + options.name + "']").data("formvalidator_error_tip_template");
            if(errorTipTemplate)
            {
                var aErrorTipTempalte = errorTipTemplate[options.ruleName];
                return aErrorTipTempalte ? aErrorTipTempalte : null;
            }
            return null;
        };

        /**
         * 扫描form，根据标记配置validator。
         */
        Validator.prototype.scan = function () {
            var self = this;
            var addedMap = {};
            self.form.find("input, textarea").each(function () {
                var thisElement = $(this);
                var name = thisElement.attr("name");
                if(addedMap[name] != true)
                {
                    var dataValidate = thisElement.attr("data-validate");
                    if(dataValidate && dataValidate.length > 0)
                    {
                        addRuleAndTipByDataValidateTxt(name, dataValidate, self);
                        addedMap[name] = true;
                    }
                }
            });
        };

        /**
         * 取得formdom
         */
        Validator.prototype.getFormDom = function () {
            return this.form.get(0);
        };

        //正则表达式缓存
        var REGEXP = {
            EXTRACT_DATA_VALIDATE_CON: /([\w_\|\.]+)(\s*:\s*('|")(([^\\'\\"]|\\.)+)('|"))?/g
        };
        
        function disableRuleName(elements, ruleName, disable) {
            elements.each(function () {
                var thisInput = $(this);
                var disabledRules = thisInput.data("formvalidator_disabled_rules") || {};
                if(ruleName != undefined && ruleName != null)
                {
                    disabledRules[ruleName] = disable;
                    //启用任何一个rule，都要formvalidator_disabled_rules_all = false;
                    if(disable == false)
                    {
                        thisInput.data("formvalidator_disabled_rules_all", false);
                    }
                }
                //没有指定ruleName，formvalidator_disabled_rules_all = disable;
                else
                {
                    thisInput.data("formvalidator_disabled_rules_all", disable);
                }
            });
        };

        function addRuleAndTipByDataValidateTxt(name, dvtxt, self) {
            var rules = dvtxt.match(REGEXP.EXTRACT_DATA_VALIDATE_CON);
            if(rules && rules.length > 0)
            {
                for(var i = 0, l = rules.length; i < l; ++ i)
                {
                    var ruleName = "";
                    var tipTemplate = "\"\"";
                    var splitIndex = rules[i].indexOf(":");
                    if(splitIndex != -1)
                    {
                        var rule = rules[i];
                        ruleName = rule.substr(0, splitIndex);
                        tipTemplate = $.trim(rule.substr(splitIndex + 1));
                    }
                    else  //没有:分隔符
                    {
                        ruleName = rules[i];
                    }
                    self.addRule({
                        name: name,
                        ruleName: ruleName
                    });
                    self.setErrorTipTemplate({
                        name: name,
                        ruleName: ruleName,
                        template: eval("(" + tipTemplate + ")")
                    });
                    //添加trigger
                    for(var ii = 0, ll = self.triggers.length; ii < ll; ++ ii)
                    {
                        self.addTrigger({
                            name: name,
                            ruleName: ruleName,
                            trigger: $.trim(self.triggers[ii])
                        });
                    }
                }
            }
        };

        //RuleTrigger是保存在input.data（jquery)中的一个对象，标示此元素所有的rule触发器。比如：required的验证会由keyup事件发生的时候进行。等此类信息。
        var RuleTrigger = {
            /**
             * 给element设置一个RuleTrigger
             * @param element
             * @param ruleName
             * @param trigger
             * @param callback
             */
            setRuleTrigger: function (element, ruleName, trigger, callback) {
                element.bind(trigger, callback);
                //触发器信息保存在此
                var curRuleTriggers = element.data("formvalidator_triggers") || {};
                var finalRuleName = ruleName ? ruleName : "@-formvalidator_all_rule";
                //一个ruleName对应n个trigger，如果没指定ruleName，则为所有rule:@-formvalidator_all_rule。
                var curTriggers = curRuleTriggers[finalRuleName] || {};
                //保存trigger引用。
                curTriggers[trigger] = callback;
                curRuleTriggers[finalRuleName] = curTriggers;
                element.data("formvalidator_triggers", curRuleTriggers);
            },
            /**
             *  给指定element移除RuleTrigger
             * @param element
             * @param ruleName
             * @param trigger
             */
            removeRuleTrigger: function (element, ruleName, trigger) {
                var curRuleTriggers = element.data("formvalidator_triggers") || {};
                var rule = curRuleTriggers[ruleName] || curRuleTriggers["@-formvalidator_all_rule"] || false;
                if(rule)
                {
                    var checker = rule[trigger];
                    if(checker)
                    {
                        delete rule[trigger];
                        element.unbind(trigger, checker);
                    }
                }
                var rule = curRuleTriggers["@-formvalidator_all_rule"];
                if(rule)
                {
                    var checker = rule[trigger];
                    if(checker)
                    {
                        delete rule[trigger];
                        element.unbind(trigger, checker);
                    }
                }
            },
            /**
             * 判断一个elemenet是否拥有指定的RuleTrigger
             * @param element
             * @param ruleName
             * @param trigger
             */
            hasRuleTrigger: function (element, ruleName, trigger) {
                var curRuleTriggers = element.data("formvalidator_triggers") || {};
                var rule = curRuleTriggers[ruleName] || curRuleTriggers["@-formvalidator_all_rule"] || false;
                if(rule)
                {
                    return rule[trigger] ? true : false;
                }
                return false;
            }
        };

        return Validator;
    }
);
