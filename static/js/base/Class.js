define(function () {
    var OBJ_COUNT = 0;
    var CLASS_COUNT = 0;
    var CLASS_INFO = {
        
    };
    
    var CLASS_INFO_NAME = {
        "SRC_CON_CHAIN": 0,
        "SRC_FUN_LIST_CHAIN": 1,
        "SUPER_CLASS": 2
    };
    
    var NOTENUM_PROPERTY = {
        "hasOwnProperty": true,
        "valueOf": true,
        "isPrototypeOf": true,
        "propertyIsEnumerable": true,
        "toLocaleString": true,
        "toString": true,
        "constructor": true
    };
    
    function eachObject(obj, iter) {
        obj.hasOwnProperty("hasOwnProperty") && iter("hasOwnProperty", obj["hasOwnProperty"]);
        obj.hasOwnProperty("valueOf") && iter("valueOf", obj["valueOf"]);
        obj.hasOwnProperty("isPrototypeOf") && iter("isPrototypeOf", obj["isPrototypeOf"]);
        obj.hasOwnProperty("propertyIsEnumerable") && iter("propertyIsEnumerable", obj["propertyIsEnumerable"]);
        obj.hasOwnProperty("toLocaleString") && iter("toLocaleString", obj["toLocaleString"]);
        obj.hasOwnProperty("toString") && iter("toString", obj["toString"]);
        obj.hasOwnProperty("constructor") && iter("constructor", obj["constructor"]);
        for(var name in obj)
        {
            if(NOTENUM_PROPERTY[name])
                continue;
            iter(name, obj[name]);
        }
    };
    
    var ClassManager = {
        ready: function (_con, pros, superClass) {
            //生成构造函数
            var klass = null;
            if(superClass)
            {
                klass = function () {
                    this["#id"] = "#o" + ( ++ OBJ_COUNT );
                    this["#chain_deep"] = 0;
                    ClassManager.genSuper(this);
                    _con.apply(this, arguments);
                };
            }
            else
            {
                klass = function () {
                    this["#id"] = "#o" + ( ++ OBJ_COUNT );
                    this["#chain_deep"] = 0;
                    _con.apply(this, arguments);
                };
            }
            //添加class id
            var id = klass["#id"] = "#c" + ( ++ CLASS_COUNT );
            var info = CLASS_INFO[id] = {};
            ClassManager.setSrcInfo(id, "SUPER_CLASS", superClass);
            //un定义的类和对象方法
            klass.toString = function () {
                return id;
            };
            pros.getClass = function () {
                return klass;
            };
            klass.is = pros.is = function (_superClass) {
                var curSuperClass = klass;
                do {
                    if(curSuperClass === _superClass)
                        return true;
                    curSuperClass = ClassManager.getSrcInfo(curSuperClass, "SUPER_CLASS");
                } while(curSuperClass)
                return false;
            };
            //添加祖先构造器链&方法链
            if(superClass)
            {
                //添加祖先构造器
                var superSrcConChain = ClassManager.getSrcInfo(superClass, "SRC_CON_CHAIN");
                for(var i = 0, l = superSrcConChain.length; i < l; ++ i)
                {
                    ClassManager.addSrcCon(klass, superSrcConChain[i]);
                }
                //添加当代方法链
                var superSrcFunChain = ClassManager.getSrcInfo(superClass, "SRC_FUN_LIST_CHAIN");
                eachObject(superSrcFunChain, function (name, value) {
                    var chain = superSrcFunChain[name];
                    //记录下当代未延续的方法，在genPrototype中做特殊处理
                    if((name in pros) == false)
                        pros[name] = undefined;
                    for(var i = 0, l = chain.length; i < l; ++ i)
                    {
                        ClassManager.addSrcFun(klass, name, chain[i]);
                    }
                });
            }
            //添加当代构造器
            ClassManager.addSrcCon(klass, _con);
            //添加当代function chain
            eachObject(pros, function (name, value) {
                ClassManager.addSrcFun(klass, name, value);
            });
            //生成prototype
            ClassManager.genPrototype(klass);
            return klass;
        },
        genSuper: function (obj) {
            var klass = obj.getClass();
            function _super () {
                        
                var fun = ClassManager.getSrcConChain(klass, ++ obj["#chain_deep"]);
                var ret = fun.apply(obj, arguments);
                -- obj["#chain_deep"];
                return ret;
            };
            var funListChain = ClassManager.getSrcInfo(klass, "SRC_FUN_LIST_CHAIN");
            eachObject(funListChain, function (name, value) {
                _super[name] = (function (_name) {
                    return function () {
                        var nf = (ClassManager.getSrcFun(klass, _name, ++ obj["#chain_deep"]));
                        obj["#chain_deep"] += nf.o;
                        var ret = nf.f.apply(obj, arguments);
                        obj["#chain_deep"] -= nf.o + 1;
                        return ret;
                    };
                })(name);
            });
            obj._super = _super;
        },
        genPrototype: function (klass) {
            var listChain = ClassManager.getSrcInfo(klass, "SRC_FUN_LIST_CHAIN");
            eachObject(listChain, function (name, value) {
                //始终调用最新的function
                var chain = listChain[name];
                klass.prototype[name] = (function (_name) {
                    return function () {
                        var nf = (ClassManager.getNewestFunctionOnChain(klass, _name));
                        var lastChainDeep = this["#chain_deep"];
                        this["#chain_deep"] = nf.o;
                        var ret = nf.f.apply(this, arguments);
                        //恢复深度
                        this["#chain_deep"] = lastChainDeep;
                        return ret;
                    };
                })(name);
            });
        },
        getSrcFun: function (klass, name, deep) {
            var listChain = ClassManager.getSrcInfo(klass, "SRC_FUN_LIST_CHAIN");
            var chain = listChain[name];
            var index = chain.length - 1 - deep;
            var fun = chain[index];
            var deepOffset = 0;
            while(fun === undefined) 
            {
                ++ deepOffset;
                index -= 1;
                if(index < 0)
                    un.throwError("un.sys.Class: this._super[\"" + name + "\"] 不存在。");
                fun = chain[index];
            }
            return {
                f: fun,
                o: deepOffset
            };
        },
        getSrcConChain: function (klass, deep) {
            var conChain = ClassManager.getSrcInfo(klass, "SRC_CON_CHAIN");
            return conChain[conChain.length - 1 - deep];
        },
        addSrcCon: function (klass, con) {
            var conChain = ClassManager.getSrcInfo(klass, "SRC_CON_CHAIN") || [];
            conChain.push(con);
            ClassManager.setSrcInfo(klass, "SRC_CON_CHAIN", conChain);
        },
        getNewestFunctionOnChain: function (klass, name) {
            var listChain = ClassManager.getSrcInfo(klass, "SRC_FUN_LIST_CHAIN");
            var chain = listChain[name];
            var deepOffset = 0; 
            for(var i = chain.length - 1; i >= 0; -- i)
            {
                var fun = chain[i];
                if(fun === undefined)
                {
                    ++ deepOffset; 
                    continue;
                }
                return {
                    f: fun,
                    o: deepOffset
                };
            }
        },
        getSrcInfoMap: function (klass) {
            return CLASS_INFO[klass];
        },
        addSrcFun: function (klass, name, fun) {
            var funList = ClassManager.getSrcInfo(klass, "SRC_FUN_LIST_CHAIN") || {};
            if(funList.hasOwnProperty(name))
            {
                funList[name].push(fun);
            }
            else
            {
                funList[name] = [fun];
            }
            ClassManager.setSrcInfo(klass, "SRC_FUN_LIST_CHAIN", funList);
        },
        getSrcInfo: function (klass, name) {
            return (ClassManager.getSrcInfoMap(klass))[CLASS_INFO_NAME[name]];
        },
        setSrcInfo: function (klass, name, value) {
            (ClassManager.getSrcInfoMap(klass))[CLASS_INFO_NAME[name]] = value;
        },
        manageClass: function (con, pros) {
            ClassManager.convAndSaveSrcInfo(con, pros);
        }
    };
    
    var eventRegistList = {};
    
    //UNObject Class define
    var UNObject = ClassManager.ready(
        function () {
        
        }, 
        {
            toString: function () {
                return this["#id"];
            },
            send: function (name, data) {
                eventRegistList[this] = eventRegistList[this] || {};
                var callbackList = eventRegistList[this][name]; 
                if(callbackList)
                {
                    //这里不能缓存callbackList.length,因为此值可能在循环的过程中变化(在事件回调中remove一个listener)。
                    for(var i = 0; i < callbackList.length; ++ i)
                    {
                        if(callbackList[i](data) === false)
                            return false;
                    }
                }
                return true;
            },
            listen: function (name, callback) {
                eventRegistList[this] = eventRegistList[this] || {};
                eventRegistList[this][name] = eventRegistList[this][name] || [];
                eventRegistList[this][name].push(callback);
            },
            removeListener: function (name, listener) {
                eventRegistList[this] = eventRegistList[this] || {};
                var callbackList = eventRegistList[this][name]; 
                if(callbackList)
                {
                    if(listener)
                    {
                        for(var i = callbackList.length - 1; i >= 0; -- i)
                        {
                            if(callbackList[i] === listener)
                            {
                                callbackList.splice(i, 1);
                                return;
                            }
                        } 
                    }
                    else
                    {
                        eventRegistList[this][name] = [];
                    }
                }
            }
        }
    );
    
    var Class = {
        define: function (con, pros, superClass) {
            var klass;
            if(superClass)
                klass = ClassManager.ready(con, pros, superClass);
            else
            {
                klass = ClassManager.ready(con, pros, UNObject);
            }
            return klass;
        }
    };
    
    return Class;
});
