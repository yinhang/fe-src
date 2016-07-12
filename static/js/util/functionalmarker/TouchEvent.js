define(
    [
        "lib/jQuery",
        "util/FunctionalMarker"
    ],
    function ($, FunctionalMarker) {
    
        FunctionalMarker.regist({
            packageName: "util/functionalmarker/TouchEvent",
            init: function (element, params) {
                
            }
        });
        
        $("tap", "[data-ontap]", function () {
            eval("(" + this.getAttribute("data-ontap") + ")");
        });
    }
);