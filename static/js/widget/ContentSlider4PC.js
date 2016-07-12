define(
    [
        "lib/jQuery",
        "base/Class",
        "Runner"
    ],
    function ($, Class, Runner) {
        var ContentSlider = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
             */
            function (options) {
                var self = this;
                self.target = $(options.target);
                self.list = $(options.target).find("li.case");
                
                if(self.list.size() > 1)
                {
                
                    var prevButton = $("<a href='javascript: void(0);' class='page-button prev'></a>");
                    var nextButton = $("<a href='javascript: void(0);' class='page-button next'></a>");
                    
                    self.target.append(prevButton);
                    self.target.append(nextButton);
                    
                    prevButton.bind("click", function () {
                        self.runner.pause();
                        self.prev();
                    });
                    nextButton.bind("click", function () {
                        self.runner.pause();
                        self.next(); 
                    });
                    
                    self.runner = new Runner(function () {
                        self.next();
                    }, 0.2);
                    
                    self.runner.start();
                }
                else
                {
                    self.next();
                }
            },
            {
                /**
                 * 
                    * @param {Object} options
                 */
                next: function () {
                    var self = this;
                    var cur = self.list.filter(".show");
                    if(cur.size() <= 0)
                    {
                        self.list.first().addClass("show");
                        return;
                    }
                    cur.removeClass("show");
                    
                    var next = cur.next();
                    if(next.size() <= 0)
                    {
                        next = self.list.first();
                    }
                    next.addClass("show");
                },
                /**
                 * 
                    * @param {Object} options
                 */
                prev: function () {
                    var self = this;
                    var cur = self.list.filter(".show");
                    if(cur.size() <= 0)
                    {
                        self.list.first().addClass("show");
                        return;
                    }
                    cur.removeClass("show");
                    
                    var prev = cur.prev();
                    if(prev.size() <= 0)
                    {
                        prev = self.list.last();
                    }
                    prev.addClass("show");
                }
            }
        );
        
        return ContentSlider;
    }
);
