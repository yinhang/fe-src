var comboCSS = require("../combo/css.js");
var comboJS = require("../combo/js.js");

function toArray(value) {
    if(Object.prototype.toString.call(value).toLowerCase() != "[object array]")
    {
        return [value];
    }
    else
    {
        return value;
    }
};

exports.action = function (name, params) {
    switch(name)
    {
        case "/combo.js":
            return {
                content: comboJS.getMergedContent(params.hasOwnProperty("p") ? toArray(params.p) : null),
                type: "application/javascript"
            };
        case "/combo.css":
            return {
                content: comboCSS.getMergedContent(params.hasOwnProperty("f") ? toArray(params.f) : null),
                type: "text/css"
            };
    }
    return "";
};
