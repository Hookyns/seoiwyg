"use strict";
function createElement(name, props) {
    if (props === void 0) { props = {}; }
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    var el = document.createElement(name);
    for (var prop in props) {
        if (props.hasOwnProperty(prop)) {
            if (prop.slice(0, 2) === "on" && prop.slice(2, 3).charCodeAt(0) <= 90) {
                el.addEventListener(prop.slice(2).toLowerCase(), props[prop]);
            }
            else {
                if (prop === "className") {
                    prop = "class";
                }
                el.setAttribute(prop, props[prop]);
            }
        }
    }
    if (children) {
        if (children[0] && children[0].constructor === Array) {
            children = children[0];
        }
        for (var _a = 0, children_1 = children; _a < children_1.length; _a++) {
            var child = children_1[_a];
            if (typeof child === "string") {
                child = document.createTextNode(child);
            }
            if (child) {
                el.appendChild(child);
            }
        }
    }
    return el;
}
var SelectionType;
(function (SelectionType) {
    SelectionType["Range"] = "Range";
    SelectionType["Caret"] = "Caret";
})(SelectionType || (SelectionType = {}));
var SeoIwyg = (function () {
    function SeoIwyg(selector) {
        this.onSelectionEvent = new EditorEvent();
        this.onChangeEvent = new EditorEvent();
        this._container = undefined;
        this._content = undefined;
        this.outlineVisible = false;
        this.toolbar = new Toolbar(this);
        this.init(selector);
    }
    Object.defineProperty(SeoIwyg.prototype, "registeredCommands", {
        get: function () {
            return this.toolbar.registeredCommands;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeoIwyg.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeoIwyg.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    SeoIwyg.prototype.onSelection = function (handler) {
        this.onSelectionEvent.add(handler);
    };
    SeoIwyg.prototype.onChange = function (handler) {
        this.onChangeEvent.add(handler);
    };
    SeoIwyg.prototype.addCommand = function (command) {
        this.toolbar.addCommand(command);
    };
    SeoIwyg.prototype.focusContent = function () {
        this._content.focus();
    };
    SeoIwyg.prototype.invokeCommand = function (command) {
        var editorSelection = this.getSelection();
        if (!editorSelection.selection.focusNode || !this.content.contains(editorSelection.selection.focusNode)) {
            return;
        }
        if (command.isActive(this, editorSelection)) {
            command.redo(this, editorSelection);
        }
        else {
            command.apply(this, editorSelection);
        }
        this.focusContent();
    };
    SeoIwyg.prototype.getSelection = function () {
        var selection = window.getSelection();
        var focused = this.getFocusedElement(selection);
        var section = focused ? focused.closest("section") : null;
        return {
            selection: selection,
            text: selection.toString(),
            context: {
                heading: section ? (Array.prototype.slice.call(section.children).filter(function (n) { return /h[1-9]/i.test(n.tagName); })[0]) : null,
                parentHeading: null,
                mainHeading: null,
                section: section
            },
            element: focused,
            node: selection.focusNode
        };
    };
    SeoIwyg.prototype.wrapSelection = function (selection, into) {
        var selectionType = selection.type;
        var range = selection.getRangeAt(0);
        if (range.startContainer.parentElement !== range.endContainer.parentElement) {
            return;
        }
        range.surroundContents(into);
        var newRange = document.createRange();
        newRange.selectNodeContents(into);
        selection.removeAllRanges();
        selection.addRange(newRange);
        if (selectionType === SelectionType.Caret) {
            into.appendChild(document.createTextNode(SeoIwyg.PlaceholderChar));
            newRange.setStart(into, 1);
            newRange.collapse(true);
        }
    };
    SeoIwyg.prototype.unwrapSelection = function (selection, nodeOrSelector) {
        var node = null;
        if (typeof nodeOrSelector === "string") {
            var el = this.getFocusedElement(selection);
            if (el) {
                node = el.closest(nodeOrSelector);
            }
        }
        else {
            node = nodeOrSelector;
        }
        if (node == null) {
            return;
        }
        var range = selection.getRangeAt(0);
        if (selection.type === SelectionType.Caret && range.endContainer.textContent != null && range.endOffset === range.endContainer.textContent.length) {
            var sib = range.endContainer.nextSibling;
            var newRange = document.createRange();
            if (!sib || sib.nodeType !== Node.TEXT_NODE) {
                range.endContainer.parentElement.insertAdjacentText("afterend", SeoIwyg.PlaceholderChar);
                sib = range.endContainer.parentElement.nextSibling;
                newRange.setStart(sib, 1);
            }
            else {
                newRange.setStart(sib, 0);
            }
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            return;
        }
        range.selectNode(node);
        var content = range.extractContents();
        var childs = content.children[0].childNodes;
        for (var i = 0; i < childs.length; i++) {
            range.insertNode(childs[i]);
        }
    };
    SeoIwyg.prototype.getFocusedElement = function (selection) {
        if (!selection.focusNode) {
            return null;
        }
        return selection.focusNode.nodeType === Node.TEXT_NODE ? selection.focusNode.parentElement : selection.focusNode;
    };
    SeoIwyg.prototype.getFocusedTextNode = function (selection, __node) {
        if (__node === void 0) { __node = undefined; }
        if (__node === null) {
            return null;
        }
        if (__node == undefined) {
            __node = selection.focusNode;
        }
        return __node.nodeType === Node.TEXT_NODE ? __node : this.getFocusedTextNode(undefined, __node.childNodes[0] || null);
    };
    SeoIwyg.prototype.init = function (selector) {
        var _this = this;
        this.addCommand(new SimpleTagCommand("Bold", "", "strong", "b"));
        this.addCommand(new SimpleTagCommand("Italic", "", "em", "i"));
        this.addCommand(new SimpleTagCommand("Strike", "", "strike"));
        this.addCommand(new SimpleTagCommand("Sub", "", "sub"));
        this.addCommand(new SimpleTagCommand("Sup", "", "sup"));
        this.addCommand(new HeadingCommand());
        this.addCommand(new OutlineCommand());
        document.addEventListener("DOMContentLoaded", function () {
            _this.findAndStoreContainer(selector);
            _this.initOnReady();
        });
    };
    SeoIwyg.prototype.findAndStoreContainer = function (selector) {
        var container = document.querySelector(selector);
        if (container == null) {
            throw new Error("Container elemnt not found by selector " + container);
        }
        this._container = container;
    };
    SeoIwyg.prototype.initOnReady = function () {
        var _this = this;
        this.createEditor();
        this.handleChanges();
        document.addEventListener("selectionchange", function (e) {
            _this.onSelectionEvent.invoke(_this, _this.getSelection());
        });
    };
    SeoIwyg.prototype.handleChanges = function () {
        var _this = this;
        var handler = function (e) {
            _this.removePlaceholdingNodes();
            _this.onChangeEvent.invoke(_this, _this.getSelection());
        };
        if (document.documentMode) {
            this.content.addEventListener("keyup", function (e) {
                if (e.keyCode > 13 && e.keyCode <= 40) {
                    return;
                }
                handler(e);
            });
            this.content.addEventListener("paste", handler);
        }
        else {
            this.content.addEventListener("input", handler);
        }
    };
    SeoIwyg.prototype.createEditor = function () {
        var editorText = this._container.innerHTML;
        this._container.innerHTML = "";
        var existingClasses = this._container.getAttribute("class");
        this._container.setAttribute("class", (existingClasses ? (existingClasses + " ") : "") + "seoiwyg-editor");
        this._container.appendChild(this.toolbar.render());
        this._content = document.createElement("div");
        this._content.setAttribute("contenteditable", "true");
        this._content.setAttribute("class", "seoiwyg-content");
        this._content.innerHTML = editorText;
        this._container.appendChild(this._content);
    };
    SeoIwyg.prototype.removePlaceholdingNodes = function () {
        var sel = window.getSelection();
        var el = this.getFocusedTextNode(sel);
        if (el != null && el.textContent) {
            if (SeoIwyg.PlaceHolderCharRegExp.test(el.textContent)) {
                var range = sel.getRangeAt(0);
                var startOffset = range.startOffset;
                var endOffset = range.endOffset;
                var newTextContent = el.textContent.replace(SeoIwyg.PlaceHolderCharRegExp, "");
                if (newTextContent.trim().length) {
                    var diff = el.textContent.length - newTextContent.length;
                    el.textContent = newTextContent;
                    range.setStart(range.startContainer, startOffset - diff);
                    range.setEnd(range.endContainer, endOffset - diff);
                    range.collapse(false);
                }
            }
        }
    };
    SeoIwyg.PlaceholderChar = String.fromCharCode(8203);
    SeoIwyg.PlaceHolderCharRegExp = new RegExp(SeoIwyg.PlaceholderChar, "g");
    return SeoIwyg;
}());
var Command = (function () {
    function Command(name, icon) {
        this.entity = null;
        this.active = false;
        this._onClick = new EditorEvent();
        this._name = name;
        this._icon = icon;
    }
    Object.defineProperty(Command.prototype, "onClick", {
        get: function () {
            return this._onClick;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "icon", {
        get: function () {
            return this._icon;
        },
        enumerable: true,
        configurable: true
    });
    Command.prototype.render = function () {
        var _this = this;
        return this.entity = (createElement("span", { class: "seoiwyg-command-button" + (this.active ? " active" : ""), onClick: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _a;
                return (_a = _this._onClick).invoke.apply(_a, args);
            } }, this.name));
    };
    Command.prototype.onChange = function (editor, selection) {
        throw new Error("Not implemented. Do not call super.onChange();");
    };
    Command.prototype.onSelection = function (editor, selection) {
        this.active = this.isActive(editor, selection);
    };
    return Command;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BoldCommand = (function (_super) {
    __extends(BoldCommand, _super);
    function BoldCommand() {
        return _super.call(this, "Bold", "images/cmd/bold.png") || this;
    }
    BoldCommand.prototype.apply = function (editor, selection) {
        editor.wrapSelection(selection.selection, (createElement("strong", null)));
    };
    BoldCommand.prototype.redo = function (editor, selection) {
        editor.unwrapSelection(selection.selection, "strong,b");
    };
    BoldCommand.prototype.isActive = function (editor, selection) {
        if (selection.element) {
            var strong = selection.element.closest("strong,b");
            if (strong != null) {
                return true;
            }
        }
        return false;
    };
    return BoldCommand;
}(Command));
var OutlineCommand = (function (_super) {
    __extends(OutlineCommand, _super);
    function OutlineCommand() {
        var _this = _super.call(this, "Outline", "images/cmd/outline.png") || this;
        _this.outlineContainer = undefined;
        return _this;
    }
    OutlineCommand.prototype.apply = function (editor, selection) {
        if (this.outlineContainer == undefined) {
            this.createOutlineContainer(editor);
        }
        this.updateOutline(editor);
        this.outlineContainer.removeAttribute("style");
        editor.container.setAttribute("class", (editor.container.getAttribute("class") || "") + " " + OutlineCommand.className);
    };
    OutlineCommand.prototype.redo = function (editor, selection) {
        editor.container.setAttribute("class", (editor.container.getAttribute("class") || "")
            .replace(new RegExp("\\s?" + OutlineCommand.className), ""));
    };
    OutlineCommand.prototype.isActive = function (editor, selection) {
        return (editor.container.getAttribute("class") || "").indexOf(OutlineCommand.className) !== -1;
    };
    OutlineCommand.prototype.onChange = function (editor, selection) {
        if (selection.element) {
            if (/^h[1-9]$/i.test(selection.element.tagName.slice(0, 2))) {
                this.updateOutline(editor);
            }
        }
    };
    OutlineCommand.prototype.createOutlineContainer = function (editor) {
        this.outlineContainer = editor.container.insertBefore((createElement("div", { class: "seoiwyg-outline" })), editor.content);
    };
    OutlineCommand.prototype.updateOutline = function (editor) {
        var content = editor.content.innerHTML;
        var outliner = new DocumentOutliner(editor.content);
        outliner.makeList(this.outlineContainer);
    };
    OutlineCommand.className = "seoiwyg-outline-show";
    return OutlineCommand;
}(Command));
var EditorEvent = (function () {
    function EditorEvent() {
        this.handlers = [];
        this.invoked = false;
    }
    EditorEvent.prototype.add = function (handler) {
        this.handlers.push(handler);
    };
    EditorEvent.prototype.invoke = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.invoked) {
            return;
        }
        this.invoked = true;
        setTimeout(function () {
            _this.invoked = false;
        }, 0);
        for (var _a = 0, _b = this.handlers; _a < _b.length; _a++) {
            var handler = _b[_a];
            handler.apply(null, args);
        }
    };
    return EditorEvent;
}());
var Toolbar = (function () {
    function Toolbar(seoiwyg) {
        var _this = this;
        this.commands = [];
        this.entity = null;
        this.seoIwyg = seoiwyg;
        this.seoIwyg.onChange(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.onEditorChange.apply(_this, args);
        });
        this.seoIwyg.onSelection(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.onEditorSelection.apply(_this, args);
        });
    }
    Object.defineProperty(Toolbar.prototype, "registeredCommands", {
        get: function () {
            return this.commands.slice();
        },
        enumerable: true,
        configurable: true
    });
    Toolbar.prototype.addCommand = function (command) {
        this.commands.push(command);
    };
    Toolbar.prototype.render = function () {
        var _this = this;
        var toolButtons = this.commands.map(function (cmd) {
            cmd.onClick.add(function (e) {
                var orig = cmd.entity;
                _this.seoIwyg.invokeCommand(cmd);
                if (orig) {
                    _this.reRenderCommand(cmd, orig);
                }
            });
            return cmd.render();
        });
        return this.entity = (createElement("div", { class: "seoiwyg-tools" }, toolButtons));
    };
    Toolbar.prototype.onEditorChange = function (editor, selection) {
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var cmd = _a[_i];
            if (cmd.constructor.prototype.hasOwnProperty("onChange")) {
                cmd.onChange(editor, selection);
            }
        }
    };
    Toolbar.prototype.onEditorSelection = function (editor, selection) {
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var cmd = _a[_i];
            var orig = cmd.entity;
            cmd.onSelection(editor, selection);
            if (orig) {
                this.reRenderCommand(cmd, orig);
            }
        }
    };
    Toolbar.prototype.reRenderCommand = function (cmd, orig) {
        this.entity.replaceChild(cmd.render(), orig);
    };
    return Toolbar;
}());
var HeadingCommand = (function (_super) {
    __extends(HeadingCommand, _super);
    function HeadingCommand() {
        return _super.call(this, "Heading", "images/cmd/heading.png") || this;
    }
    HeadingCommand.prototype.apply = function (editor, selection) {
        var Heading = "h" + ((this.getSectionHeadingRank(selection) || 0) + 1).toString();
        editor.wrapSelection(selection.selection, (createElement("section", null,
            createElement(Heading, null))));
    };
    HeadingCommand.prototype.redo = function (editor, selection) {
        if (!selection.context.heading) {
            console.error("No heading found to redo.");
            return;
        }
        editor.unwrapSelection(selection.selection, selection.context.heading);
    };
    HeadingCommand.prototype.isActive = function (editor, selection) {
        return !!selection.context.heading && selection.context.heading.contains(selection.selection.focusNode);
    };
    HeadingCommand.prototype.getSectionHeadingRank = function (selection) {
        var lastH = selection.context.heading;
        return lastH ? parseInt(lastH.tagName.slice(-1)) : null;
    };
    return HeadingCommand;
}(Command));
var SimpleTagCommand = (function (_super) {
    __extends(SimpleTagCommand, _super);
    function SimpleTagCommand(name, icon, tag, secondaryTag) {
        if (secondaryTag === void 0) { secondaryTag = null; }
        var _this = _super.call(this, name, icon) || this;
        _this.tagName = "";
        _this.secondaryTagName = null;
        _this.selector = undefined;
        _this.tagName = tag;
        _this.secondaryTagName = secondaryTag;
        _this.selector = tag + (secondaryTag ? ("," + secondaryTag) : "");
        return _this;
    }
    SimpleTagCommand.prototype.apply = function (editor, selection) {
        var Tag = this.tagName;
        editor.wrapSelection(selection.selection, (createElement(Tag, null)));
    };
    SimpleTagCommand.prototype.redo = function (editor, selection) {
        editor.unwrapSelection(selection.selection, this.selector);
    };
    SimpleTagCommand.prototype.isActive = function (editor, selection) {
        if (selection.element) {
            var strong = selection.element.closest(this.selector);
            if (strong != null) {
                return true;
            }
        }
        return false;
    };
    return SimpleTagCommand;
}(Command));
//# sourceMappingURL=seoiwyg.js.map