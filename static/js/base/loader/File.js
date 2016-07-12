define({
    load: function (name, _require, onload, config) {
        
        _require(
            [
                "lib/jQuery",
                "base/Global"
            ],
            function ($, Global) {
                $.ajax({
                    url: name + "?=v" + Global.version,
                    dataType: "text",
                    type: "get",
                    success: function (data) {
                        onload(data);
                    }
                });
            }
        );
        
    }    
});
