define(
    [
        "lib/jQuery",
        "vendor/umeditor/lang/zh-cn/zh-cn",
        "util/ResLoader",
        "util/FunctionalMarker"
    ],
    function ($, Core, ResLoader, FunctionalMarker) {

        ResLoader.loadCSS(__uri("/static/css/vendor/umeditor/themes/default/css/ueditor.css"));
        
        var editorCount = 0;
        
        function initEditor(target) {
            var target = $(target);
            var id = target.attr("id");
            if(id == undefined || id == null || id.length <= 0)
            {
                id = "umeditor_" + (new Date()).getTime() + "_" + ( ++ editorCount );
            }
            target.attr("id", id);
            return UE.getEditor(id);
        };

        FunctionalMarker.regist({
            packageName: "vendor/UMEditor",
            init: function (element, params) {
             return initEditor($(element));
             }
        });

        return {
            /**
             * 
                * @param {Object} options
                * @param options.target
             */
            init: function (options) {
                return initEditor(options.target);
            }
        };

    }
);
