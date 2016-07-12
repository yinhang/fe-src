define(function () {
    var ImageUtil = {
        canvas: document.createElement("canvas"),
        scale: function (image, _scale) {
            var width = image.width * _scale;
            var height = image.height * _scale;
            
            image.width = width;
            image.height = height;
            
            var canvas = ImageUtil.canvas;
            var ctx = ImageUtil.ctx;
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.clearRect(0, 0, width, height);
            
            ctx.drawImage(image, 0, 0, width, height);
            
            return ImageUtil.canvas.toDataURL("image/jpeg");
        }
    };
    
    ImageUtil.ctx = ImageUtil.canvas.getContext("2d");
    
    return ImageUtil;
});
