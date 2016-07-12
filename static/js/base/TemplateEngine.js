define(
    [
        "base/template/Engine",
        "lib/jQuery",
        "base/Global",
        "Config"
    ],
    function (Engine, $, Global, Config) {
        Engine.setLoader({
            loader: function (name, complete) {
                $.ajax({
                    url: Config.PATH_NAME + "/static/template/" + name + "?=v" + Global.version,
                    dataType: "text",
                    type: "get",
                    success: function (data) {
                        data ="<%:cacheid=" + name + "%>\n" + data;
                        complete(data);
                    }
                });
            }   
        });
        
        return Engine;
    }
);
