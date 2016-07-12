define(
    function () {
        return {
            makeUpZero: function (number, digits) {
                var numberStr = number + "";
                var diff = digits - numberStr.length;
                if(diff > 0)
                {
                    for(var i = 0; i < diff; ++ i)
                    {
                        numberStr = "0" + numberStr;
                    }
                }
                return numberStr;
            }
        };
    }
);
