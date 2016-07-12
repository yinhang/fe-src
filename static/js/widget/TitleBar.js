define(
    [
        "base/Class",
        "widget/titlebar/fun/Empty",
        "lib/jQueryMobile",
        "widget/titlebar/fun/Title"
    ],
    function (Class, Empty, $, Title) {
        var TitleBar = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
                * @param options.title
                * @param options.leftFun
                * @param options.rightFun
                * @param options.className
             */
            function (options) {
                options = $.extend({
                    leftFun: new Empty(),
                    rightFun: new Empty(),
                    title: "",
                    className: ""
                }, options);
                
                this.dom = $("<div class='titlebar " + options.className + "'><div class='fun left'></div><div class='fun middle'></div><div class='fun right'></div></div>");
                this.setLeftFun(options.leftFun);
                this.setRightFun(options.rightFun);
                this.setTitle(options.title);
                options.target.append(this.dom);
            },
            {
                setMiddleFun: function (fun) {
                    this.dom.find("div.fun.middle").empty().append(fun.getDOM());
                },
                setTitle: function (title) {
                    this.setMiddleFun(new Title({
                        text: title
                    }));
                },
                setLeftFun: function (fun) {
                    this.dom.find("div.fun.left").empty().append(fun.getDOM());
                },
                setRightFun: function (fun) {
                    this.dom.find("div.fun.right").empty().append(fun.getDOM());
                }
            }
        );
        
        return TitleBar;
    }
);
