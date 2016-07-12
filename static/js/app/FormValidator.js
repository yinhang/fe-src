define(
    [
        "lib/jQuery",
        "util/FormValidator"
    ],
    function ($, Core) {
        
        function error(dom, errMsg) {
            require(
                [
                    "widget/Toast"
                ],
                function (Toast) {
                    new Toast({
                        text: errMsg
                    });
                }
            );
        };

        function pass(dom) {
            
        };

        function clean(dom) {
            
        };

        function passAll(form) {

        };

        Core.onValidated = function (data) {
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
                            Core.showErrorTip({
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
        
        Core.onBeforeFieldValidate = function (data) {
            
        };
        
        /**
         * @param options.dom
         * @param options.msg
         */
        Core.showErrorTip = function (options) {
            error(options.dom, options.msg);
        };
        
        /**
         * @param options.dom
         */
        Core.pass = function (options) {
            pass(options.dom);
        };
        
        Core.prototype.clearAllErrorTip = function () {
        };
        

        return Core;
    }
);
