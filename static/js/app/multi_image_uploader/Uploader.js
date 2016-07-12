define(
    [
        "lib/jQuery",
        "vendor/qiniu",
        "app/XHR",
        "loadjst!app/multi_image_uploader/uploader.jst",
        "base/Class",
        "widget/Toast",
        "widget/modal/dialog/Alert",
        "Browser",
        "Config"
    ],
    function ($, Qiniu, XHR, UploaderJST, Class, Toast, Alert, Browser, Config) {
        
        var fileKey = {};
        
        var fileState = {
            
        };
        
        var alertShow = false;
        
        var Uploader = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
                * @param name
                * @param defPath
                * @param onUploadSuccess
                * @param onUploadStart
                * @param onProgress
                * @param onUploadFail
                * @param onUploadComplete
                * @param onExtraFile
                * @param onBeforeUpload
                * @param onClick
                * @param onRemoveFile
                * @param multiSelected
                * @param file
                * @param exDataSelector [
                *   {
                *       name: "风格",
                *       items: [
                *           {
                *               text: "韩式",
                *               value: "hanshi"
                *           }
                *       ]  
                *   }
                * ]
                * 
                * @param viewerWidth
                * @param viewerHeight
                * @param imageMinWidth
                * @param imageMinHeight
                * @param imageMaxHeight
                * @param imageMaxWidth
                * @param options.exOptions
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    name: null,
                    onUploadSuccess: function () {},
                    onUploadFail: function () {},
                    onUploadComplete: function () {},
                    onProgress: function () {},
                    onUploadStart: function () {},
                    onBeforeUpload: function () {},
                    onExtraFile: function () {},
                    onClick: function () {},
                    viewerWidth: 240,
                    viewerHeight: 240,
                    imageMinWidth: 240,
                    imageMinHeight: 240,
                    imageMaxWidth: 7000,
                    imageMaxHeight: 7000,
                    file: null,
                    onOpenOptions: function () {},
                    viewerMode: Uploader.VIEWER_MODE.FULL,
                    multiSelection: false,
                    onRemoveFile: function (uploader) {
                        
                    },
                    exOptions: [
                        
                    ],
                    exDataSelector: [
                        
                    ]
                }, options);
                
                self.options = options;
                
                options.imageMinWidth > options.imageMaxWidth ? options.imageMaxWidth = options.imageMinWidth : void(0);
                options.imageMinHeight > options.imageMaxHeight ? options.imageMaxHeight = options.imageMinHeight : void(0);
                
                ++ Uploader.COUNTER;
                
                var id = "uploader" + Uploader.COUNTER + "@" + (new Date()).getTime();
                var buttonId = id + "_upload_button";
                var containerId = id + "_container";
            	
            	if(options.exOptions != false)
            	{
                    options.exOptions.push({
                        text: "删除图片",
                        onClick: function (uploader) {
                            uploader.remove();
                            var selectDiv = self.uploaderDOM.find("div.selectDiv");
                            selectDiv.css("display","none");
                        }
                    });
            	}
                
                self.uploaderDOM = $(UploaderJST.render({
                    data: {
                        buttonId:  buttonId,
                        containerId: containerId,
                        name: options.name,
                        viewerWidth: options.viewerWidth,
                        viewerHeight: options.viewerHeight,
                        options: options.exOptions
                    }
                }));
                
                $(window).bind("resize", function () {
                    self.uploaderDOM.find("div.moxie-shim").css({
                        width: "100%",
                        height: "100%"
                    });
                });
                
                self.setViewerWidth(options.viewerWidth);
                self.setViewerHeight(options.viewerHeight);
                
                options.target.append(self.uploaderDOM);
                
                if(options.exOptions != false)
                {
                    for(var i = 0, l = options.exOptions.length; i < l; ++ i)
                    {
                        var option = options.exOptions[i];
                        var button = self.uploaderDOM.find("button[data-name='" + option.text + "']");
                        button.bind("click", (function (_onClick) {
                            return function () {
                                var selectDiv = self.uploaderDOM.find("div.selectDiv");
                                self.closeOptions();
                                _onClick(self);
                            };
                        })(option.onClick || function () {}));
                        if(option.disable)
                        {
                            this.disableOption(option.text);
                        }
                    }
                
                    /*click to show div.dele-div*/
                    self.uploaderDOM.find("a.select").bind("click",function(){
                        var selectDiv = self.uploaderDOM.find("div.selectDiv");
                        
                        if(selectDiv.data("slidedown")) {
                            self.closeOptions();
                        }
                        else{
                            self.openOptions();
                        }
                        
                    });
                }
                else
                {
                    self.uploaderDOM.find("button.remove").bind("click", function () {
                        self.remove();
                    });
                }
                
                self.uploaderDOM.bind("click", function () {
                	self.options.onClick(self);
                });
                
                self.locked = false;
                
                XHR.request({
                    url: "/qiniu/get_uptoken",
                    type: "get",
                    async: false,
                    success: function (data) {
                        self.uploader = (new QiniuJsSDK()).uploader({
                            runtimes: 'html5,flash,html4',    //上传模式,依次退化
                            browse_button: buttonId,       //上传选择的点选按钮，**必需**
                            filters: {
                                mime_types: [ 
                                    { 
                                        title: "Image files", 
                                        extensions : "jpg,png,gif,JPEG,jpeg" 
                                    }
                                ]
                            },
                            //uptoken_url: '/fileMgr/getUptoken.do',
                                //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                            uptoken : data.data.uptoken,
                                //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
                            unique_names: false,
                                // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
                            save_key: false,
                                // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
                            domain: Config.FILE_DOMAIN,
                                //bucket 域名，下载资源时用到，**必需**
                            container: containerId,           //上传区域DOM ID，默认是browser_button的父元素，
                            max_file_size: "5mb",           //最大文件体积限制
                            flash_swf_url: __uri("/static/flash/Moxie.swf"),  //引入flash,相对路径
                            max_retries: 3,                   //上传失败最大重试次数
                            dragdrop: false,                   //开启可拖曳上传
                            drop_element: null,        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
                            chunk_size: '4mb',                //分块上传时，每片的体积
                            auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                            multi_selection: options.multiSelection,
                            multipart_params: {
                            },
                            init: {
                                'FilesAdded': function(up, files) {
                                    //console.log("FilesAdded");
                                },
                                OptionChanged: function () {
                                    //console.log("optionsChanged");
                                },
                                Refresh: function () {
                                    //console.log("Refresh");
                                },
                                StateChanged: function () {
                                    //console.log("StateChanged");
                                },
                                StateChanged: function () {
                                    //console.log("StateChanged");
                                },
                                UploadFile: function (up, file) {
                                    
                                    var callbackData = {
                                        uploader: self, 
                                        obj: up,
                                        code: null,
                                        message: null
                                    };
                                    options.onProgress({
                                        uploader: self,
                                        obj: up,
                                        code: null,
                                        message: null
                                    });
                                    self.loading(percent > 1 ? percent : 1);
                                    options.onUploadStart(callbackData);
                                    options.onProgress(callbackData);
                                    var percent = up.total.percent - 4;
                                },
                                'BeforeUpload': function(up, file) {
                                    self.options.onBeforeUpload(self, file);
                                },
                                'UploadProgress': function(up, file) {
                                    options.onProgress({
                                        uploader: self, 
                                        obj: up,
                                        code: null,
                                        message: null
                                    });
                                    var percent = up.total.percent - 4;
                                    self.loading(percent > 1 ? percent : 1);
                                },
                                'FileUploaded': function(up, file, info) {
                                    options.onProgress({
                                        uploader: self, 
                                        obj: up,
                                        code: null,
                                        message: null
                                    });
                                    //96%
                                    var percent = up.total.percent - 4;
                                    self.loading(percent > 1 ? percent : 1);
                                    XHR.request({
                                        url: "/qiniu/get_fileinfo",
                                        memcache: "page",
                                        data: "path=" + fileKey[file.id],
                                        success: function (data) {
                                            self.loading(97);
                                            if(parseInt(data.code) == 0)
                                            {
                                                self.loading(98);
                                                var imageWidth = data.data.width;
                                                var imageHeight = data.data.height;
                                                
                                                if(imageWidth < options.imageMinWidth 
                                                    || imageHeight < options.imageMinHeight)
                                                {
                                                    self.remove();
                                                    var errMsg = null;
                                                    if(options.imageMinWidth == options.imageMaxWidth
                                                    || options.imageMinHeight == options.imageMaxHeight) {
                                                        errMsg = "图片分辨率只能为" + options.imageMinWidth + "*" + options.imageMinHeight;
                                                    }
                                                    else{
                                                        if(options.imageMinHeight==0){
                                                            errMsg = "图片宽度最小为" + options.imageMinWidth + "像素";
                                                        }else{
                                                            errMsg = "图片分辨率最小为" + options.imageMinWidth + "*" + options.imageMinHeight;
                                                        }
                                                    }



                                                    if(options.onUploadFail({
                                                        uploader: self, 
                                                        obj: up,
                                                        code: null,
                                                        message: errMsg,
                                                        data: {
                                                            minWidth: options.imageMinWidth,
                                                            minHeight: options.imageMinHeight,
                                                            maxWidth: options.imageMaxWidth,
                                                            maxHeight: options.imageMaxHeight
                                                        }
                                                    }) != false)
                                                    {
                                                    	if(alertShow == false)
                                                		{
                                                        	alertShow = true;
                                                            new Alert({
                                                                text: errMsg,
                                                                ok: function () {
                                                                	alertShow = false;
                                                                }
                                                            });
                                                		}
                                                    }
                                                }
                                                else if(imageWidth > options.imageMaxWidth 
                                                    || imageHeight > options.imageMaxHeight)
                                                {
                                                    self.remove();
                                                    var errMsg = null;
                                                    if(options.imageMinWidth == options.imageMaxWidth
                                                        || options.imageMinHeight == options.imageMaxHeight) {
                                                        errMsg = "图片分辨率只能为" + options.imageMinWidth + "*" + options.imageMinHeight;
                                                    }else{
                                                        errMsg = "图片分辨率最大为" + options.imageMaxWidth + "*" + options.imageMaxHeight;
                                                    }
                                                    
                                                    if(options.onUploadFail({
                                                        uploader: self, 
                                                        obj: up,
                                                        code: null,
                                                        message: errMsg,
                                                        data: {
                                                            minWidth: options.imageMinWidth,
                                                            minHeight: options.imageMinHeight,
                                                            maxWidth: options.imageMaxWidth,
                                                            maxHeight: options.imageMaxHeight
                                                        }
                                                    }) != false)
                                                    {
                                                    	if(alertShow == false)
                                                		{
                                                    		alertShow = true;
                                                            new Alert({
                                                                text: errMsg,
                                                                ok: function () {
                                                                	alertShow = false;
                                                                }
                                                            });
                                                		}
                                                    }
                                                }
                                                else
                                                {
                                                    self.loading(99);
                                                    self.setImage(fileKey[file.id]);
                                                    options.onUploadSuccess({
                                                        uploader: self, 
                                                        obj: up,
                                                        code: null,
                                                        message: null
                                                    });
                                                }
                                                options.onUploadComplete({
                                                    uploader: self, 
                                                    obj: up,
                                                    code: null,
                                                    message: null
                                                });
                                            }
                                        }
                                    });
                                },
                                'Error': function(up, err, errTip) {
                                        switch(err.code)
                                        {
                                            case -600:
                                                new Toast({
                                                    text: "图片大小最多为5MB"
                                                });
                                            break;
                                            case -601:
                                            	if(alertShow == false)
                                        		{
                                                	alertShow = true;
                                                    new Alert({
                                                        text: "请选择正确的图片格式，支持jpg,png,gif,jpeg。",
                                                        ok: function () {
                                                        	alertShow = false;
                                                        }
                                                    });
                                        		}
                                            break;
                                        }
                                       //上传出错时,处理相关的事情
                                       options.onUploadFail({
                                            uploader: self, 
                                            obj: up,
                                            code: err,
                                            message: errTip
                                        });
                                        options.onUploadComplete({
                                            uploader: self, 
                                            obj: up,
                                            code: null,
                                            message: null
                                        });
                                },
                                FileFiltered: function (uploader, file) {
                                    self.loading(1);
                                    if(uploader.files.length > 1)
                                    {
                                        var source = file.getNative();
                                        uploader.removeFile(file);
                                        options.onExtraFile(source);
                                    }
                                },
                                Init: function () {
                                    if(options.defPath && options.defPath.length > 0)
                                    {
                                        self.setImage(options.defPath);
                                    }
                                    else if(options.file)
                                    {
                                        self.upload({
                                            file: options.file
                                        });
                                    }
                                },
                                'UploadComplete': function(up) {
                                       //队列文件处理完毕后,处理相关的事情
                                },
                                "QueueChanged": function (uploader) {
                                    //console.log("queueChanged");
                                },
                                'Key': function(up, file) {
                                    // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                                    // 该配置必须要在 unique_names: false , save_key: false 时才生效
                                    var filePath = "";
                                    XHR.request({
                                        url: "/qiniu/get_filekey",
                                        async: false,
                                        data: {
                                            filename: file.name
                                        },
                                        success: function (data) {
                                            fileKey[file.id] = data.data.path;
                                        }
                                    });
                                    return fileKey[file.id];
                                }
                            }
                        });
                        
                    }
                });
            },
            {
                getDOM: function () {
                    return this.uploaderDOM;
                },
            	disableOption: function (text) {
            		this.uploaderDOM.find("button[data-name='" + text + "']").hide();
            	},
            	enableOption: function (text) {
            		this.uploaderDOM.find("button[data-name='" + text + "']").show();
            	},
            	triggerOption: function (text) {
            		this.uploaderDOM.find("button[data-name='" + text + "']").trigger("click");
            	},
            	openOptions: function () {
            		this.uploaderDOM.find("div.selectDiv").data("slidedown", true).slideDown();
            		this.options.onOpenOptions(this);
            	},
            	closeOptions: function () {
            		this.uploaderDOM.find("div.selectDiv").data("slidedown", false).slideUp();
            	},
            	getImagePath: function() {
            		return this.uploaderDOM.find("input[type='hidden'].image-path").val();
            	},
            	setImagePath: function (imagePath) {
            		this.uploaderDOM.find("input[type='hidden'].image-path").val(imagePath);
            	},
                lock: function () {
                    this.locked = true;
                    if(Browser.detect.ie8 == false && Browser.detect.ie7 == false && Browser.detect.ie6 == false)
                    {
                        this.uploader.disableBrowse(true);
                    }
                },
                unlock: function () {
                    this.locked = false;
                    if(Browser.detect.ie8 == false && Browser.detect.ie7 == false && Browser.detect.ie6 == false)
                    {
                        this.uploader.disableBrowse(false);
                    }
                },
                uploading: function () {
                    return this.uploaderDOM.hasClass("loading") ? true : false;
                },
                loading: function (progress) {
                    var self = this;
                    self.uploaderDOM.removeClass("uploaded").addClass("loading");
                    self.uploaderDOM.find("div.loading div.progress").html(progress + "%");
                },
                loadingComplete: function () {
                    this.uploaderDOM.removeClass("loading");
                },
                setImage: function (path) {
                    var self = this;
                    self.loadingComplete();
                    self.uploaderDOM.removeClass("loading").addClass("uploaded");
                    
                    var options = self.options;
                    
                    self.uploaderDOM.find("div.image-view img.image").attr("src", Config.FILE_DOMAIN + path + "?imageView2/" + options.viewerMode + "/w/" + options.viewerWidth * Browser.devicePixelRatio + "/h/" + options.viewerHeight * Browser.devicePixelRatio);
                    self.uploaderDOM.find("input[type='hidden']").val(path);
                },
                blank: function () {
                    return ( this.uploaderDOM.hasClass("uploaded") || this.uploaderDOM.hasClass("loading") ) ? false : true;
                },
                setViewerWidth: function (viewerWidth) {
                    this.viewerWidth = viewerWidth;
                    this.uploaderDOM.css("width", this.viewerWidth + "px");
                    if(this.viewerWidth > this.viewerHeight)
                    {
                        this.uploaderDOM.find("a.pick").css("backgroundSize", "auto 50%");
                    }
                    else
                    {
                        this.uploaderDOM.find("a.pick").css("backgroundSize", "50% auto");
                    }
                    this.uploaderDOM.find("div.moxie-shim").css({
                        width: "100%",
                        height: "100%"
                    });
                },
                hide: function () {
                    this.uploaderDOM.addClass("nodis");
                },
                show: function () {
                    this.uploaderDOM.removeClass("nodis");
                    this.uploaderDOM.find("div.moxie-shim").css({
                        width: "100%",
                        height: "100%"
                    });
                },
                setViewerHeight: function (viewerHeight) {
                    this.viewerHeight = viewerHeight;
                    this.uploaderDOM.css("height", this.viewerHeight + "px");
                    this.uploaderDOM.find("div.loading").css("lineHeight", this.viewerHeight + "px");
                    if(this.viewerWidth > this.viewerHeight)
                    {
                        this.uploaderDOM.find("a.pick").css("backgroundSize", "auto 50%");
                    }
                    else
                    {
                        this.uploaderDOM.find("a.pick").css("backgroundSize", "50% auto");
                    }
                    this.uploaderDOM.find("div.moxie-shim").css({
                        width: "100%",
                        height: "100%"
                    });
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.file
                 */
                upload: function (options) {
                    this.loading(1);
                    this.uploader.refresh();
                    this.uploader.addFile(options.file);
                    this.uploader.start();
                },
                remove: function () {
                    var self = this;                    
                    var files = self.uploader.files;
                    for(var i = 0, l = files.length; i < l; ++ i)
                    {
                        self.uploader.removeFile(files[i]);
                    }
                    self.uploaderDOM.removeClass("uploaded loading");
                    self.uploaderDOM.find("div.image-view img.image").removeAttr("src");
                    self.uploaderDOM.find("input[type='hidden']").val("");
                    self.options.onRemoveFile(self);
                    self.uploader.refresh();
                },
                destroy: function () {
                    this.remove();
                    this.uploader.destroy();
                    this.uploaderDOM.remove();
                }
            }
        );
        
        Uploader.COUNTER = 0;
        
        Uploader.VIEWER_MODE = {
            FULL: 1,
            ADAPT: 2
        };
        
        return Uploader;
    }
);