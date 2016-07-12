define(
    [
        "base/Class"
    ],
    function (Class) {
        var Runner = Class.define(
            function (runner, fre) {
                var self = this;
                self.fre = fre;
                self.startTime;
                if(self.fre <= 0)
                    self.fre = 1;
                self.defaultDelay = 1000 / self.fre;
                self.running = false;
                self._runner = runner;
                self.runner = function () {
                   if(self.running == true)
                   {
                       self._runner();
                       var startTime = (new Date()).getTime();
                       var nextDelay = self.defaultDelay - (new Date()).getTime() + startTime;
                       setTimeout(self.runner, nextDelay <= 0 ? 0 : nextDelay);
                   }
                };
            },
            {
                isRunning: function () {
                    return this.running;
                },
                start: function () {
                    var self = this;
                    if(self.running == false)
                    {
                        self.running = true;
                        self.startTime = ( new Date() ).getTime();
                        self._runner();
                        setTimeout(self.runner, self.defaultDelay);
                    }
                },
                pause: function () {
                    this.running = false;
                }
            }
        );
        return Runner;
    }
);
