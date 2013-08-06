/**
 * @name Uploader.js
 * @author Jiang
 * @create	2012-12-20
 * @version 0.1
 * @description	The Annouse funtion for HTML5/FLASH/FORM upload method. The
 * 	function will autoly to choose the property method to ajust to client
 *  Browswer. This js function mainly borrow from youku.com's uploader.min.js
 *  and try to re-create it for fullfiting my requirement. 
 * @example
 * 		1. new Uploader();
 * 		2. var cfg = {
 * 				fileFilterFunction : function(){alert("fileFilterFunction")}
 * 				fileFieldName : "FileData"
 * 			};
 * 		   new Uploader(cfg);
 */ 
(function(){
	var Provider, aFilters = [], nIdCount = 0, aOtherBrowsers = ["Maxthon", "SE 2.X", "QQBrowser"];
	
	function fGenerateId(prefix) {
		var b = (new Date).getTime() + "_01v_" + ++nIdCount;
		return prefix ? prefix + "_" + b : b;
	}
	function fExtend(a, b){
		var c = 2 < arguments.length ? [arguments[2]] : null;
		return function(){
			var d = "string" === typeof a ? b[a] : a,e=c ? [arguments[0]].concat(c) : arguments;
			return d.apply(b||d, e);
		};
	}
	
	function fAddEventListener(a, b, c) {
		a.addEventListener ? a.addEventListener(b, c, !1) : a.attachEvent ? a
				.attachEvent("on" + b, c) : a["on" + b] = c;
	}
	
	function fToString(a) {
		var b = {
			"undefined" : "undefined",
			number : "number",
			"boolean" : "boolean",
			string : "string",
			"[object Function]" : "function",
			"[object RegExp]" : "regexp",
			"[object Array]" : "array",
			"[object Date]" : "date",
			"[object Error]" : "error"
		};
		return b[typeof a] || b[Object.prototype.toString.call(a)] || (a ? "object" : "null");
	}
	
	function fHasClass(element, klass) {
		return RegExp("(^| )" + klass + "( |$)").test(element.className);
	}
	function fContains(container, klass) {
		if (!container)
			return [];
		if (container.querySelectorAll)
			return container.querySelectorAll("." + klass);
		for (var c = [], eles = container.getElementsByTagName("*"), e = eles.length, f = 0; f < e; f++)
			fHasClass(eles[f], klass) && c.push(eles[f]);
		return c;
	}
	
	function fCreateContentEle(content) {
		var b = document.createElement("div");
		b.innerHTML = content;
		content = b.childNodes;
		return content[0].parentNode.removeChild(content[0]);
	}
	
	function fIsObjOrFun(a, b) {
		var c = typeof a;
		return a && ("object" === c || !b && ("function" === c || "function" === fToString(a))) || !1;
	}
	function fIsNumber(val) {
		return "number" === typeof val && isFinite(val);
	}
	function fIsArray(val) {
		return "array" === fToString(val);
	}
	
	/**
	 * This function is for registering the function(s) on its prototype.
	 * @hostPrototype	which is its host prototype.
	 * @funs	functions, such as{aa:function(){}, bb:function(){}}
	 * @forseReg	boolean: when the @hostPrototype don't have the function, then register it.
	 * 		true: do it, ignore the @hostPrototype whether has it.
	 * 		false: when not have it so that register it.
	 */
	function fRegFuns(hostPrototype, funs, forseReg, d) {
		var e, f, g;
		if (!hostPrototype || !funs)
			return hostPrototype || {};
		if (d)
			for (e = 0, g = d.length; e < g; ++e)
				f = d[e], Object.prototype.hasOwnProperty.call(funs, f)	&& (forseReg || !(f in hostPrototype)) && (hostPrototype[f] = funs[f]);
		else {
			for (f in funs)
				Object.prototype.hasOwnProperty.call(funs, f) && (forseReg || !(f in hostPrototype)) && (hostPrototype[f] = funs[f]);
			({valueOf : 0}).propertyIsEnumerable("valueOf")	|| fRegFuns(hostPrototype, funs, forseReg, "hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toString,toLocaleString,valueOf".split(","));
		}
		return hostPrototype;
	}
	
	function fRegEvents() {
		fRegFuns(this.constructor.prototype, {
					publish : function(a) {
						this._evts[a] || (this._evts[a] = null);
					},
					on : function(a, b, c) {
						var d = this._evts;
						d[a] = {};
						d[a].type = a;
						this.name && (d[a].type = this.name + ":" + a);
						d[a].fn = function() {
							b.apply(c, arguments);
						};
					},
					after : function(a, b, c) {
						this.on(a, b, c);
					},
					fire : function(a) {
						var b = this._evts[a];
						if (b) {
							var c = {target : this,	type : b.type},
								d = Array.prototype.slice.call(arguments, 1);
							if (fIsObjOrFun(d[0]))
								for (var e in c)
									d[0][e]	? d[0]["_" + e] = c[e] : d[0][e] = c[e];
							else
								d[0] = c;
							"function" === fToString(b.fn) && b.fn.apply(this, d);
						}
					},
					detach : function(a) {
						delete this._evts[a];
					}
				}, !1);
		this._evts = {};
	}
	
	
	function Parent(args) {
		fRegEvents.call(this);
		this._isApplySuperClass || fRegFuns(this.constructor.prototype, Parent.prototype, !1);
		if (args) {
			for (var field in args)
				this.set(field, args[field]);
		}
		"function" === typeof this.initializer && this.initializer.apply(this, arguments);
	}
	Parent.prototype = {
		_isApplySuperClass : !0,
		initializer : function() {
		},
		get : function(key) {
			return this.config[key];
		},
		set : function(key, val) {
			var c;
			key && "undefined" !== typeof val && key in this.config	&& (this.config[key] = val, c = key + "Change", this._evt && c in this._evt.events && this.fire(c));
		}
	};
	
	function SWFReference(a, b, c) {
		fRegEvents.call(this);
		var d = this._id = fGenerateId("uploader-swf"), c = c || {}, e = ((c.version || sFlashVersion) + "").split("."),
			e = SWFReference.isFlashVersionAtLeast(parseInt(e[0], 10), parseInt(e[1], 10), parseInt(e[2], 10)),
			f = SWFReference.isFlashVersionAtLeast(8, 0, 0) && !e && c.useExpressInstall,
			g = f ? sFlashDownload : b, 
			b = "<object ", h = "&SWFId=" + d + "&callback=" + sFlashEventHandler + "&allowedDomain=" + document.location.hostname;
		SWFReference._instances[d] = this;
		if (a && (e || f) && g) {
			b += 'id="' + d + '" ';
			b = Browser.ie ? b + ('classid="' + sIEFlashClassId + '" ') : b
					+ ('type="' + sShockwaveFlash + '" data="' + g + '" ');
			b += 'width="100%" height="100%">';
			Browser.ie && (b += '<param name="movie" value="' + g + '"/>');
			for (var j in c.fixedAttributes)
				oa.hasOwnProperty(j)
						&& (b += '<param name="' + j + '" value="' + c.fixedAttributes[j] + '"/>');
			for (var s in c.flashVars)
				j = c.flashVars[s], "string" === typeof j
						&& (h += "&" + s + "=" + encodeURIComponent(j));
			h && (b += '<param name="flashVars" value="' + h + '"/>');
			a.innerHTML = b + "</object>";
			this.swf = document.getElementById(d);
		} else
			this.publish("wrongflashversion", {fireOnce : !0}), this.fire("wrongflashversion", {type : "wrongflashversion"});
	}
	
	SWFReference.getFlashVersion = function() {
		return "" + Browser.flashMajor + "." + ("" + Browser.flashMinor) + "." + ("" + Browser.flashRev);
	};
	SWFReference.isFlashVersionAtLeast = function(a, b, c) {return true;
		/*var d = parseInt(Browser.flashMajor, 10), e = parseInt(Browser.flashMinor, 10), f = parseInt(
				Browser.flashRev, 10), a = parseInt(a || 0, 10), b = parseInt(b || 0,
				10), c = parseInt(c || 0, 10);
		return a === d ? b === e ? c <= f : b < e : a < d;*/
	};
	SWFReference._instances = SWFReference._instances || {};
	SWFReference.eventHandler = function(a, b) {SWFReference._instances[a]._eventHandler(b);};
	SWFReference.prototype = {
		initializer : function() {},
		_eventHandler : function(a) {
			"swfReady" === a.type ? (this.publish("swfReady", {fireOnce : !0}), this.fire("swfReady", a))
								: "log" !== a.type && this.fire(a.type, a);
		},
		callSWF : function(a, b) {
			b || (b = []);
			return this.swf[a] ? this.swf[a].apply(this.swf, b) : null;
		},
		toString : function() {return "SWF " + this._id;}
	};
	SWFReference.prototype.constructor = SWFReference;
	
	function SWFProvider(a) {
		this.swfContainerId = fGenerateId("uploader");
		this.queue = this.swfReference = null;
		this.buttonState = "up";
		this.config = {
			enabled : !0,
			multipleFiles : !0,
			appendNewFiles : !0,
			fileFilterFunction : null,
			buttonClassNames : {
				hover : "uploader-button-hover",
				active : "uploader-button-active",
				disabled : "uploader-button-disabled",
				focus : "uploader-button-selected"
			},
			containerClassNames : {hover : "uphotBg"},
			fileFilters : aFilters,
			fileFieldName : "FileData",
			simLimit : 1,
			retryCount : 3,
			postVarsPerFile : {},
			selectButtonLabel : "\u9009\u62e9\u6587\u4ef6",
			swfURL : "/swf/FlashUploader.swf",
			uploadURL : "/upload"
		};
		Parent.apply(this, arguments);
	}
	SWFProvider.prototype = {
		constructor : SWFProvider,
		name : "uploader",
		buttonState : "up",
		swfContainerId : null,
		swfReference : null,
		queue : null,
		initializer : function() {
			this.publish("fileselect");
			this.publish("uploadstart");
			this.publish("fileuploadstart");
			this.publish("uploadprogress");
			this.publish("totaluploadprogress");
			this.publish("uploadcomplete");
			this.publish("alluploadscomplete");
			this.publish("uploaderror");
			this.publish("mouseenter");
			this.publish("mouseleave");
			this.publish("mousedown");
			this.publish("mouseup");
			this.publish("click");
		},
		render : function(a) {
			a && (this.renderUI(a), this.bindUI());
		},
		renderUI : function(a) {
			this.contentBox = a;
			this.contentBox.style.position = "relative";
			var b = fCreateContentEle("<div id='" + this.swfContainerId + "' style='position:absolute;top:0px; left: 0px; margin: 0; padding: 0; border: 0; width:100%; height:100%'></div>");
			b.style.width = a.offsetWidth + "px";
			b.style.height = a.offsetHeight + "px";
			this.contentBox.appendChild(b);
			this.swfReference = new SWFReference(b, this.get("swfURL"), {
						version : "10.0.45",
						fixedAttributes : {
							wmode : "transparent",
							allowScriptAccess : "always",
							allowNetworking : "all",
							scale : "noscale"
						}
					});
		},
		bindUI : function() {
			this.swfReference.on("swfReady", function() {
						this.setMultipleFiles();
						this.setFileFilters();
						this.triggerEnabled();
						this.after("multipleFilesChange", this.setMultipleFiles, this);
						this.after("fileFiltersChange", this.setFileFilters, this);
						this.after("enabledChange", this.triggerEnabled, this);
					}, this);
			this.swfReference.on("fileselect", this.updateFileList, this);
			this.swfReference.on("mouseenter", function() {this.setContainerClass("hover", !0);}, this);
			this.swfReference.on("mouseleave", function() {this.setContainerClass("hover", !1);}, this);
		},
		setContainerClass : function(a, b) {
			b ? n(this.contentBox, this.get("containerClassNames")[a]) : p(
					this.contentBox, this.get("containerClassNames")[a]);
		},
		setFileFilters : function() {
			this.swfReference && 0 < this.get("fileFilters").length
					&& this.swfReference.callSWF("setFileFilters", [this.get("fileFilters")]);
		},
		setMultipleFiles : function() {
			this.swfReference && this.swfReference.callSWF("setAllowMultipleFiles", [this.get("multipleFiles")]);
		},
		triggerEnabled : function() {
			this.get("enabled")
					? (this.swfReference.callSWF("enable"), this.swfReference.swf.setAttribute("aria-disabled", "false"))
					: (this.swfReference.callSWF("disable"), this.swfReference.swf.setAttribute("aria-disabled", "true"))
		},
		updateFileList : function(a) {
			this.swfReference.swf.focus();
			for (var a = a.fileList, b = [], c = this.swfReference, d = 0; d < a.length; d++) {
				var e = {};
				e.id = a[d].fileId;
				e.name = a[d].fileReference.name;
				e.size = a[d].fileReference.size;
				e.type = a[d].fileReference.type;
				e.dateCreated = a[d].fileReference.creationDate;
				e.dateModified = a[d].fileReference.modificationDate;
				e.uploader = c;
				b.push(new SWFUploader(e));
			}
			0 < b.length && this.fire("fileselect", {fileList : b});
		},
		uploadEventHandler : function(a) {
			switch (a.type) {
				case "executor:uploadstart" :
					this.fire("fileuploadstart", a);
					break;
				case "executor:uploadprogress" :
					this.fire("uploadprogress", a);
					break;
				case "uploaderqueue:totaluploadprogress" :
					this.fire("totaluploadprogress", a);
					break;
				case "executor:uploadcomplete" :
					this.fire("uploadcomplete", a);
					break;
				case "uploaderqueue:alluploadscomplete" :
					this.queue = null;
					this.fire("alluploadscomplete", a);
					break;
				case "executor:uploaderror" :
				case "uploaderqueue:uploaderror" :
					this.fire("uploaderror", a);
					break;
				case "executor:uploadcancel" :
				case "uploaderqueue:uploadcancel" :
					this.fire("uploadcancel", a);
			}
		},
		upload : function(uploader, url, c) {
			var url = url || this.get("uploadURL"), postVars = postVars || this.get("postVarsPerFile"), id = uploader.id,
				postVars = postVars.hasOwnProperty(id) ? postVars[id] : postVars;
			uploader instanceof SWFUploader
					&& (uploader.on("uploadstart", this.uploadEventHandler, this),
						uploader.on("uploadprogress", this.uploadEventHandler, this),
						uploader.on("uploadcomplete", this.uploadEventHandler, this),
						uploader.on("uploaderror", this.uploadEventHandler, this),
						uploader.on("uploadcancel", this.uploadEventHandler, this),
						uploader.startUpload(url, postVars, this.get("fileFieldName")));
		}
	};
	
	function SWFUploader(a) {
		this.bytesSpeed = this.bytesPrevLoaded = 0;
		this.bytesSpeeds = [];
		this.preTime = this.remainTime = 0;
		this.config = {
			id : "",
			name : "",
			size : "",
			type : "",
			dateCreated : "",
			dateModified : "",
			uploader : ""
		};
		Parent.apply(this, arguments);
	}	
	SWFUploader.prototype = {
		constructor : SWFUploader,
		name : "executor",
		initializer : function() {
			this.id = fGenerateId("file");
		},
		swfEventHandler : function(a) {
			if (a.id === this.get("id"))
				switch (a.type) {
					case "uploadstart" :
						this.fire("uploadstart", {uploader : this.get("uploader")});
						break;
					case "uploadprogress" :
						var b = (new Date).getTime(), c = (b - this.preTime) / 1E3, d = 0;
						if (1 <= c || 0 == this.bytesPrevLoaded) {
							this.bytesSpeed = Math.round((a.bytesLoaded - this.bytesPrevLoaded) / c);
							this.bytesPrevLoaded = a.bytesLoaded;
							this.preTime = b;
							5 < this.bytesSpeeds.length && this.bytesSpeeds.shift();
							this.bytesSpeeds.push(this.bytesSpeed);
							for (b = 0; b < this.bytesSpeeds.length; b++)
								d += this.bytesSpeeds[b];
							this.bytesSpeed = Math.round(d / this.bytesSpeeds.length);
							this.remainTime = Math.ceil((a.bytesTotal - a.bytesLoaded) / this.bytesSpeed);
						}
						this.fire("uploadprogress", {
									originEvent : a,
									bytesLoaded : a.bytesLoaded,
									bytesSpeed : this.bytesSpeed,
									bytesTotal : a.bytesTotal,
									remainTime : this.remainTime,
									percentLoaded : Math.min(100, Math.round(1E4 * a.bytesLoaded / a.bytesTotal) / 100)
								});
						break;
					case "uploadcomplete" :
						this.fire("uploadfinished", {originEvent : a});
						break;
					case "uploadcompletedata" :
						this.fire("uploadcomplete", {
									originEvent : a,
									data : a.data
								});
						break;
					case "uploadcancel" :
						this.fire("uploadcancel", {originEvent : a});
						break;
					case "uploaderror" :
						this.fire("uploaderror", {
									originEvent : a,
									status : a.status,
									statusText : a.message,
									source : a.source
								});
				}
		},
		startUpload : function(url, postVars, fileFieldName) {
			if (this.get("uploader")) {
				var uploader = this.get("uploader"), fileFieldName = fileFieldName || "FileData", id = this.get("id"), postVars = postVars || null;
				uploader.on("uploadstart", this.swfEventHandler, this);
				uploader.on("uploadprogress", this.swfEventHandler, this);
				uploader.on("uploadcomplete", this.swfEventHandler, this);
				uploader.on("uploadcompletedata", this.swfEventHandler, this);
				uploader.on("uploaderror", this.swfEventHandler, this);
				this.remainTime = this.bytesSpeed = this.bytesPrevLoaded = 0;
				this.bytesSpeeds = [];
				if (!this.preTime)
					this.preTime = (new Date).getTime();
				uploader.callSWF("upload", [id, url, postVars, fileFieldName]);
			}
		},
		cancelUpload : function() {
			this.get("uploader") 
				&& (this.get("uploader").callSWF("cancel", [this.get("id")]), this.fire("uploadcancel"));
		}
	};
	
	function StreamProvider(a) {
		this.buttonBinding = this.queue = this.fileInputField = null;
		this.config = {
			enabled : !0,
			multipleFiles : !0,
			appendNewFiles : !0,
			fileFilterFunction : null,
			dragAndDropArea : "",
			fileFilters : aFilters,
			fileFieldName : "FileData",
			simLimit : 1,
			retryCount : 3,
			postVarsPerFile : {},
			selectButtonLabel : "\u9009\u62e9\u6587\u4ef6",
			uploadURL : "/upload"
		};
		Parent.apply(this, arguments);
	}
	StreamProvider.prototype = {
		constructor : StreamProvider,
		name : "stream_provider",
		initializer: function(){
			this.publish("fileselect");
			this.publish("uploadstart");
			this.publish("fileuploadstart");
			this.publish("uploadprogress");
			this.publish("totaluploadprogress");
			this.publish("uploadcomplete");
			this.publish("alluploadscomplete");
			this.publish("uploaderror");
			this.publish("dragenter");
			this.publish("dragover");
			this.publish("dragleave");
			this.publish("drop");
		},
		render : function(a) {
			a && (this.renderUI(a), this.bindUI());
		},
		renderUI : function(a) {
			this.contentBox = a;
			this.fileInputField = fCreateContentEle("<input type='file' style='visibility:hidden; width:0px; height: 0px;'>");
			this.contentBox.appendChild(this.fileInputField);
		},
		bindUI : function() {
			this.bindSelectButton();
			//this.setMultipleFiles();
			//this.setFileFilters();
			//this.bindDropArea();
			//this.triggerEnabled();
			//this.after("multipleFilesChange", this.setMultipleFiles, this);
			//this.after("fileFiltersChange", this.setFileFilters, this);
			//this.after("enabledChange", this.triggerEnabled, this);
			//this.after("dragAndDropAreaChange", this.bindDropArea, this);
			fAddEventListener(this.fileInputField, "change", fExtend(this.updateFileList, this));
		},
		bindDropArea : function() {
			var a = this.get("dragAndDropArea");
			null !== a	&& (fAddEventListener(a, "drop", fExtend(this.ddEventHandler, this)),
							fAddEventListener(a, "dragenter", fExtend(this.ddEventHandler, this)),
							fAddEventListener(a, "dragover", fExtend(this.ddEventHandler, this)),
							fAddEventListener(a, "dragleave", fExtend(this.ddEventHandler, this)));
		},
		rebindFileField : function() {
			this.fileInputField.parentNode.removeChild(this.fileInputField);
			this.fileInputField = fCreateContentEle("<input type='file' style='visibility:hidden; width:0px; height: 0px;'>");
			this.contentBox.appendChild(this.fileInputField);
			//this.setMultipleFiles();
			//this.setFileFilters();
			fAddEventListener(this.fileInputField, "change", fExtend(this.updateFileList, this));
		},
		bindSelectButton : function() {
			this.buttonBinding = fExtend(this.openFileSelectDialog, this);
			fAddEventListener(this.contentBox, "click", this.buttonBinding);
		},
		triggerEnabled : function() {
			if (this.get("enabled") && null === this.buttonBinding)
				this.bindSelectButton(), this.setButtonClass("disabled", !1);
			else if (!this.get("enabled") && this.buttonBinding)
				U(this.contentBox, "click", this.buttonBinding),
				this.buttonBinding = null,
				this.setButtonClass("disabled", !0);
		},
		updateFileList : function(a) {
			for (var a = a.target.files, b = [], c = 0; c < a.length; c++)
				b.push(new StreamUploader(a[c]));
			0 < b.length && this.fire("fileselect", {fileList : b});
			this.rebindFileField();
		},
		openFileSelectDialog : function(a) {
			this.fileInputField.click && a.target != this.fileInputField && this.fileInputField.click();
		},
		uploadEventHandler : function(a) {
			switch (a.type) {
				case "executor:uploadstart" :
					this.fire("fileuploadstart", a);
					break;
				case "executor:uploadprogress" :
					this.fire("uploadprogress", a);
					break;
				case "uploaderqueue:totaluploadprogress" :
					this.fire("totaluploadprogress", a);
					break;
				case "executor:uploadcomplete" :
					this.fire("uploadcomplete", a);
					break;
				case "uploaderqueue:alluploadscomplete" :
					this.queue = null;
					this.fire("alluploadscomplete", a);
					break;
				case "executor:uploaderror" :
				case "uploaderqueue:uploaderror" :
					this.fire("uploaderror", a);
					break;
				case "executor:uploadcancel" :
				case "uploaderqueue:uploadcancel" :
					this.fire("uploadcancel", a);
			}
		},
		upload : function(uploader, url, postVars) {
			var url = url || this.get("uploadURL"), postVars = postVars || this.get("postVarsPerFile"),
				d = uploader.id, postVars = postVars.hasOwnProperty(d) ? postVars[d] : postVars;
			uploader instanceof StreamUploader
					&& (uploader.on("uploadstart", this.uploadEventHandler, this),
						uploader.on("uploadprogress", this.uploadEventHandler, this),
						uploader.on("uploadcomplete", this.uploadEventHandler, this),
						uploader.on("uploaderror", this.uploadEventHandler, this),
						uploader.on("uploadcancel", this.uploadEventHandler, this),
						uploader.startUpload(url, postVars, this.get("fileFieldName")));
		}
	};
	
	var StreamUploader = function(){
		this.remainTime = this.bytesSpeed = this.bytesStart = this.bytesPrevLoaded = 0;
		this.bytesSpeeds = [];
		this.retryTimes = this.preTime = 0;
		this.config = {
			id : "",
			name : "",
			size : "",
			type : "",
			dateCreated : "",
			dateModified : "",
			uploader : "",
			uploadURL : "",
			serverAddress : "",
			portionSize : 10485760,
			parameters : {},
			fileFieldName : "FileData",
			uploadMethod : "formUpload"
		};
		Parent.apply(this, arguments);
	};
	StreamUploader.isValidFile = function(a) {return "undefined" != typeof File && a instanceof File;};
	StreamUploader.canUpload = function() {return "undefined" != typeof FormData;};
	StreamUploader.prototype = {
		constructor : StreamUploader,
		name: "executor",
		initializer: function(file){
			this.XHR = null;
			this.retryTimes = 50;
			this.retriedTimes = 0;
			this.cancelUpload = false;
			this.uploadAction= "/upload?";
			this.queryAction= "/lookup?";
			this.keyField = "key";
			this.keyValue = null;
			this.file = null;
			this.fileId = null;
			this.fileNameField = "name";
			this.fileNameValue = null;
			this.filePiece = 10485760;/** 10M. */
			this.fileSizeValue = 0;
			this.fileStartPosValue = null;
			
			this.maxPiece = 10485760; // 10M
			this.startTime = null;
			this.endTime = null;
			this.durationTime = 2000;
			this.xhrHandler = null;
			
			var b = StreamUploader.isValidFile(file) ? file : StreamUploader.isValidFile(file.file)	? file.file	: !1;
			this.get("id") || this.set("id", fGenerateId("file"));
			if (b && StreamUploader.canUpload()) {
				if (!this.file)
					this.file = b;
				this.get("name") || this.set("name", b.name || b.fileName);
				if (this.get("size") != (b.size || b.fileSize))
					this.set("size", b.size || b.fileSize);
				this.get("type") || this.set("type", b.type);
				b.lastModifiedDate && !this.get("dateModified")	&& this.set("dateModified", b.lastModifiedDate);
			}
		},
		resetXHR: function(){
			if(this.XHR){
				try{
					this.XHR.upload.removeEventListener("progress", this.xhrHandler),
					this.XHR.upload.removeEventListener("error", this.xhrHandler),
					this.XHR.upload.removeEventListener("abort", this.xhrHandler),
					this.XHR.removeEventListener("loadend", this.xhrHandler),
					this.XHR.removeEventListener("error", this.xhrHandler),
					this.XHR.removeEventListener("abort", this.xhrHandler),
					this.XHR.removeEventListener("readystatechange", this.xhrHandler);
				}catch(e){throw e;}
				this.XHR = null;
			}
		},
		streamUpload: function(pos){
			/** whether continue uploading. */
			if(eval(this.cancelUpload)) {return;}
			var _url = this.uploadAction + this.keyField + "=" + this.keyValue +
						"&" + this.fileNameField + "=" + encodeURIComponent(this.get("name"));
			this.resetXHR();
			this.resume = false;
			this.bytesStart = pos;
			this.XHR = new XMLHttpRequest;
			this.xhrHandler = fExtend(this.uploadEventHandler, this);
			//register callback function
			var xhr = this.XHR, upload = xhr.upload;
			xhr.addEventListener("loadstart", this.xhrHandler, !1);
			upload.addEventListener("progress", this.xhrHandler, !1);
			xhr.addEventListener("load", this.xhrHandler, !1);
			xhr.addEventListener("error", this.xhrHandler, !1);
			upload.addEventListener("error", this.xhrHandler, !1);
			upload.addEventListener("abort", this.xhrHandler, !1);
			xhr.addEventListener("abort", this.xhrHandler, !1);
			xhr.addEventListener("loadend", this.xhrHandler, !1);
			xhr.addEventListener("readystatechange", this.xhrHandler, !1);
			var blob = this.sliceFile(this.file, pos, pos + this.filePiece);
			var range = "bytes "+ pos + "-"+ (pos + blob.size) + "/" + this.get("size");
			//set connection parameters
			this.startTime = new Date();
			xhr.open("POST", _url, !0);
			xhr.setRequestHeader("Content-Range", range);
			xhr.send(blob);
			0 === pos && this.fire("uploadstart", {xhr : xhr});
		},
		resumeUpload: function(){
			/** whether continue uploading. */
			if(eval(this.cancelUpload) || this.retryTimes <= this.retriedTimes) {return;}
			this.resetXHR();
			this.XHR = new XMLHttpRequest;
			this.resume = true;
			var _url = this.queryAction + this.keyField + "=" + this.keyValue;
			this.xhrHandler = fExtend(this.uploadEventHandler, this);
			this.XHR.addEventListener("loadstart", this.xhrHandler, !1);
			this.XHR.addEventListener("load", this.xhrHandler, !1);
			this.XHR.addEventListener("abort", this.xhrHandler, !1);
			this.XHR.addEventListener("error", this.xhrHandler, !1);
			this.XHR.addEventListener("loadend", this.xhrHandler, !1);
			this.XHR.addEventListener("readystatechange", this.xhrHandler, !1);
			this.XHR.open("GET", _url, !0);
			this.XHR.send(null);
		},
		retry: function(){
			if(eval(this.cancelUpload) || this.retryTimes <= this.retriedTimes) {return;}
            this.retriedTimes++;
            var g = this;
            2 > this.retriedTimes ? this.resumeUpload()
            					: (this.timeoutHandler && clearTimeout(this.timeoutHandler), this.timeoutHandler = setTimeout(function() {g.resumeUpload()}, 1E4));
			alert("==retry==");
		},
		uploadEventHandler: function(event){
			var xhr = this.XHR;
			switch(event.type){
				case "load":
					this.endTime = new Date();
					
					var uploaded = 0;
					var respJson = null;
					if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 308)) {
						uploaded = (respJson = eval("(" + xhr.responseText + ")")) ? respJson.start : -1;
					} else {alert("--return--:\n" + xhr.responseText);return;}
					//check whether upload complete yet
					if(uploaded < this.get("size") -1) {
						this.retriedTimes = 0;
						/** StreamUploader request is over and mark the date. */
						this.streamUpload(uploaded);
					} else {
						this.fire("uploadcomplete", {originEvent : event, data : event.target.responseText});
					}
					break;
				case "error":
					xhr = null;
					this.retry();
					break;
				case "abort":
					this.fire("uploadcancel", {originEvent : event});
					break;
				case "progress":
					var total = this.get("size"), loaded = this.bytesStart + event.loaded,
						d = (new Date).getTime(), remainSeconds = (d - this.preTime) / 1E3, f = 0;
					if (1 <= remainSeconds || 0 === this.bytesSpeeds.length) {
						this.bytesSpeed = Math.round((loaded - this.bytesPrevLoaded) / remainSeconds);
						this.bytesPrevLoaded = loaded;
						this.preTime = d;
						5 < this.bytesSpeeds.length && this.bytesSpeeds.shift();
						this.bytesSpeeds.push(this.bytesSpeed);
						for (d = 0; d < this.bytesSpeeds.length; d++)
							f += this.bytesSpeeds[d];
						this.bytesSpeed = Math.round(f / this.bytesSpeeds.length);
						this.remainTime = Math.ceil((total - loaded) / this.bytesSpeed);
					}
					this.fire("uploadprogress", {
								originEvent : event,
								bytesLoaded : loaded,
								bytesTotal : total,
								bytesSpeed : this.bytesSpeed,
								remainTime : this.remainTime,
								percentLoaded : Math.min(100, Math.floor(1E4 * loaded / total) / 100)
							});
					break;
				case "readystatechange":
					this.fire("readystatechange", {readyState : event.target.readyState, originEvent : event});
			}
		},
		startUpload: function(url, postVars, fileFieldName){
			this.fileStartPosValue = null;
			this.retriedTimes = 0;
			this.cancelUpload = false;

			/** default code: */
			this.keyValue = "_lllllllllllllllllll000ll";
			/** start the request the backend data. */
			this.resumeUpload();
		},
		stopUpload: function(){
			this.cancelUpload = true;
			try{
				this.XHR.abort();
				this.resetXHR();
			}catch(e){}
		},
		sliceFile: function(f, startPos, endPos){
			startPos = startPos || 0;
			endPos = endPos || 0;
			return f.slice ? f.slice(startPos, endPos) : f.webkitSlice ? f.webkitSlice(startPos, endPos) : f.mozSlice ? f.mozSlice(startPos, endPos) : f;
		}
	};
	
	function Main(cfg){
		this.uploadInfo = {};
		this.config = {
			enabled : !0,
			multipleFiles : !1,
			appendNewFiles : !1,
			fileFilterFunction : cfg ? cfg.fileFilterFunction : null,
			fileFieldName : "FileData",
			uploadedFunc : cfg ? cfg.uploadedFunc : null,
			simLimit : 3,
			retryCount : 3,
			postVarsPerFile : {},
			selectButtonLabel : "\u9009\u62e9\u6587\u4ef6",
			swfURL : cfg && cfg.swfURL ? cfg.swfURL : "/swf/FlashUploader.swf",
			uploadURL : "/upload"
		};
		Parent.apply(this, arguments);
	}
	Main.applyTo = function(a, b) {
		if (!a || "SWF.eventHandler" != a)
			return null;
		try {
			return SWFReference.eventHandler.apply(SWFReference, b);
		} catch (c) {
			return null;
		}
	};
	Main.prototype = {
		constructor : Main,
		name : "uploader",
		initializer : function() {
			this.startPanel = document.getElementById("upload-start");
			this.containerPanel = document.getElementById("upload-container");
			this.template = document.getElementById("upload-template").innerHTML;
			this.layer = null;//new ba;
			this.fileProvider = new Provider(this.config);
			this.fileProvider.render(this.startPanel);
			this.fileProvider.on("uploadprogress", this.uploadProgress, this);
			this.fileProvider.on("uploadcomplete", this.uploadComplete, this);
			this.fileProvider.on("uploaderror", this.uploadError, this);
			this.fileProvider.on("fileselect", this.fileSelect, this);
			this.showTips();
			fAddEventListener(window, "beforeunload", fExtend(this.unloadHandler, this));
		},
		startUpload : function(a) {
			var file_id = a.get("id"), c = fCreateContentEle("<div id='" + file_id + "'></div>");
			c.innerHTML = this.template;
			this.uploadInfo[file_id] = {
				uploadToken : "",
				fileUploaded : !1,
				uploadComplete : !1,
				file : a,
				disabled : !1,
				progressNode : this.getNode("upload-progress", c),
				successNode : this.getNode("upload-success", c)
			};
			this.renderUI(file_id);
			this.bindUI(file_id);
			bStreaming ? this.startPanel.style.display = "none" : (this.startPanel.style.height = "1px", this.startPanel.style.width = "1px");
			this.containerPanel.appendChild(c);
			this.createUploadTask(file_id);
		},
		renderUI : function(a) {
		},
		bindUI : function(a) {
			var b = this.uploadInfo[a].progressNode, I = this.getNode("upload-cancel", b);
			fAddEventListener(I, "click", fExtend(this.cancelUploadHandler, this, {type : "click",	nodeId : a}));
		},
		completeUpload : function(a, b) {
//			console.log("====Main.completeUpload()===");
			var callbackFunc = this.get("uploadedFunc");
			if (callbackFunc) {callbackFunc();}
		},
		disable : function(a) {
			if (!this.uploadInfo[a].disabled)
				this.uploadInfo[a].disabled = !0;
		},
		enable : function(a) {
			if (this.uploadInfo[a].disabled)
				this.uploadInfo[a].disabled = !1;
		},
		cancelUpload : function(a) {
			var b = this.uploadInfo[a].file;
			b && b.cancelUpload && b.cancelUpload();
			this.showTips();
			this.uploadInfo[a] && delete this.uploadInfo[a];
			this.containerPanel.innerHTML = "";
		},
		cancelUploadHandler : function(a, b) {
			var c = a || window.event, d = b.nodeId;
			if (this.uploadInfo[d].disabled)
				return !1;
			this.uploadInfo[d] && !this.uploadInfo[d].uploadComplete
					? alert("cancelUploadHandler....") : this.cancelUpload(d);
		},
		showTips : function() {
//			console.log("====Main.showTips()====");
		},
		selectorBtnHandler : function(a, b) {
			var d = b.nodeId;
			if (this.uploadInfo[d].disabled)
				return !1;
			this.removeSuccessMessage(d);
		},
		selectorHandler : function(a, b) {
			var c = a || window.event,
				c = c.target || c.srcElement,
				d = b.nodeId, e = b.type, 
				f = this.uploadInfo[d].progressNode;
		},
		unloadHandler : function(a) {
			var a = a || window.event, b = !0, c;
			for (c in this.uploadInfo) {
				b = !1;
				break;
			}
			if (!b)
				return a.returnValue = "\u60a8\u6b63\u5728\u4e0a\u4f20\u89c6\u9891\uff0c\u5173\u95ed\u6b64\u9875\u9762\u5c06\u4f1a\u4e2d\u65ad\u4e0a\u4f20\uff0c\u5efa\u8bae\u60a8\u7b49\u5f85\u4e0a\u4f20\u5b8c\u6210\u540e\u518d\u5173\u95ed\u6b64\u9875\u9762";
		},
		createUploadTask : function(a) {
			var file = this.uploadInfo[a].file, self = this;
			bStreaming ? self.uploadFile(file, "/upload", "__token", "resumeUpload") : self.uploadFile(file, "/upload;" + document.cookie, "__token", "formUpload");
		},
		uploadFile : function(file, url, token, method) {
			var token = {
				upload_token : token,
				client : "html5"
			};
			url = url || "";
			method && file instanceof StreamUploader && file.set("uploadMethod", method);
			this.fileProvider.upload(file, url, token);
		},
		uploadProgress : function(a) {
			var id = a.target.get("id"), progressNode = this.uploadInfo[id].progressNode,
				c = this.formatSpeed(a.bytesSpeed), d = this.formatBytes(a.bytesLoaded),
				e = this.formatBytes(a.bytesTotal), f = this.formatTime(a.remainTime),
				a = Math.min(99.99, a.percentLoaded);
			100 > a && (a = parseFloat(a).toFixed(2));
			d = Math.min(d, e);
			d = parseFloat(d).toFixed(2);
			e = parseFloat(e).toFixed(2);
			this.getNode("bar", progressNode).style.width = a + "%";
			this.getNode("f_36", progressNode).innerHTML = a + "%";
			this.getNode("speed", progressNode).innerHTML = "\u4e0a\u4f20\u901f\u5ea6\uff1a" + c;
			if (f)
				this.getNode("time", progressNode).innerHTML = "\u5269\u4f59\u65f6\u95f4\uff1a"	+ f;
			this.getNode("uploaded", progressNode).innerHTML = "\u5df2\u4e0a\u4f20\uff1a" + d + "MB/" + e + "MB";
		},
		uploadComplete : function(a) {
			var id = a.target.get("id"), progressNode = this.uploadInfo[id].progressNode,
				d = a.target.get("size"), a = eval("(" + a.data + ")"), d = this.formatBytes(d);
			this.getNode("bar", progressNode).style.width = "100%";
			this.getNode("f_36", progressNode).innerHTML = "100%";
			this.getNode("uploaded", progressNode).innerHTML = "\u5df2\u4e0a\u4f20\uff1a" + d + "MB/" + d + "MB";
			this.getNode("time", progressNode).innerHTML = "\u5269\u4f59\u65f6\u95f4\uff1a0";
			/** uploaded flag and its callback function. */
			this.uploadInfo[id].fileUploaded = !0,
			this.completeUpload(id);
		},
		getNode : function(a, b) {
			return fContains(b || this.containerPanel, a)[0] || null;
		},
		uploadError : function() {
			alert("====Main.uploadError()===");
		},
		fileSelect : function(a) {
			var a = a.fileList, b = 0, c;
			for (c in this.uploadInfo)
				b++;
			if (b == this.get("simLimit") || a.length > this.get("simLimit"))
				return !1;
			for (c = 0; c < a.length; c++)
				this.validateFile(a[c]) && this.startUpload(a[c]);
		},
		validateFile : function(a) {
//			console.log("====Main.validateFile()===");
			return true;
		},
		formatSpeed : function(a) {
			var b = 0;
			1024 <= Math.round(a / 1024) 
				? (b = Math.round(100 * (a / 1048576)) / 100, b = Math.max(0, b), b = isNaN(b) ? 0 : parseFloat(b).toFixed(2), a = b + "MB/s")
				: (b = Math.round(100 * (a / 1024))	/ 100, b = Math.max(0, b), b = isNaN(b) ? 0 : parseFloat(b).toFixed(2), a = b + "KB/s");
			return a;
		},
		formatBytes : function(a) {
			a = Math.round(100 * (a / 1048576)) / 100;
			return a = isNaN(a) ? 0 : parseFloat(a).toFixed(2);
		},
		formatTime : function(a) {
			var b = a || 0, c = Math.floor(b / 3600), a = Math.floor((b - 3600 * c) / 60),
				b = Math.floor(b - 3600 * c - 60 * a), c = "" + (!isNaN(c) && 0 < c ? c + "\u5c0f\u65f6" : ""),
				c = c + (!isNaN(a) && 0 < a ? a + "\u5206" : "");
			return c += !isNaN(b) && 0 < b ? b + "\u79d2" : "";
		}
	};
	
	var sIEFlashClassId = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
		sShockwaveFlash = "application/x-shockwave-flash", sFlashVersion = "10.0.22",
		sFlashDownload = "http://fpdownload.macromedia.com/pub/flashplayer/update/current/swf/autoUpdater.swf?"	+ Math.random(),
		sFlashEventHandler = "SWF.eventHandler",
		oa = {
			align : "",
			allowFullScreen : "",
			allowNetworking : "",
			allowScriptAccess : "",
			base : "",
			bgcolor : "",
			loop : "",
			menu : "",
			name : "",
			play : "",
			quality : "",
			salign : "",
			scale : "",
			tabindex : "",
			wmode : ""
		};
	var Browser = function(a) {
		var b = function(a) {
			var b = 0;
			return parseFloat(a.replace(/\./g, function() {
						return 1 == b++ ? "" : ".";
					}))
		}, c = window, d = c && c.navigator, e = {
			ie : 0,
			opera : 0,
			gecko : 0,
			webkit : 0,
			safari : 0,
			chrome : 0,
			mobile : null,
			air : 0,
			phantomjs : 0,
			air : 0,
			ipad : 0,
			iphone : 0,
			ipod : 0,
			ios : null,
			android : 0,
			silk : 0,
			accel : !1,
			webos : 0,
			caja : d && d.cajaVersion,
			secure : !1,
			os : null,
			nodejs : 0
		}, a = a || d && d.userAgent, d = (c = c && c.location) && c.href, c = 0, f, g, h;
		e.userAgent = a;
		e.secure = d && 0 === d.toLowerCase().indexOf("https");
		if (a) {
			if (/windows|win32/i.test(a))
				e.os = "windows";
			else if (/macintosh|mac_powerpc/i.test(a))
				e.os = "macintosh";
			else if (/android/i.test(a))
				e.os = "android";
			else if (/symbos/i.test(a))
				e.os = "symbos";
			else if (/linux/i.test(a))
				e.os = "linux";
			else if (/rhino/i.test(a))
				e.os = "rhino";
			if (/KHTML/.test(a))
				e.webkit = 1;
			if (/IEMobile|XBLWP7/.test(a))
				e.mobile = "windows";
			if (/Fennec/.test(a))
				e.mobile = "gecko";
			if ((d = a.match(/AppleWebKit\/([^\s]*)/)) && d[1]) {
				e.webkit = b(d[1]);
				e.safari = e.webkit;
				if (/PhantomJS/.test(a) && (d = a.match(/PhantomJS\/([^\s]*)/))
						&& d[1])
					e.phantomjs = b(d[1]);
				if (/ Mobile\//.test(a) || /iPad|iPod|iPhone/.test(a)) {
					if (e.mobile = "Apple", (d = a.match(/OS ([^\s]*)/))
							&& d[1] && (d = b(d[1].replace("_", "."))), e.ios = d, e.os = "ios", e.ipad = e.ipod = e.iphone = 0, (d = a
							.match(/iPad|iPod|iPhone/))
							&& d[0])
						e[d[0].toLowerCase()] = e.ios;
				} else {
					if (d = a.match(/NokiaN[^\/]*|webOS\/\d\.\d/))
						e.mobile = d[0];
					if (/webOS/.test(a)
							&& (e.mobile = "WebOS", (d = a
									.match(/webOS\/([^\s]*);/))
									&& d[1]))
						e.webos = b(d[1]);
					if (/ Android/.test(a)) {
						if (/Mobile/.test(a))
							e.mobile = "Android";
						if ((d = a.match(/Android ([^\s]*);/)) && d[1])
							e.android = b(d[1]);
					}
					if (/Silk/.test(a)) {
						if ((d = a.match(/Silk\/([^\s]*)\)/)) && d[1])
							e.silk = b(d[1]);
						if (!e.android)
							e.android = 2.34, e.os = "Android";
						if (/Accelerated=true/.test(a))
							e.accel = !0;
					}
				}
				if ((d = a.match(/(Chrome|CrMo|CriOS)\/([^\s]*)/)) && d[1]
						&& d[2]) {
					if (e.chrome = b(d[2]), e.safari = 0, "CrMo" === d[1])
						e.mobile = "chrome";
				} else if (d = a.match(/AdobeAIR\/([^\s]*)/))
					e.air = d[0];
			}
			if (!e.webkit)
				if (/Opera/.test(a)) {
					if ((d = a.match(/Opera[\s\/]([^\s]*)/)) && d[1])
						e.opera = b(d[1]);
					if ((d = a.match(/Version\/([^\s]*)/)) && d[1])
						e.opera = b(d[1]);
					if (/Opera Mobi/.test(a) && (e.mobile = "opera", (d = a.replace("Opera Mobi", "").match(/Opera ([^\s]*)/)) && d[1]))
						e.opera = b(d[1]);
					if (d = a.match(/Opera Mini[^;]*/))
						e.mobile = d[0];
				} else if ((d = a.match(/MSIE\s([^;]*)/)) && d[1])
					e.ie = b(d[1]);
				else if (d = a.match(/Gecko\/([^\s]*)/))
					if (e.gecko = 1, (d = a.match(/rv:([^\s\)]*)/)) && d[1])
						e.gecko = b(d[1]);
		}
		if (e.gecko || e.webkit || e.opera) {
			if (b = navigator.mimeTypes["application/x-shockwave-flash"])
				if (b = b.enabledPlugin)
					f = b.description.replace(/\s[rd]/g, ".").replace(
							/[A-Za-z\s]+/g, "").split(".");
		} else if (e.ie) {
			try {
				g = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"), g.AllowScriptAccess = "always";
			} catch (j) {null !== g && (c = 6);}
			if (0 === c)
				try {
					h = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"),
					f = h.GetVariable("$version").replace(/[A-Za-z\s]+/g, "").split(",");
				} catch (s) {}
		}
		if (fIsArray(f)) {
			if (fIsNumber(parseInt(f[0], 10)))
				e.flashMajor = f[0];
			if (fIsNumber(parseInt(f[1], 10)))
				e.flashMinor = f[1];
			if (fIsNumber(parseInt(f[2], 10)))
				e.flashRev = f[2];
		}
		return e;
	}();
	var bStreaming = function(){
		var bFile = !1, bHtml5 = !1, bFormData = window.FormData ? !0 : !1, bStreaming = !1;
		"undefined" != typeof File && "undefined" != typeof (new XMLHttpRequest).upload && (bFile = !0);
		if (bFile && ("slice" in File.prototype || "mozSlice" in File.prototype || "webkitSlice" in File.prototype))
			bHtml5 = !0;
		(function() {
			for (var a = 0; a < aOtherBrowsers.length; a++)
				-1 !== navigator.userAgent.indexOf(aOtherBrowsers[a]) && (bHtml5 = !1);
		})();
		return bFile && (bFormData || bHtml5);
	}();
	Provider= !bStreaming ? StreamProvider : SWFProvider;
	window.Uploader=Main;
})();
