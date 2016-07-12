define({
    load: function (name, _require, onload, config) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = name;
        script.onload = onload;
        document.head.appendChild(script);
    }    
});
