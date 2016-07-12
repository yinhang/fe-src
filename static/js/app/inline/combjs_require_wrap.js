var _requireLoad = requirejs.load;

requirejs.load = function (ctx, name) {
    if(ctx.config.comboSpecified[name])
    {
        return;
    }
    return _requireLoad.apply(window, arguments);
};

function getType(o) {
    return Object.prototype.toString.call(o).toLowerCase();
};

var _define = define;

define = function () {
    var newArguments = [];
    var comboWrapped = false;
    
    for(var i = 0, l = arguments.length; i < l; ++ i)
    {
        var arg = arguments[i];
        switch(i)
        {
            case 0:
                switch(getType(arg))
                {
                    case "[object array]":
                        newArguments.push(["loadcombojs!" + arg.join(",")]);
                        comboWrapped = true;
                        break;
                    default:
                        newArguments.push(arg);
                        break;
                }
                break;
            case 1:
                switch(getType(arg))
                {
                    case "[object array]":
                        newArguments.push(["loadcombojs!" + arg.join(",")]);
                        comboWrapped = true;
                        break;
                    case "[object function]":
                        if(comboWrapped)
                        {
                            newArguments.push((function (_arg) {
                                return function (combo) {
                                    return _arg.apply(this, combo);
                                };
                            })(arg));
                        }
                        else
                        {
                            newArguments.push(arg);
                        }
                        break;
                    default:
                        newArguments.push(arg);
                        break;
                }
                break;
            case 2:
                switch(getType(arg))
                {
                    case "[object function]":
                        if(comboWrapped)
                        {
                            newArguments.push((function (_arg) {
                                return function (combo) {
                                    return _arg.apply(this, combo);
                                };
                            })(arg));
                        }
                        else
                        {
                            newArguments.push(arg);
                        }
                        break;
                    default:
                        newArguments.push(arg);
                        break;
                }
                break;
            default:
                newArguments.push(arg);
        }
    }
    
    return _define.apply(window, newArguments);
    
};



var _require = require;

require = function () {
    var newArguments = [];
    var comboWrapped = false;
    
    for(var i = 0, l = arguments.length; i < l; ++ i)
    {
        var arg = arguments[i];
        switch(i)
        {
            case 0:
                switch(getType(arg))
                {
                    case "[object array]":
                        newArguments.push(["loadcombojs!" + arg.join(",")]);
                        comboWrapped = true;
                        break;
                    default:
                        newArguments.push(arg);
                        break;
                }
                break;
            case 1:
                switch(getType(arg))
                {
                    case "[object function]":
                        if(comboWrapped)
                        {
                            newArguments.push((function (_arg) {
                                return function (combo) {
                                    return _arg.apply(this, combo);
                                };
                            })(arg));
                        }
                        else
                        {
                            newArguments.push(arg);
                        }
                        break;
                    default:
                        newArguments.push(arg);
                        break;
                }
                break;
            default:
                newArguments.push(arg);
        }
    }
    
    return _require.apply(window, newArguments);
    
};