/**
 * Created by IntelliJ IDEA.
 * User: hangyin
 * Date: 12-6-13
 * Time: 下午4:43
 * To change this template use File | Settings | File Templates.
 */
define(
    [
        "lib/jQuery"
    ],
    function ($) {
        
        var REG_EXP = {
            CHINESE: /^[\u4e00-\u9fa5]+$/,
            TELEPHONE: /^\d+\-?\d+\-?\d+$/,
            CELLPHONE: /^(0|86|17951)?(13[0-9]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$/,
            NOSPACE: /^[\S]+$/,
            WHITESPACE: /^[\s]+$/,
            EMAIL: /^[a-zA-Z0-9]+([a-zA-Z0-9\-\_.])*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            ATSOHUMAIL: /@(sohu\.com|chinaren\.com|sohu|chinaren|sogou\.com|sogou|17173\.com|37wanwan\.com|17173|focus\.cn|focus|vip\.sohu\.com|vip\.sohu|game\.sohu\.com|game\.sohu)$/i,
            ATSOHUCOMMAIL: /@sohu\.com$/i,
            SOHUMAILNAME: /^[a-z]+[\d\w\-\.\_]{3,16}$/,
            SOHUMAIL: /^[a-z]+[\d\w\-\.\_]*@(sohu\.com|chinaren\.com|sohu|chinaren|sogou\.com|sogou|17173\.com|37wanwan\.com|17173|focus\.cn|focus|vip\.sohu\.com|vip\.sohu|game\.sohu\.com|game\.sohu)$/i,
            NEC: /^[0-9a-zA-Z\u4e00-\u9fa5]+$/,
            NEC_: /^[0-9a-zA-Z\u4e00-\u9fa5]+$/,
            PASSWORD: /^[\d\w\.\!\#\$\%\^\*\'\+\-\/\`\@\(\)\[\]\\\:\;\"\,\<\>\?\=\_\{\|\}\~]+$/,
            LOWERCASESTART: /^[a-z]/,
            NUMBER: /^[\d]*$/,
            IDCARD_15: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/,
            IDCARD_18: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])(\d{4}|\d{3}(X|x))$/,
            CHINESENAME: /^[\u4e00-\u9fa5\·\w]+$/
        };
        
        var EX_REGEXP = {
            LENGTH_RULE: /^l[\d]+l[\d]+$/,
            NUM_RULE: /^n[\d]+n[\d]+$/,
            FLOATNUMBER_RULE: /^f[\d]+((\.[\d]+)|)f[\d]+((\.[\d]+)|)$/
        };
        
        var validateMap = {
            _ex: function (value, complete) {
                complete(value == 1, "验证完成");
            },
            postCode: function (value, complete) {
                complete(( value && value.length > 0 ) != true && REG_EXP.NUMBER.test(value));
            },
            chinese: function (value, complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.CHINESE.test(value) ));
            },
            telephone: function (value, complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.TELEPHONE.test(value) ));
            },
            cellphone: function (value, complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.CELLPHONE.test(value) ));
            },
            nospace: function (value, complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.NOSPACE.test(value) ));
            },
            whitespace: function (value, complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.WHITESPACE.test(value) ));
            },
            //
            email: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.EMAIL.test(value) ));
            },
            atsohumail: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.ATSOHUMAIL.test(value) ));
            },
            atsohucommail: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.ATSOHUCOMMAIL.test(value) ));
            },
            required: function (value ,complete) {
                complete((value && value.length > 0 ) == true);
            },
            sohumailname: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.SOHUMAILNAME.test(value) ));
            },
            sohumail: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.SOHUMAIL.test(value) ));
            },
            nec: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.NEC.test(value) ));
            },
            nec_: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.NEC_.test(value) ));
            },
            password: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.PASSWORD.test(value) ));
            },
            lowercaseStart: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.LOWERCASESTART.test(value) ));
            },
            number: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.NUMBER.test(value) ));
            },
            idcard: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.IDCARD_15.test(value) || REG_EXP.IDCARD_18.test(value) ));
            },
            chinesename: function (value ,complete) {
                complete(( value && value.length > 0 ) != true || ( REG_EXP.CHINESENAME.test(value) ));
            }
            //
        };

        var Validator = {
            /**
             *
             * @param options
             * @option name
             * @option value
             * @option complete
             */
            test: function (options) {
            	options = $.extend({
            		value: ""
            	}, options);
                //检测是否为required|l2l2格式(“或”组合)
                var nameSplited = options.name.split("|");
                if(nameSplited && nameSplited.length > 1)
                {
                    var index = -1;
                    var length = nameSplited.length;
                    function nextValid() {
                        if(( ++ index ) >= length)
                        {
                            options.complete(false);
                            return;
                        }
                        Validator.test({
                            name: $.trim(nameSplited[index]),
                            value: options.value,
                            complete: function (r) {
                                if(r == true)
                                {
                                    options.complete(true);
                                }
                                else
                                {
                                    nextValid();
                                }
                            }
                        });
                    };
                    nextValid();
                    return;
                }
                //检查是否为取长度校验规则，例如: l2l20
                var lengthRule = EX_REGEXP.LENGTH_RULE.test(options.name);
                //检查是否为测试数字大小的规则，例如：n0n3000
                var numRule = EX_REGEXP.NUM_RULE.test(options.name);
                //检查是否为测试浮点数大小的规则，例如：f3.14f3.1415
                var floatNumRule = EX_REGEXP.FLOATNUMBER_RULE.test(options.name);
                if(lengthRule == true)
                {
                    var ruleDetail = options.name.split("l");
                    options.value += "";
                    if (options.value.length >= ruleDetail[1] && options.value.length <= ruleDetail[2])
                    {
                        options.complete(true, {});
                        return;
                    }
                    options.complete(false, {});
                    return;
                }
                else if(numRule == true)
                {
                    var ruleDetail = options.name.split("n");
                    options.value *= 1;
                    if(REG_EXP.NUMBER.test(options.value) == false)
                    {
                        options.complete(false, {});
                        return;
                    }
                    if (options.value >= ruleDetail[1] && options.value <= ruleDetail[2])
                    {
                        options.complete(true, {});
                        return;
                    }
                    options.complete(false, {});
                    return;
                }
                else if(floatNumRule == true)
                {
                    var ruleDetail = options.name.split("f");
                    if(options.hasOwnProperty("value") && options.value != null && (options.value + "").length > 0)
                	{
                        
                        var startDecimalValue = (( ruleDetail[1] + "" ).split("."))[1];
                        var startDecimalPlaces = startDecimalValue ? startDecimalValue.length : 0;
                        
                        var endDecimalValue = (( ruleDetail[2] + "" ).split("."))[1];
                        var endDecimalPlaces = endDecimalValue ? endDecimalValue.length : 0;

                        var valueDecimalValue = (options.value.split("."))[1];
                        var valueDecimalPlaces = valueDecimalValue ? valueDecimalValue.length : 0;
                        
                        options.value *= 1;
                        
                        if (options.value >= ruleDetail[1] && options.value <= ruleDetail[2] && valueDecimalPlaces <= ( startDecimalPlaces > endDecimalPlaces ? startDecimalPlaces : endDecimalPlaces))
                        {
                            options.complete(true, {});
                            return;
                        }
                        options.complete(false, {});
                        return;
                	}
                    else
                	{
                    	options.complete(true, {});
                	}
                }
                var rule = validateMap[options.name];
                if(rule)
                {
                    rule(options.value, function (result, data) {
                        options.complete(result, data);
                    });
                    return;
                }
                options.complete(null, undefined);
            },
            /**
             *
             * @param options
             * @option name
             * @option test function (value, complete) {
             *     complete(value == true ? true : false);
             * }
             */
            add: function (options) {
                validateMap[options.name] = options.test;
            }
        };

        return Validator;
    }
);
