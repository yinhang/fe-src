define(
    [
        "app/multi_image_uploader/Uploader",
        "loadjst!app/multi_image_uploader.jst",
        "base/Class",
        "lib/jQuery",
        "widget/modal/dialog/Alert"
    ],
    function (Uploader, MultiImageUploaderJST, Class, $, Alert) {
        
        var MultiImageUploader = Class.define(
            /**
             * 
                * @param {Object} options
                * @param options.target
                * @param options.name
                * @param options.onUploadStart
                * @param options.onUploadComplete
                * @param options.onClick
                * @param options.onRemoveFile
                * 
                * @param viewerWidth
                * @param viewerHeight
                * @param imageMinWidth
                * @param imageMinHeight
                * @param imageMaxHeight
                * @param imageMaxWidth
                * @param viewerMode
                * @param maxUploader
                * @param options.exOptions
             */
            function (options) {
                var self = this;
                
                options = $.extend({
                    name: "image",
                    onUploadStart: function () {},
                    onUploadComplete: function () {},
                    onClick: function () {},
                    viewerWidth: 240,
                    viewerHeight: 240,
                    imageMinWidth: 240,
                    imageMinHeight: 240,
                    imageMaxWidth: 7000,
                    imageMaxHeight: 7000,
                    onRemoveFile: function (uploader) {
                        
                    },
                    viewerMode: MultiImageUploader.VIEWER_MODE.FULL,
                    maxUploader: 3,
                    exOptions: [
                        
                    ],
                    exDataSelector: [
                        
                    ]
                }, options);
                
                self.name = options.name;
                
                self.options = options;
                
                self.dom = $(MultiImageUploaderJST.render());
                options.target.append(self.dom);
                self.uploaderMap = {};
                
                self.alertShown = false;
                
                self.uploadingNum = 0;
                
                self.onUploadStart = options.onUploadStart;
                self.onUploadComplete = options.onUploadComplete;
                
                self.addUploader();
            },
            {
                uploading: function () {
                    return this.uploadingNum > 0;
                },
                lock: function () {
                    var self = this;
                    for(var key in self.uploaderMap)
                    {
                        self.uploaderMap[key].lock();
                    }
                },
                unlock: function () {
                    var self = this;
                    for(var key in self.uploaderMap)
                    {
                        self.uploaderMap[key].unlock();
                    }
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.path
                 */
                addImage: function (options) {
                    var path = options.path;
                    
                    var blankUploader = this.getBlankUploader();
                    if(blankUploader.length > 0)
                    {
                        var uploader = blankUploader[0];
                        uploader.setImage(path);
                        this.addUploader();
                        return uploader;
                    }
                    return this.addUploader({
                        defPath: path
                    });
                    self.send("addimage", uploader);
                },
                /**
                 * 
                    * @param {Object} options
                    * @param options.defPath
                    * @param options.file
                 */
                addUploader: function (options) {
                    if(this.uploaderNum() >= this.options.maxUploader)
                    {
                        return;
                    }
                    options = options || {};
                    
                    var self = this;
                    var li = $("<li></li>");
                    self.dom.append(li);
                    var exOptions = [];
                    for(var i = 0, l = self.options.exOptions.length; i < l; ++ i)
                	{
                    	exOptions.push(self.options.exOptions[i]);
                	}
                    
                    var uploader = new Uploader({
                        target: li,
                        name: self.name,
                        defPath: options.defPath,
                        file: options.file,
                        
                        viewerWidth: self.options.viewerWidth,
                        viewerHeight: self.options.viewerHeight,
                        imageMinWidth: self.options.imageMinWidth,
                        imageMinHeight: self.options.imageMinHeight,
                        imageMaxWidth: self.options.imageMaxWidth,
                        imageMaxHeight: self.options.imageMaxHeight,
                        onRemoveFile: function (uploader) {
                            self.options.onRemoveFile(uploader);
                        },
                        onOpenOptions: function (uploader) {
                        	for(var id in self.uploaderMap)
                    		{
                        		if(uploader != id)
                    			{
                        			self.uploaderMap[id].closeOptions();
                    			}
                    		}
                        },
                        onExtraFile: function (file) {
                            if(self.uploaderNum() >= self.options.maxUploader)
                            {
                                if(self.alertShown == false)
                                {
                                    self.alertShown = true;
                                    new Alert({
                                        text: "最多上传" + self.options.maxUploader + "张图片，本次上传将舍弃一部分您选择的图片。",
                                        ok: function () {
                                            self.alertShown = false;
                                        }
                                    });
                                }
                                return;
                            }
                    
                            var blankUploader = self.getBlankUploader();
                            if(blankUploader.length > 0)
                            {
                                blankUploader[0].upload({
                                    file: file
                                });
                                if(self.getBlankUploader().length <= 0)
                                {
                                    self.addUploader();
                                }
                            }
                            else
                            {
                                self.addUploader({
                                    file: file
                                });
                            }
                        },
                        viewerMode: self.options.viewerMode,
                        multiSelection: false,
                        onClick: self.options.onClick,
                        exOptions: exOptions,
                        exDataSelector: self.options.exDataSelector,
                        onUploadStart: function () {
                            if(self.uploadingNum <= 0)
                            {
                                self.onUploadStart({});
                            }
                            if(self.getBlankUploader().length <= 0)
                            {
                                self.addUploader();
                            }
                        },
                        onUploadComplete: function () {
                            -- self.uploadingNum;
                            if(self.uploadingNum <= 0)
                            {
                                self.onUploadComplete({});
                            }
                        }
                    });
                    self.uploaderMap[uploader] = uploader;
                    self.send("adduploader", uploader);
                    return uploader;
                },
                uploaderNum: function () {
                    var num = 0;
                    for(var oid in this.uploaderMap)
                    {
                        ++ num;
                    }
                    return num;
                },
                uploadNum: function () {
                    var num = 0;
                    for(var oid in this.uploaderMap)
                    {
                        if(this.uploaderMap[oid].blank() == false)
                        {
                            ++ num;
                        }
                    }
                    return num;
                },
                getBlankUploader: function () {
                    var list = [];
                    for(var oid in this.uploaderMap)
                    {
                        var uploader = this.uploaderMap[oid];
                        if(uploader.blank())
                        {
                           list.push(uploader);
                        }
                    }
                    return list;
                },
                destroy: function () {
                    for(var oid in this.uploaderMap)
                    {
                        var uploader = this.uploaderMap[oid];
                        uploader.destroy();
                    }
                    this.dom.remove();
                }
            }
        );
        
        MultiImageUploader.VIEWER_MODE = {
            FULL: Uploader.VIEWER_MODE.FULL,
            ADAPT: Uploader.VIEWER_MODE.ADAPT
        };
        
        return MultiImageUploader;
        
    }
);
