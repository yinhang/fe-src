// define(
    // [
        // "base/Class",
        // "vendor/Page"
    // ],
    // function (Class, Page) {
        // var Route = Class.define(
            // function () {
                // var self = this;
                // Page(function (context) {
                    // self.send("to", context);
                // });
            // },
            // {
                // now: function () {
                    // Page.stop();
                    // Page.start();
                // },
                // to: function (name) {
                    // Page(name);
                // }
            // }
        // );
//         
        // return new Route();
    // }
// );

define(
    [
        "base/Class"
    ],
    function (Class) {
        var Route = Class.define(
            function () {
            },
            {
                now: function () {
                    this.send("to", {
                        canonicalPath: "",
                        path: "",
                        title: document.title,
                        state: {
                            path: ""
                        },
                        querystring: location.search.replace(/^\?/, ""),
                        pathname: location.pathname,
                        params: "",
                        hash: "",
                        init: true
                    });
                },
                to: function (name) {
                    location.href = name;
                }
            }
        );
        
        return new Route();
    }
);

