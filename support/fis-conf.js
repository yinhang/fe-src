(function () {
    fis.set("project.fileType.text", "jst,vm");
    
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
    
    fis.match("**.vm", {
        isHtmlLike: true,
        userHash: false,
        userMap: false
    });
    
    fis.match("!{/static/**,/module/**,/nodejs/**,/vm/**}", {
        release: false
    });
    
    fis.match("/vm/(**)", {
        release: "/WEB-INF/vm/$1"
    });
    
    fis.match("/nodejs/(**)", {
        release: "/WEB-INF/nodejs/$1"
    });
    
    fis.match("/module/(**)", {
        release: "/WEB-INF/module/$1"
    });
    
    fis.match("/module/(**.vm)", {
        release: "/WEB-INF/vm/module/$1"
    });
    
    fis.match("/module/(**.css)", {
        release: "/static/css/module_main/$1"
    });
    
    fis.match("/module/(**)/static/(*)/(**)", {
        release: "/static/$2/module/$1/$3"
    });
    
    fis.match("**", {
        deploy: fis.plugin("local-deliver", {
            to: "../../"
        })
    });
    
    fis.match("::image", {
        domain: "http://hunwanjia.com"
    });
    
    fis.media("product").match("**.js", {
        optimizer: fis.plugin("uglify-js")
    });
    
    fis.media("product").match("**.css", {
        optimizer: fis.plugin("clean-css")
    });
    
    fis.media("product").match("**", {
        deploy: [
            fis.plugin("replace", {
                from: "http://127.0.0.1:8911",
                to: "http://static.hunwanjia.com"
            }),
            fis.plugin("local-deliver", {
                to: "../../"
            })
        ]
    });
    
})();
