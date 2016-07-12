define(
    [
        "lib/jQuery",
        "util/Form",
        "util/FormValidator",
        "base/Class"
    ],
    function ($, Form, FormValidator, Class) {
        
        var FormPlus = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
                * @param options.onValidatePass
                * @param options.onValidateNotPass
                * @param options.onValidateComplete
                * @param options.onSubmitSuccess
                * @param options.onSubmitError
                * @param options.onSubmitComplete
                * @param options.onBeforeSubmit
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    onValidatePass: function () {
                        
                    },
                    onValidateNotPass: function () {
                        
                    },
                    onValidateComplete: function () {
                        
                    },
                    onSubmitSuccess: function () {
                        
                    },
                    onSubmitError: function () {
                        
                    },
                    onSubmitComplete: function () {
                        
                    },
                    onBeforeSubmit: function () {
                        
                    }
                }, options);
                
                self.options = options;
                
                this.formValidator = new FormPlus.FormValidator({
                    form: options.target
                });
                
                this.formUtil = new FormPlus.Form({
                    form: options.target,
                    disableAutoAjaxSubmit: true,
                    submitLocker: true,
                    submitLockerUnlockOn: ["error", "complete"],
                    success: function () {
                        options.onSubmitSuccess(self);
                    },
                    error: function () {
                        options.onSubmitError(self);
                    },
                    complete: function () {
                        options.onSubmitComplete(self);
                    }
                });
                
                options.target.bind("submit", function () {
                    self.formValidator.validate({
                        pass: function () {
                            if(self.options.onValidatePass(self) != false)
                            {
                                self.formUtil.ajaxSubmit();
                            }
                        },
                        notPass: function () {
                            self.options.onValidateNotPass(self);
                        },
                        validated: function () {
                            self.options.onValidateComplete(self);
                        }
                    });
                });
            },
            {
                getForm: function () {
                    return this.options.target;
                }
            }
        );
        
        FormPlus.FormValidator = FormValidator;
        FormPlus.Form = Form;
        
        return FormPlus;
        
    }
);
