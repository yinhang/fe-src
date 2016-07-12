(function () {
    __inline("/static/js/app/boot/main/version.js");
    
    window.GLOBAL.version = version;
    
    // requirejs.onError = function (e) {
        // if(e.requireType == "timeout")
        // {
            // location.reload();
        // }
    // };
    
   if(navigator.userAgent.indexOf("Firefox") != -1)
   {
       window.CONFIG.TAP_EVENTNAME = "click";
   }
   
    var shim = __inline("/static/js/app/inline/shim.js");
    
    require.config({
        baseUrl: window.CONFIG.PATH_NAME + "/static/js",
        
        comboSpecified: {},
        
        urlArgs: "v=" + window.GLOBAL.version,
    
        paths: {
            "loadfile": "base/loader/File",
            "loadjst": "base/loader/Template",
            "loadjs": "base/loader/JavaScript",
            "loadcombojs": "app/ComboJSLoader"
        },
        
        shim: shim
    });
    
    __inline("/static/js/app/inline/combjs_require_wrap.js");
    
    //start 从这里开始
    //打包
    
    require(
        [
            "lib/jQuery",
            "util/FunctionalMarker",
            "Browser",
            "Runner",
            "app/main/PageTitleBar",
            "vendor/qiniu"
        ], 
        function ($, FunctionalMarker, Browser, Runner, PageTitleBar, Qiniu) {
            $(function () {
                Browser.addDetectClass();
                PageTitleBar.init();
                
                (new Runner(function () {
                    FunctionalMarker.scan();
                }, 2)).start();
            });
            
        }
    );
   
})();
