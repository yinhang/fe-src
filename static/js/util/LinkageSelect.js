define(
    [
        "lib/jQuery"
    ],
    function ($) {

        var LinkageSelect = {
            /**
             *
             * @param options
             * @option select1
             * @option select2
             * @option filler
             *          [
             *              {
             *                  text: "text",
             *                  value: 1,
             *                  selected: true
             *              }
             *          ]
             */
            link: function (options) {
                //设置默认值
                var options = $.extend({
                    dataMap: {},
                    select1DefVal: null,
                    select2DefVal: null
                }, options);
                //添加&预处理参数
                $.extend(options, {
                    select1: $(options.select1),
                    select2: $(options.select2)
                });
                //把控制方法记录到控制select中，原因：1，用来控制。2，用来标示此select为控制select。
                options.select1.data("controlFunction", function (data) {
                    options.filler(options.select1.val(), function (data) {
                        var html = [];
                        var listLen = data.length;
                        if(listLen <= 0 || !data)
                        {
                            options.select2.hide();
                        }
                        else
                        {
                            options.select2.show();
                        }
                        for(var i = 0; i < listLen; ++ i)
                        {
                            var optionData = data[i];
                            html.push("<option " + (optionData.selected == true ? "selected='selected'" : "") + " value='" + optionData.value + "'>" + optionData.text + "</option>");
                        }
                        options.select2.html(html.join(""));
                        //如果被控制select也同时为控制select，触发change以控制。
                        if(options.select2.data("controlFunction"))
                        {
                            options.select2.trigger("change");
                        }
                    });
                });
                options.select1.bind("change", function () {
                    ($(this).data("controlFunction"))();
                }).trigger("change");
            }
        };

        return LinkageSelect;
    }
);
