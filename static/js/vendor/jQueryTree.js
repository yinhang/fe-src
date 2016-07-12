/**
 * @author YinHang
 * satanultra@gmail.com
 * 发布地址: http://satanultra.iteye.com/
 * 此插件基于jQuery(v1.4.3最后测试通过),部分功能基于jQuery-ui.sortable(v1.8.13最后测试通过)。
 * 版本:1.2.1
 * jQueryTree可作为插件/类库链接到任意程序中，但在任何时候，不可以直接用jQueryTree获取任何经济利益,并应在任何时候注明作者版权。
 */
;(function ($) {
	//正则表达式
	var REG_EXP = {
			SOURCE_INDEX_CLASSNAME: /\bsource-index-[\d]+\b/
	};
	//树创建数量计数器
	var counter = 0;
	//添加jQuery命名空间下的方法
	$.Tree = function (options) {
		if(options.parent == null)
			return;
		options.parent = $(options.parent).empty();
		return new Tree(options);
	};
	$.TREE = {};
	
	/*
	//添加jQuery对象方法
	$.fn.tree = function (options) {
		
	};
	*/
	
	//树类
	/**
	 * @param {Object} options
	 * parent: 树的父节点。
	 * source: 树的对象/dom形式。
	 * selectMode: 选择模式。
	 * pretreatment: 生成每个节点时的预处理函数，会把节点数据传递过去，并用返回的数据做为新的节点生成数据。
	 * allOpen: 是否默认全部打开。
	 * autoBlur: 当菜单闭合时，被选择的项是否自动失去焦点。
	 * onSelect: 当有节点被选中时触发的事件，会将节点传递给方法。
	 * autoClose: 自动关闭所有子节点
	 * sourceQuote: 是否将节点元数据附着在dom上
	 * childrenSwitch: "ico" || "node" || "other" 此选项为子菜单开关的设置，依次为:点击图标，点击节点，其他(自编程)
	 * remoteChildren: remoteChildren
	 * sortover: 排序结束时候调用的方法，传递节点内容和前兄弟节点
	 * remote: remote
	 * nodeEvents: nodeEvents
	 * eventTrigger: 节点选中事件触发句柄
	 */
	function Tree(options) {
		if(!options.parent)
			return;
		//数据存储器
		this.MEM_DATA = $({});
		this.SERIAL_NUMBER = ++ counter + "-" + new Date().getTime();
		this.sourceQuote = options.sourceQuote;
		var host = this;
		//把参数合并到Tree对象
		if(!options.childrenSwitch)
			options.childrenSwitch = "ico";
		$.extend(this, options);
		//初次把所有一级菜单都添加上
		this.doming({parent: options.parent, treeJson: options.source ? options.source : {}, first: true});
		//单选模式开启?
		if(this.hasSelectMode("single"))
		{
			this.eventTrigger = this.eventTrigger ? this.eventTrigger : "";
			$("ul.jqtree-" + this.SERIAL_NUMBER + " span.jqtree-node-content " + this.eventTrigger).live("mousedown", function () {
				var selected = host.MEM_DATA.data("selected");
				if(selected && selected != this)
					host.blur(selected);
				host.select(this);
				host.MEM_DATA.data("selected", this);
			});
		}
		//开启排序
		if(this.sortable == true)
			this.setSortable($("ul.jqtree-" + this.SERIAL_NUMBER));
		//添加节点事件
		if(this.nodeEvents)
		{
			for(var eventName in this.nodeEvents)
				this.liveEventOnNode(eventName, this.nodeEvents[eventName]);
		}
	};
	
	//原型引用
	var Prototype = Tree.prototype;
	//********************************************************************Tree对象属性设置********************************************************************
	/**
	 * 取得一个节点的所有兄弟节点内容
	 * @param {Object} node
	 */
	Tree.GET_SIBLING_CONTENTS = function (node) {
		return $(node).siblings("li").children("span.jqtree-node").children("span.jqtree-node-content");
	};
	/**
	 * 取得一个节点的所有兄弟节点
	 */
	Tree.GET_SIBLINGS = function (node) {
		return $(node).siblings("li");
	};
	/**
	 * 取得上一个兄弟节点
	 * @param {Object} node
	 */
	Tree.GET_SIBLING_PREV = function (node) {
		return $(node).prevAll("li:first").get(0);
	};
	
	/**
	 * 取得首位兄弟节点
	 * @param {Object} node
	 */
	Tree.GET_SIBLING_FIRST = function (node) {
		return $(node).siblings().first();
	};
	
	/**
	 * 取得最后一位兄弟节点
	 * @param {Object} node
	 */
	Tree.GET_SIBLING_LAST = function (node) {
		return $(node).siblings().last();
	};
	
	Tree.GET_MENU = function (li) {
		return $(li).parents("ul:first").get(0);
	};
	
	/**
	 * 取得多选框元素
	 * @param {Object} node
	 */
	Tree.GET_CHECKBOX = function (node) {
		return $(node).find("input.jqtree-ms-box:first").get(0);
	};
	
	/**
	 * 取得下一个兄弟节点
	 * @param {Object} node
	 */
	Tree.GET_SIBLING_NEXT = function (node) {
		return $(node).nextAll("li:first").get(0);
	};
	
	/**
	 * 取得父菜单/节点
	 * @param {Object} node
	 */
	Tree.GET_CUR_MENU = function (node) {
		return $(node).parents("li:first");
	};
	
	/**
	 * 取得节点内容
	 * @param {Object} node
	 */
	Tree.GET_NODE_CONTENT = function (node) {
		if(!node)
			return null;
		return $(node).find("span.jqtree-node-content:first").get(0);
	};
	
	/**
	 * 取得节点开关
	 * @param node
	 * @return
	 */
	Tree.GET_NODE_SWITCH = function (node) {
		return $(node).find("span.op-area.jqtree-has-children:first").get(0);
	};
	
	/**
	 * 将节点转换为无子节点状态
	 * @param node
	 * @return
	 */
	Tree.COV_TO_NOCHILDREN = function (node) {
		if(!node)
			return;
		var $node = $(node);
		$node.removeClass("jqtree-li-has-children jqtree-li-closed jqtree-li-opened").find("span.jqtree-has-children , ul").remove();
	};
	
	/**
	 * 删除节点
	 * @param {Object} newNode
	 */
	Tree.DEL_NODE = function (node) {
		//删除一个节点
		var $node = $(node);
		if($node.hasClass("jqtree-last"))
			$(Tree.GET_SIBLING_PREV($node)).addClass("jqtree-last");
		if($node.hasClass("jqtree-first"))
			$(Tree.GET_SIBLING_NEXT($node)).addClass("jqtree-first");
		var parentNode = Tree.GET_PARENT($node);
		$node.remove();
		if(Tree.GET_ITEM_SIZE(Tree.GET_CHILDREN(parentNode)) <= 0)
			Tree.COV_TO_NOCHILDREN(parentNode);
	};
	$.TREE.DEL_NODE = Tree.DEL_NODE;
	
	/**
	 * 加载节点子菜单
	 * @param {Object} node
	 * @param {Object} data	json
	 */
	Tree.LOAD_CHILDREN = function (node, data, tree) {
		if(!$(node).data("loaded"))
		{
			node.data("loaded", true);
			node.removeClass("unload");
			node.data("opened", false);
			if($.isArray(data) == false)
			{
				data = Tree.GET_REMOTEDATA(data);
			}
			if(data && data.length > 0)
				tree.doming({parent: node.parents("li:first"), treeJson: data});
			else
			{
				Tree.COV_TO_NOCHILDREN(node.parents("li:first"));
			}	
		}
	};
	
	Tree.LOAD_TEMPLATE_DATA = function (data, template) {
		var kvs = template.split("&");
		var kvsSize = kvs.length;
		for(var i=0;i<kvsSize;++i)
		{
			var kv = kvs[i].split("=");
			if(kv[1].substr(0, 1) == "#")
				kv[1] = kv[1].substr(1);
			else
			{
				eval("kv[1] = data." + kv[1]);
			}
			kvs[i] = kv.join("=");
		}
		return kvs.join("&");
	};
	
	/**
	 * 获取远程数据
	 * @param {Object} options
	 */
	Tree.GET_REMOTEDATA = function (options) {
		var remoteData = {};
		options.async = false;
		options.dataType = options.dataType || "json";
		options.cache = options.cache || false;
		if(!options.success)
		{
			options.success = function (data) {
				remoteData = data;
				delete options.success;
			};
		}
		else
		{
			var _success = options.success;
			options.success = function (data) {
				var _remoteData = _success(data);
				remoteData = _remoteData ? _remoteData : data;
			};
		}
		$.ajax(options);
		return remoteData;
	};
	
	/**
	 * 加载节点子菜单
	 * @param {Object} node
	 * @param {Object} data	json
	 */
	Tree.LOAD_ALL_CHILDREN = function (node, data, tree) {
		var $node = $(node);
		var parent = $(Tree.GET_PARENT(node));
		var children = parent.find("span.op-area.unload").addClass("onlyload");
		while(children.size() > 0)
		{
			children.trigger("click");
			children = parent.find("span.op-area.unload").addClass("onlyload");
		}
	};
	
	/**
	 * 取得子节点列表
	 * @param {Object} node
	 */
	Tree.GET_CHILDREN = function (node) {
		var $node = $(node);
		if(Tree.HAS_CHILDREN($node) == false)
			return;
		if(Tree.IS_LOADED($node) == false)
			$(Tree.GET_NODE_SWITCH($node)).trigger("click");
		return $(node).children("ul:first").get(0);
	};
	
	/**
	 * 取得菜单项
	 * @param {Object} menu
	 * @param {Object} index
	 */
	Tree.GET_ITEM = function (menu, index) {
		return $(menu).children("li").get(index);
	};
	
	/**
	 * 将一个节点内容失焦
	 * @param node
	 * @return
	 */
	Tree.BLUR = function (node) {
		var $node = $(node);
		if($node.size() > 0)
		{
			$(node).removeClass("selected");
			return true;
		}
		return false;
	};
	
	/**
	 * 编辑节点
	 * @param {Object} node
	 * @param {Object} nodeData
	 */
	Tree.EDIT_NODE = function (node, nodeData) {
		$(Tree.GET_NODE_CONTENT($(node))).html(nodeData);
	};
	
	/**
	 * 菜单项
	 * @param {Object} menu
	 */
	Tree.GET_ITEM_SIZE = function (menu) {
		return $(menu).children("li").size();
	};
	
	/**
	 * 取得最后一个菜单项
	 * @param {Object} menu
	 */
	Tree.GET_LAST_ITEM = function (menu) {
		return Tree.GET_ITEM($(menu), Tree.GET_ITEM_SIZE(menu) - 1);
	};
	
	/**
	 * 取得第一个菜单项
	 * @param {Object} menu
	 */
	Tree.GET_FIRST_ITEM = function (menu) {
		return Tree.GET_ITEM($(menu), 0);
	};
	
	/**
	 * 判断节点是否有子菜单
	 * @param {Object} node
	 */
	Tree.HAS_CHILDREN = function (node) {
		return $(node).hasClass("jqtree-li-has-children") ? true : false;
	};
	
	/**
	 * 判断节点子菜单是否加载
	 * @param {Object} node
	 */
	Tree.IS_LOADED = function (node) {
		var $node = $(node);
		var content = Tree.GET_NODE_SWITCH($node);
		return $(content).data("loaded") ? true : false;
	};
	
	/**
	 * 判断节点子菜单是否开启
	 * @param {Object} node
	 */
	Tree.IS_OPENED = function (node) {
		var $node = $(node);
		var content = Tree.GET_NODE_SWITCH($node);
		return $(content).data("opened") ? true : false;
	};
	
	/**
	 * 取得父节点
	 * @param node
	 * @return
	 */
	Tree.GET_PARENT = function (node) {
		var $node = $(node);
		return $node.parents("li:first").get(0);
	};
	//********************************************************************原形设置********************************************************************
	/**
	 * 将一个事件监听器绑定到节点上
	 * @param {Object} eventName
	 * @param {Object} callback
	 */
	Prototype.liveEventOnNode = function (eventName, callback) {
		var thistree = this;
		$("ul.jqtree-" + this.SERIAL_NUMBER + " span.jqtree-node-content " + this.eventTrigger).live(eventName, function (event) {
			if(thistree.eventTrigger)
				callback(event, $(this).parents("span.jqtree-node-content:first"));
			else
			{
				callback(event, this);
			}
		});
	};
	/**
	 * 设置一个菜单为可排序的
	 */
	Prototype.setSortable = function (ul) {
		var host = this;
		var $ul = $(ul);
		$ul.sortable({axis: "y", handle: "span.jqtree-node"}).data("sortable_initialized", true)
		.bind("sortupdate", function (event, ui) {
			host.updateClasses($ul);
			if(host.sortover)
				host.sortover(Tree.GET_NODE_CONTENT(ui.item), Tree.GET_NODE_CONTENT(Tree.GET_SIBLING_PREV(ui.item)));
		})
		.bind("sortstart", function (event, ui) {
			$(Tree.GET_NODE_CONTENT(ui.item)).addClass("sort-target");
			Tree.GET_SIBLING_CONTENTS(ui.item).addClass("sorting");
		})
		.bind("sortstop", function (event, ui) {
			$(Tree.GET_NODE_CONTENT(ui.item)).removeClass("sort-target");
			Tree.GET_SIBLING_CONTENTS(ui.item).removeClass("sorting");
		});
		//ie下排序时需要禁止父列表的排序事件
		if($.browser.msie)
		{
			$ul.children("li")
			.bind("mousedown", function () {
				$(this).parents("ul:first").parents("ul").sortable("disable");
			})
			.bind("mouseup", function () {
				$(this).parents("ul:first").parents("ul").sortable("enable");
			});
		}
	};
	
	Prototype.updateClasses = function (ul) {
		var lis = ul.children("li");
		var other = lis.removeClass("jqtree-first jqtree-last");
		lis.first().addClass("jqtree-first");
		lis.last().addClass("jqtree-last");
	};
	
	/**
	 * 打开节点子菜单
	 * @param {Object} node
	 */
	Prototype.openChildren = function (nodeSwitch) {
		var $node = $(nodeSwitch);
		var li = $node.parents("li:first");
		var ul = li.children("ul:first").show();
		if(this.sortable == true && !ul.data("sortable_initialized"))
			this.setSortable(ul);
		$node.data("opened", true);
		$node.removeClass("closed").addClass("opened");
		$node.parents("li:first").removeClass("jqtree-li-closed").addClass("jqtree-li-opened");
		//触发节点关闭事件
		var nodeContent = $(Tree.GET_NODE_CONTENT(li));
		if(this.eventTrigger)
			nodeContent.find(this.eventTrigger).trigger("childrenOpen", [nodeContent]);
	};
	
	/**
	 * 关闭一个节点
	 * @param node
	 * @return
	 */
	Prototype.closeChildren = function (nodeSwitch) {
		var $node = $(nodeSwitch);
		var li = $node.parents("li:first");
		var childNode = li.children("ul:first").hide();
		$node.data("opened", false);
		$node.removeClass("opened").addClass("closed");
		$node.parents("li:first").removeClass("jqtree-li-opened").addClass("jqtree-li-closed");
		if(this.autoClose)
		{
			var opened = childNode.find("span.op-area.opened");
			if(opened.size() > 0)
				opened.trigger("click");
		}
		if(this.blur && this.autoBlur)
			this.blur(childNode.find("span.jqtree-node-content.selected"));
		//触发节点关闭事件
		var nodeContent = $(Tree.GET_NODE_CONTENT(li));
		if(this.eventTrigger)
			nodeContent.find(this.eventTrigger).trigger("childrenClose", [nodeContent]);
	};
	
	/**
	 * 切换子元素的显示/隐藏
	 * @param {Object} event
	 */
	Prototype.switchShowChildren = function (event, opSpan) {
		var $this = $(opSpan);
		if($this.data("opened"))
			event.data.host.closeChildren($this);
		else
		{
			if($this.data("loaded"))
				this.openChildren($this, event.data.host.autoBlur);
			else
			{
				var sourceIndex = REG_EXP.SOURCE_INDEX_CLASSNAME.exec($this.attr("class"))[0].split("-")[2];
				Tree.LOAD_CHILDREN($this, event.data.data[sourceIndex].children, event.data.host);
				if(!$this.hasClass("onlyload"))
					this.openChildren($this);
				else
				{
					$this.removeClass("onlyload");
				}
			}
		}
	};
	
	/**
	 * 判断是否存在某种选择方式
	 * @param name
	 * @return
	 */
	Prototype.hasSelectMode = function (name) {
		if(this.selectMode)
			return $.inArray(name, this.selectMode.split("&")) != -1;
		else
		{
			return false;
		}
	};
	
	/**
	 * 
	 * @return
	 */
	Prototype.getSelectedList = function () {
		return $(this.parent).find("input.jqtree-ms-box[checked!='']").parent("span.jqtree-node").get();
	};
	
	/**
	 * 
	 * @return
	 */
	Prototype.getSelectedContentList = function () {
		return $(this.getSelectedList()).find("span.jqtree-node-content").get();
	};
	
	/**
	 * 取得选择的节点内容
	 * @return
	 */
	Prototype.getSelectedContent = function () {
		return this.parent.find("ul.jq-tree span.jqtree-node-content.selected:first").get(0);
	};
	
	/**
	 * 取得指定节点的上一个节点
	 */
	Prototype.getNodePrev = function (node) {
		return Tree.GET_SIBLING_PREV(node);
	};
	
	/**
	 * 取得指定节点的上一个节点内容
	 */
	Prototype.getNodePrevContent = function (node) {
		return Tree.GET_NODE_CONTENT(this.getNodePrev(node));
	};
	
	/**
	 * 取得当前节点的上一个节点
	 */
	Prototype.getPrev = function () {
		return Tree.GET_SIBLING_PREV(this.getSelected());
	};
	
	/**
	 * 取得当前节点的上一个节点内容
	 * @return
	 */
	Prototype.getPrevContent = function () {
		return Tree.GET_NODE_CONTENT(this.getPrev());
	};
	
	/**
	 * 取得当前节点的下一个节点
	 */
	Prototype.getNext = function () {
		return Tree.GET_SIBLING_NEXT(this.getSelected());
	};
	
	/**
	 * 取得当前节点的下一个节点内容
	 * @return
	 */
	Prototype.getNextContent = function () {
		return Tree.GET_NODE_CONTENT(this.getNext());
	};
	
	/**
	 * 移动节点
	 * @param {Object} node
	 * @param {Object} target
	 */
	Prototype.nodeMoveTo = function (node, target) {
		var $node = $(node);
		var $target = $(target);
		if($target.size() <= 0)
		{
			$target = $node;
			$node = Tree.GET_SIBLING_FIRST($node);
		}
		$target.after($node);
		this.updateClasses($(Tree.GET_MENU(node)));
		if(this.sortover)
			this.sortover(Tree.GET_NODE_CONTENT($node), Tree.GET_NODE_CONTENT(Tree.GET_SIBLING_PREV($node)));
	};
	
	/**
	 * 下移节点
	 * @param {Object} node
	 */
	Prototype.nodeMoveDown = function (node) {
		var $node = $(node);
		var nextMenu = $(Tree.GET_SIBLING_NEXT($node));
		if(nextMenu.size() == 0)
			return;
		this.nodeMoveTo($node, nextMenu);
	};
	
	/**
	 * 上移节点
	 * @param {Object} node
	 */
	Prototype.nodeMoveUp = function (node) {
		var $node = $(node);
		var prevMenu = $(Tree.GET_SIBLING_PREV($node));
		if(prevMenu.size() == 0)
			return;
		var targetMenu = $(Tree.GET_SIBLING_PREV(prevMenu));
		//交换一些class
		this.nodeMoveTo($node, targetMenu.size() > 0 ? targetMenu : null);
	};
	
	/**
	 * 上移当前节点
	 * @return
	 */
	Prototype.moveUp = function () {
		this.nodeMoveUp($(this.getSelected()));
	};
	
	/**
	 * 下移当前节点
	 * @return
	 */
	Prototype.moveDown = function () {
		this.nodeMoveDown($(this.getSelected()));
	};
	
	/**
	 * 删除当前选中节点
	 * @return
	 */
	Prototype.del = function () {
		Tree.DEL_NODE($(this.getSelected()));
	};
	
	/**
	 * 获取根目录
	 * @return
	 */
	Prototype.getRoot = function () {
		return $(this.parent).find("ul:first");
	};
	
	/**
	 * 取得一个目录的第一个节点
	 * @param node
	 * @return
	 */
	Prototype.getFirst = function (node) {
		return Tree.GET_FIRST_ITEM(node);
	};
	
	/**
	 * 取得一个目录下的第一个节点内容
	 * @param node
	 * @return
	 */
	Prototype.getFirstContent = function (node) {
		return Tree.GET_NODE_CONTENT(this.getFirst(node));
	};
	
	/**
	 * 取得一个目录的最后一个节点
	 * @param node
	 * @return
	 */
	Prototype.getLast = function (node) {
		return Tree.GET_LAST_ITEM(node);
	};
	
	/**
	 * 取得一个目录的最后一个节点内容
	 * @param node
	 * @return
	 */
	Prototype.getLastContent = function (node) {
		return Tree.GET_NODE_CONTENT(this.getLast(node));
	};
	
	/**
	 * 向根节点添加节点
	 * @param appendData
	 * @return
	 */
	Prototype.appendToRoot = function (appendData) {
		var root = this.getRoot();
		var lastItem = Tree.GET_LAST_ITEM(root);
		if(lastItem)
			this.insertTo(lastItem, appendData);
		else
		{
			this.doming({parent: this.parent.empty(), treeJson: [appendData], first: true});
		}
	};
	
	/**
	 * 向根节点插入节点
	 * @param insertData
	 * @return
	 */
	Prototype.insertToRoot = function (insertData) {
		var root = this.getRoot();
		var firstItem = Tree.GET_FIRST_ITEM(root);
		if(firstItem)
			this.insertTo(firstItem, insertData);
		else
		{
			this.doming({parent: this.parent.empty(), treeJson: [insertData], first: true});
		}
	};
	
	/**
	 * 给当前节点添加一个子节点
	 * @param appendData
	 * @return
	 */
	Prototype.appendChild = function (appendData) {
		var selected = this.getSelected();
		if(selected)
		{
			if($(selected).hasClass("jqtree-li-closed"))
				$(Tree.GET_NODE_SWITCH(selected)).trigger("click");
		}
		this.doming({
			parent: $(this.getSelected()),
			treeJson: [appendData],
			method: "append",
			bornShow: true
		});
	};
	
	/**
	 * 在当前选中节点插入新节点
	 * @param insertData
	 * @return
	 */
	Prototype.insert = function (insertData) {
		this.insertTo($(this.getSelected()), insertData);
	};
	
	/**
	 * 在当前选中节点后添加新节点
	 * @param appendData
	 * @return
	 */
	Prototype.append = function (appendData) {
		this.appendTo($(this.getSelected()), appendData);
	};
	
	/**
	 * 插入新节点
	 * @param insertData
	 * @return
	 */
	Prototype.insertTo = function (target, insertData) {
		this.doming({
			parent: target,
			treeJson: [insertData],
			method: "before",
			bornShow: true
		});
	};
	
	/**
	 * 添加新节点
	 * @param insertData
	 * @return
	 */
	Prototype.appendTo = function (target, insertData) {
		this.doming({
			parent: target,
			treeJson: [insertData],
			method: "after",
			bornShow: true
		});
	};
	
	/**
	 * 给当前选中节点插入子节点
	 * @param insertData
	 * @return
	 */
	Prototype.insertChild = function (insertData) {
		var selected = this.getSelected();
		if(selected)
		{
			if($(selected).hasClass("jqtree-li-closed"))
				$(Tree.GET_NODE_SWITCH(selected)).trigger("click");
		}
		this.doming({
			parent: $(selected),
			treeJson: [insertData],
			method: "prepend",
			bornShow: true
		});
	};
	
	/**
	 * 取得当前节点内容的父节点
	 * @return
	 */
	Prototype.getParent = function () {
		return Tree.GET_PARENT(this.getSelected());
	};
	
	/**
	 * 取得当前节点的父节点内容
	 * @return
	 */
	Prototype.getParentContent = function () {
		return Tree.GET_NODE_CONTENT(this.getParent());
	};
	
	/**
	 * 是一个节点失去焦点
	 * @param node
	 * @return
	 */
	Prototype.blur = function(node) {
		if(Tree.BLUR(node))
			if(this.onBlur)
				this.onBlur(node);
	};
	
	/**
	 * 选择一个节点
	 * @param node
	 * @return
	 */
	Prototype.select = function (node) {
		var $node = $(node);
		$node.addClass("selected");
		if(this.onSelect)
			this.onSelect(node);
	};
	
	/**
	 * 获取选择的节点
	 */
	Prototype.getSelected = function () {
		return Tree.GET_CUR_MENU(this.getSelectedContent());
	};
	
	/**
	 * 打开所有节点
	 */
	Prototype.openAll = function () {
		var closed = this.parent.find("span.op-area.closed");
		while(closed.size() > 0)
		{
			closed.trigger("click");
			closed = this.parent.find("span.op-area.closed");
		}
	};
	
	/**
	 * 关闭所有节点
	 */
	Prototype.closeAll = function () {
		var opened = this.parent.find("span.op-area.opened");
		for(var i = 0;i<opened.size();++i)
			this.closeChildren(opened.get(i));
	};
	
	/**
	 * json数据dom化
	 * @param parent
	 * @param treeJson
	 * @param first
	 * @param method 添加模式: after, before, append, prepend
	 * @param bornShow 节点生成后立即显示
	 * @return
	 */
	Prototype.doming = function (params) {
		if(!params.method)
			params.method = "append";
		params.parent = $(params.parent);
		var host = this;
		//是否只是为添加li节点，而不是添加整个ul.默认为添加整个ul。
		var addNode = false;
		if(params.method == "before" || params.method == "after")
			addNode = params.parent.parent("ul").size() > 0;
		else if(params.method == "append" || params.method == "prepend")
		{
			addNode = params.parent.children("ul:first").size() > 0;
		}
		var treeJsonSize = params.treeJson.length;
		var html;
		if(params.first)
			html = ["<ul class='jq-tree jqtree-" + this.SERIAL_NUMBER + "'>"];
		else if(addNode == false)
		{
			html = ["<ul class='children-tree'>"];
		}
		else
		{
			html = [];
		}
		//添加节点
		var finalDatas = [];
		for(var i=0;i<treeJsonSize;++i)
		{
			var pretreatment;
			if(this.pretreatment)
				pretreatment = this.pretreatment(params.treeJson[i], i);
			var data = pretreatment || params.treeJson[i];
			//读取远程数据
			if(params.treeJson[i].remote)
			{
				params.treeJson[i];
				var remote = params.treeJson[i].remote == true ? (this.remote ? this.remote : undefined) : params.treeJson[i].remote;
				if(remote.paramTemplate)
					remote.data = Tree.LOAD_TEMPLATE_DATA(params.treeJson[i], remote.paramTemplate);
				params.treeJson[i] = Tree.GET_REMOTEDATA(remote);
				delete params.treeJson[i].remote;
			}
			//设置远程子节点
			if(this.remoteChildren && params.treeJson[i].remoteChildren)
			{
				//如果有节点自定义设置的，取两个设置的并集.
				var finalSetting = {};
				$.extend(finalSetting, this.remoteChildren);
				if(params.treeJson[i].remoteChildren && params.treeJson[i].remoteChildren != true)
					$.extend(finalSetting, params.treeJson[i].remoteChildren);
				params.treeJson[i].children = finalSetting;
			}
			if(params.treeJson[i].children)
			{
				if(params.treeJson[i].children.paramTemplate)
				{
					params.treeJson[i].children.data = Tree.LOAD_TEMPLATE_DATA(params.treeJson[i], params.treeJson[i].children.paramTemplate);
					delete params.treeJson[i].remoteChildren;
				}
			}
			var classes = [];
			var id = "";
			if(data.children)
			{
				classes.push("jqtree-li-has-children");
				classes.push("jqtree-li-closed");
			}
			html.push("<li class='" + classes.join(" ") + "'>");
			classes = ["op-area"];
			if(data.children)
			{
				classes.push("jqtree-has-children");
				classes.push("closed unload");
				classes.push("source-index-" + i);
				if(this.childrenSwitch == "ico")
					html.push("<span class='" + classes.join(" ") + "'></span>");
			}
			html.push("<span class='jqtree-node'>");
			if(this.hasSelectMode("checkbox"))
			{
				if($(Tree.GET_CHECKBOX(params.parent)).attr("checked"))
					html.push("<input type='checkbox' checked='checked' class='jqtree-ms-box'/>");
				else
				{
					html.push("<input type='checkbox' class='jqtree-ms-box'/>");
				}
			}
			if(this.childrenSwitch == "node")
				html.push("<span class='jqtree-node-content " + classes.join(" ") + "' id='" + ( data.id ? data.id : "" ) + "'>" + data.content + "</span>");
			else
			{
				html.push("<span class='jqtree-node-content source-index-" + i + "' id='" + ( data.id ? data.id : "" ) + "'>" + data.content + "</span>");
			}
			html.push("</span>");
			html.push("</li>");
			finalDatas.push(data);
		}
		if(params.first || addNode == false)
			html.push("</ul>");
		var menu = $(html.join(""));
		//取消节点事件传递&添加节点打开事件
		var clickSpan = menu.find("span").live("click", stopPropagation)
		.filter(".jqtree-has-children").bind("click", {data: finalDatas, host: host}, function (event) {
			 host.switchShowChildren(event, this);
		});
		if(this.allOpen)
			clickSpan.trigger("click");
		//判断节点内容区域是否需要被元数据附着
		if(this.sourceQuote)
			menu.find("span.jqtree-node-content").each(function () {
				var sourceIndex = REG_EXP.SOURCE_INDEX_CLASSNAME.exec(this.className);
				if(sourceIndex) {
					$(this).data("source", params.treeJson[sourceIndex[0].split("-")[2]]);
				}
			});
		var lis;
		if(!params.first && !params.bornShow)
			menu.hide();
		if(addNode)
		{
			if(params.method == "append" || params.method == "prepend")
				eval("params.parent.children('ul:first')." + params.method + "(menu)");
			else if(params.method == "before" || params.method == "after")
			{
				eval("params.parent." + params.method + "(menu);");
			}
			lis = menu.parents("ul:first").children("li");
		}
		else
		{
			//添加整个ul
			//添加整个ul的时候，不存在prepend的情况
			if(params.method == "prepend")
				params.method = "append";
			eval("params.parent." + params.method + "(menu);");
			if(!params.first)
				params.parent.addClass("jqtree-li-has-children jqtree-li-closed");
			//如果没有操作区域，添加上.
			if(params.parent.children(".op-area").size() <= 0 && this.childrenSwitch == "ico" && !params.first)
			{
				var opSpan = $("<span class='op-area jqtree-has-children opened source-index-0'></span>");
				params.parent.prepend(opSpan);
				opSpan.bind("click", {data: finalDatas, host: host}, function (event) {
					 host.switchShowChildren(event, this);
				}).data("loaded", true);
			}
			lis = menu.children("li");
		}
		//如果为多选模式，子元素不能延迟加载。
		if($(Tree.GET_CHECKBOX(params.parent)).attr("checked"))
			Tree.LOAD_ALL_CHILDREN(menu, finalDatas, host);
		//多选框处理
		if(this.hasSelectMode("checkbox"))
		{
			menu.find("input.jqtree-ms-box").bind("click", function () {
				Tree.LOAD_ALL_CHILDREN(this, finalDatas, host);
				var curMenu = Tree.GET_CUR_MENU(this);
				var childrenCheckbox = curMenu.find("input.jqtree-ms-box");
				var $this = $(this);
				if($this.attr("checked"))
					childrenCheckbox.attr("checked", true);
				else
				{
					var parentCheckbox = $(Tree.GET_CHECKBOX(Tree.GET_PARENT(curMenu)));
					while(parentCheckbox.size() > 0)
					{
						parentCheckbox.removeAttr("checked");
						parentCheckbox = $(Tree.GET_CHECKBOX(Tree.GET_PARENT(Tree.GET_CUR_MENU(parentCheckbox))));
					}
					childrenCheckbox.removeAttr("checked");
				}
			});
		}
		//处理首尾节点class
		lis.removeClass("jqtree-last li.jqtree-first");
		lis.first().addClass("jqtree-first");
		lis.last().removeClass("jqtree-first").addClass("jqtree-last");
	};
	
	//以下为事件函数
	/**
	 * 停止冒泡传递
	 * @param {Object} event
	 */
	function stopPropagation(event) {
		event.stopPropagation();
	};
})(jQuery);