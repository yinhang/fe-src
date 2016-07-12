(function () {
    fis.set("project.fileType.text", "jst,jade");
    
    fis.match("**.jst", {
        useHash: false,
        useMap: false,
        isHtmlLike: true
    });
    
    fis.match("**.js", {
        useHash: false,
        useMap: false
    });
    
    fis.match("::image", {
        useHash: true,
        useMap: false
    });
    
    fis.match("**.css", {
        useHash: true,
        useMap: true
    });
    
    fis.match("/module/**.css", {
        useHash: false
    });
    
    fis.match("/jade/page/**.css", {
        useHash: false
    });
    
    fis.match("/module/**static/**.css", {
        useHash: true
    });

    fis.match("/static/vendor/umeditor/**", {
        useHash: false
    });
    
    fis.match("/static/js/app/boot/**/require.js", {
        useHash: true,
        useMap: false
    });
    
    fis.match("**.jade", {
        isHtmlLike: true,
        userHash: false,
        userMap: false
        
    });
    
    fis.match("!{/static/**,/module/**,/nodejs/**,/jade/**}", {
        release: false
    });
    
    fis.match("/jade/(**.jade)", {
        release: "/server/views/$1"
    });
    
    fis.match("/nodejs/(**)", {
        release: "/fe_nodejs_service/$1"
    });
    
    fis.match("/module/(**)", {
        release: "/module/$1"
    });
    
    fis.match("/module/(**.jade)", {
        release: "/server/views/module/$1"
    });
    
    fis.match("/module/(**.css)", {
        release: "/static/css/module_main/$1"
    });
    
    fis.match("/jade/page/(**.css)", {
        release: "/static/css/page_main/$1"
    });
    
    fis.match("/module/(**)/static/(*)/(**)", {
        release: "/static/$2/module/$1/$3"
    });
    
    fis.match("**", {
        deploy: fis.plugin("local-deliver", {
            to: "../"
        })
    });
    
    //fis.match("::image", {
   //     domain: "/"
   // });
    
    fis.match("**", {
        deploy: [
            fis.plugin("replace", {
                from: "__hostname",
                to: "location.hostname"
            }),
            fis.plugin("replace", {
                from: "__port",
                to: "\":8911\""
            }),
            fis.plugin("local-deliver", {
                to: "../"
            })
        ]
    });
    
    fis.media("product").match("**", {
        deploy: [
            fis.plugin("replace", {
                from: "__hostname",
                to: "\"static.hunwanjia.com\""
            }),
            fis.plugin("replace", {
                from: "__port",
                to: "\"\""
            }),
            fis.plugin("local-deliver", {
                to: "../"
            })
        ]
    });
    
    fis.media("product").match("**.js", {
        optimizer: fis.plugin("uglify-js")
    });
    
    fis.media("product").match("**.css", {
        optimizer: fis.plugin("clean-css")
    });
    
})();
