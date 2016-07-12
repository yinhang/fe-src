//http服务
var http = require("http");
var net = require("net");
var url = require("url");
var zlib = require("zlib");
var queryString = require("querystring");

var process = require("process");

var config = require("./service/base/config.js");

config.setMode(process.argv.length >= 3 ? process.argv[2].replace(/^\-/, "") : "product");

var httpGetCache = {};

var dispatcher = require("./service/base/dispatcher.js");

var version = (new Date()).getTime();

var modDate = new Date();
modDate.setTime(version * 1000);
var modDateStr = modDate.toUTCString();

var proxy = http.createServer(function(req, res) {
    
    if((req.headers["if-none-match"] == version || req.headers["if-modified-since"] == modDateStr) && config.getMode() != "dev"){
        res.writeHead(304);
        res.end();
        return;
    }
    
    var retValue = null;
    
    if(httpGetCache.hasOwnProperty(req.url) == false || config.getMode() == "dev")
    {
        var urlObj = url.parse(req.url);
        retValue = dispatcher.action(urlObj.pathname, queryString.parse(urlObj.query), true);
        try {
            retValue.content = zlib.gzipSync(retValue.content);
        } catch (e) {
            res.end();
        }
        httpGetCache[req.url] = retValue;
    }
    else
    {
        retValue = httpGetCache[req.url];
    }
    
    if(retValue.hasOwnProperty("type") == false)
    {
        retValue.type = "text/plain";
    }
    
    res.writeHead(200, {
        "Content-Type": retValue.type + ";charset=UTF-8",
        "Content-Encoding": "gzip",
        "Server": "hwjfe",
        "Etag": version,
        "Last-Modified": modDateStr
    });
    
    res.end(retValue.content);
    
});

proxy.listen(8911, "0.0.0.0", function() {
    
}); 
