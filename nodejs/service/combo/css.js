//文件合并
var fileSystem = require("../base/filesystem.js");
var log = require("../base/log.js");

var cssBasePath = "../static/css/";

function readFiles(pathList) {
    
    log.out("merge css files", pathList);
    
    var result = [];
    
    for(var i = 0, l = pathList.length; i < l; ++ i)
    {
        result.push(fileSystem.readFile(cssBasePath + pathList[i] + ".css"));
    }
    
    return result.join("");
};

exports.getMergedContent = function (pathList) {
    if(Object.prototype.toString.call(pathList).toLowerCase() == "[object array]")
    {
        return readFiles(pathList);
    }
    return "";
};
