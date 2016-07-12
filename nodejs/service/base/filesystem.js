var fs = require("fs");
var log = require("./log.js");

var config = require("./config.js");

var files = {};

exports.readFile = function (path) {
    if(files.hasOwnProperty(path) == false || config.getMode() == "dev")
    {
        var content = "";
        if(fs.existsSync(path))
        {
            try {
                log.out("read file from disk", path);
                content = fs.readFileSync(path, "utf-8");
            } catch(e)
            {
                console.log(e);
            }
        }
        files[path] = content;
    }
    return files[path];
};
