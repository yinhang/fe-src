define(
    [
        "lib/jQuery",
        "base/Class"
    ],
    function ($, Class) {
        var CheckBox = Class.define(
            /**
             * @param options.checkbox
             */
            function (options) {
                this.checkbox = $(options.checkbox);
            },
            {
                unselect: function (checkbox) {
                    if($(checkbox).get(0).checked)
                    {
                        checkbox.trigger("click");
                    }
                },
                /**
                 * 
                     * @param options.selector
                 */
                control: function (options) {
                    var self = this;
                    self.controlSelector = options.selector;
                    self.checkbox.bind("click", function () {
                        self.send("change", self);
                        var $this = $(this);
                        if(this.checked)
                        {
                            $(self.controlSelector).each(function () {
                                this.checked = "checked";
                            });
                        }
                        else
                        {
                            $(self.controlSelector).removeAttr("checked");
                        }
                    });
                    $(self.controlSelector).on("click", function () {
                        self.send("change", self);
                        if(!this.checked)
                        {
                            self.checkbox.removeAttr("checked");
                            return;
                        }
                        var allChecked = true;
                        $(self.controlSelector).each(function () {
                            if(!this.checked)
                            {
                                allChecked = false;
                                return false;
                            }
                        });
                        if(allChecked)
                        {
                            self.checkbox.get(0).checked = "checked";
                        }
                        else
                        {
                            self.checkbox.removeAttr("checked");
                        }
                    });
                    
                }
            }
        );
        
        return CheckBox;
    }
);
