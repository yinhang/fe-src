define({
    load: function (name, _require, onload, config) {
        _require(
            [
                "base/TemplateEngine"
            ],
            function (TemplateEngine) {
                TemplateEngine.getTemplate({
                    cacheid: name,
                    complete: function (template) {
                        onload(template);
                    }
                });
            }
        );
    }    
});
