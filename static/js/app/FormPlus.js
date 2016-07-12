define(
    [
        "lib/jQuery",
        "util/FormPlus",
        "util/FunctionalMarker",
        "widget/Toast"
    ],
    function ($, FormPlus, FunctionalMarker, Toast) {
        
        var FormValidator = FormPlus.FormValidator;
        
        function error(dom, errMsg) {
            new Toast({
                text: errMsg
            });
        };

        function pass(dom) {
            
        };

        function clean(dom) {
            
        };

        function passAll(form) {

        };

        FormValidator.onValidated = function (data) {
            var targetForm = $(data.formValidator.getFormDom());
            var targetInput = targetForm.find("input[name='" + data.name + "']");
            var results = data.results;
            
            var hasBeenError = false;
            
            for(var name in results)
            {
                var rules = results[name];
                for(var ruleName in rules)
                {
                    var detail = rules[ruleName];
                    if(detail.pass == false)
                    {
                        if(hasBeenError == false)
                        {
                            FormValidator.showErrorTip({
                                dom: targetInput, 
                                msg: detail.errorTip
                            });
                        }
                        return;
                    }
                    else
                    {
                        pass(targetInput);
                    }
                }
            }
        };
        
        FormValidator.onBeforeFieldValidate = function (data) {
            
        };
        
        /**
         * @param options.dom
         * @param options.msg
         */
        FormValidator.showErrorTip = function (options) {
            error(options.dom, options.msg);
        };
        
        /**
         * @param options.dom
         */
        FormValidator.pass = function (options) {
            pass(options.dom);
        };
        
        FormValidator.prototype.clearAllErrorTip = function () {
            
        };
        
        FunctionalMarker.regist({
            packageName: "app/FormPlus",
            init: function (element, params) {
                delete params.target;
                
                if(params.successToast)
                {
                    var onDestroy = function () {};
                    params.onSubmitSuccess = function () {
                        new Toast({
                            text: params.successToast,
                            onDestroy: function () {
                                onDestroy();
                            }
                        });
                    };
                    if(params.successUrl)
                    {
                        onDestroy = function () {
                            location.href = params.successUrl;
                        };
                    }
                }
                
                if(!params.successToast && params.successUrl)
                {
                    params.onSubmitSuccess = function () {
                        location.href = params.successUrl;
                    };
                }
                
                params = $.extend({
                    target: $(element)
                }, params);
                
                return new FormPlus(params);
            }
        });
        
        return FormPlus;
        
    }
);
