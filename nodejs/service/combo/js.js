//文件合并
var fileSystem = require("../base/filesystem.js");
var log = require("../base/log.js");

var config = require("../base/config.js");

var jsBasePath = "../static/js/";

var files = {};

var REG_EXP = {
    DEFINE_HEAD: /define\(/
};

function readFiles(packNameList) {
    
    log.out("merge js files", packNameList);
    
    var result = [];
    
    for(var i = 0, l = packNameList.length; i < l; ++ i)
    {
        result.push(readFile(packNameList[i]));
    }
    
    return result.join("");
};

function readFile(packName) {
    if(files.hasOwnProperty(packName) == false || config.getMode() == "dev")
    {
        log.out("process js file", packName);
        var packNameDetail = packName.split(":");
        var shimName = null;
        var name = null;
        
        if(packNameDetail.length == 1)
        {
            name = packNameDetail[0];
        }
        else
        {
            shimName = packNameDetail[0];
            name = packNameDetail[1];
        }
        
        var content = fileSystem.readFile(jsBasePath + name + ".js");
        
        if(shimName)
        {
            content += ";define(\"" + name + "\", function () {return " + shimName + ";});";
        }
        else
        {
            content = content.replace(REG_EXP.DEFINE_HEAD, "define(\"" + name + "\",");
        }
        files[packName] = content;
    }
    return files[packName];
};

exports.getMergedContent = function (pathList) {
    if(Object.prototype.toString.call(pathList).toLowerCase() == "[object array]")
    {
        return readFiles(pathList);
    }
    return "";
};