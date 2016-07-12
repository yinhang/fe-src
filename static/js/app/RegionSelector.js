define(
    [
        "lib/jQuery",
        "base/Class",
        "app/XHR",
        "util/LinkageSelect"
    ],
    function ($, Class, XHR, LinkageSelect) {
        
        function buildOptionsHTML(metaData, selected) {
            var html = "";
            for(var i = 0, l = metaData.length; i < l; ++ i)
            {
                var optionData = metaData[i];
                html += "<option value='" + optionData.code + "' " + ( selected == optionData.code ? " selected ": "" ) + ">" + optionData.name + "</option>";
            }  
            
            return html;
        };
        
        function covToLinkageListData(list, selected) {
            var optionsData = [];

            for(var i = 0, l = list.length; i < l; ++ i)
            {
                var item = list[i];
                optionsData.push({
                    text: item.name,
                    value: item.code,
                    selected: selected == item.code ? true: false
                });
            }
            
            return optionsData;
        };
        
        var RegionSelector = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
                * @param options.provinceName
                * @param options.cityName
                * @param options.regionName
                * @param options.onChange
                * @param options.onLoad
                * @param options.selected {
                *     provinceCode: "01",
                *     cityCode: "01",
                *     regionCode: "01"
                * }
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    provinceName: "province",
                    cityName: "city",
                    regionName: "region",
                    selected: {
                        provinceCode: null,
                        cityCode: null,
                        regionCode: null
                    },
                    onChange: function (data) {
                        
                    },
                    onLoad: function () {
                        
                    }
                }, options);
                
                self.listen("change", function (data) {
                    options.onChange(data);
                });
                
                self.provinceSelector = $("<select class='province selector' name='" + options.provinceName + "'></select>");
//                self.citySelector = $("<select class='city selector' name='" + options.cityName + "'></select>");
//                self.regionSelector = $("<select class='region selector' name='" + options.regionName + "'></select>");
               
//                self.provinceSelector = $("<div class='region-container'><select class='province selector' name='" + options.provinceName + "'></select><div class='drop-arrow'></div></div>");
                self.citySelector = $("<select class='city selector' name='" + options.cityName + "'></select>");
                self.regionSelector = $("<select class='region selector' name='" + options.regionName + "'></select>");
               
                XHR.request({
                    url: "/metadataMgr/getProvinceList.do",
                    memcache: "page",
                    success: function (data) {
                        
                        self.provinceSelector.append(buildOptionsHTML(data.data.list, options.selected.provinceCode));
                        options.target.append(self.provinceSelector);
                        options.target.append(self.citySelector);
                        options.target.append(self.regionSelector);
                        
                        LinkageSelect.link({
                            select1: self.provinceSelector,
                            select2: self.citySelector,
                            filler: function (code, complete) {
                                XHR.request({
                                    url: "/metadataMgr/getCityList.do",
                                    memcache: "page",
                                    data: {
                                        code: code
                                    },
                                    success: function (data) {
                                        complete(covToLinkageListData(data.data.list, options.selected.cityCode));
                                    }
                                });
                            }
                        });
                        
                        LinkageSelect.link({
                            select1: self.citySelector,
                            select2: self.regionSelector,
                            filler: function (code, complete) {
                                XHR.request({
                                    url: "/metadataMgr/getRegionList.do",
                                    memcache: "page",
                                    data: {
                                        code: code
                                    },
                                    success: function (data) {
                                        var list = [];
                                        list.push({
                                            name:"请选择区",
                                            value:'moren',
                                            code:''
                                        });
                                        $.merge(list,data.data.list);
                                        complete(covToLinkageListData(list, options.selected.regionCode));
                                        options.onLoad();
                                    }
                                });
                            }
                        });
                    }
                });
                
            },
            {
            }
        );
        
        return RegionSelector;
    }
);
