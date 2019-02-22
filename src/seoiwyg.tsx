class SeoIwyg
{
	//region Events

	/**
	 * On editor selection event
	 * @type {EditorEvent<(editor: SeoIwyg, selection: EditorSelection) => void>}
	 */
	private onSelectionEvent = new EditorEvent<(editor: SeoIwyg, selection: EditorSelection) => void>();

	/**
	 * On editor change event
	 * @type {EditorEvent<(editor: SeoIwyg, selection: EditorSelection) => void>}
	 */
	private onChangeEvent = new EditorEvent<(editor: SeoIwyg, selection: EditorSelection) => void>();

	//endregion

	//region Fields

	private static PlaceholderChar = String.fromCharCode(8203);

	private static PlaceHolderCharRegExp = new RegExp(SeoIwyg.PlaceholderChar, "g");

	/**
	 * HTML editor container element
	 */
	private _container: Element = undefined as any;

	/**
	 * Content element, after editor creation
	 */
	private _content: Element = undefined as any;

	/**
	 * Flag - true if document outline is visible
	 * @type {boolean}
	 */
	private outlineVisible: boolean = false;

	/**
	 * Toolbar instance
	 * @type {Toolbar}
	 */
	private toolbar: Toolbar = new Toolbar(this);

	//endregion

	//region Properties

	/**
	 * Get registered commands list
	 * @returns {Command[]}
	 */
	get registeredCommands()
	{
		return this.toolbar.registeredCommands;
	}

	get content(): Element
	{
		return this._content;
	}

	get container(): Element
	{
		return this._container;
	}

	//endregion

	/**
	 * Ctor
	 * @param {string} selector
	 */
	constructor(selector: string)
	{
		this.init(selector);
	}

	//region Methods

	/**
	 * Register on selection handler
	 * @param {(editor: SeoIwyg, selection: Selection) => void} handler
	 */
	onSelection(handler: (editor: SeoIwyg, selection: EditorSelection) => void)
	{
		this.onSelectionEvent.add(handler);
	}

	/**
	 * Register on change handler
	 * @param {(editor: SeoIwyg, selection: Selection) => void} handler
	 */
	onChange(handler: (editor: SeoIwyg, selection: EditorSelection) => void)
	{
		this.onChangeEvent.add(handler);
	}

	/**
	 * Add command to editor's toolbar
	 * @param {Command} command
	 */
	public addCommand(command: Command)
	{
		this.toolbar.addCommand(command);
	}

	public focusContent()
	{
		(this._content as HTMLElement).focus();
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * CInvoke Command
	 * @param {Command} command
	 */
	public invokeCommand(command: Command)
	{
		const editorSelection = this.getSelection();

		// Interupt if editor not focused
		if (!editorSelection.selection.focusNode || !this.content.contains(editorSelection.selection.focusNode)) {
			return;
		}

		if (command.isActive(this, editorSelection))
		{
			command.redo(this, editorSelection);
		}
		else
		{
			command.apply(this, editorSelection);
		}


		// Focus content after action
		this.focusContent();

		// if (result != undefined) {
		// 	let range = selection.getRangeAt(0);
		// 	range.deleteContents();
		// 	let node = document.createElement("div");
		// 	node.innerHTML = result;
		// 	range.insertNode(node.children[0]);
		// }
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * Get editor selection
	 * @returns {EditorSelection}
	 */
	public getSelection(): EditorSelection
	{
		const selection = window.getSelection();
		const focused = this.getFocusedElement(selection);
		const section = focused ? focused.closest("section") : null;

		return {
			selection: selection,
			text: selection.toString(),
			context: {
				heading: section ? (Array.prototype.slice.call(section.children).filter(n => /h[1-9]/i.test(n.tagName))[0]) : null,
				parentHeading: null,
				mainHeading: null,
				section: section
			}, // TODO: Doplnit kontext
			element: selection.focusNode ? selection.focusNode.parentElement : null,
			node: selection.focusNode
		};
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * Wrap selection into node
	 * @param {Selection} selection
	 * @param {Node} into
	 */
	public wrapSelection(selection: Selection, into: Node)
	{
		let selectionType = selection.type;

		let range = selection.getRangeAt(0);

		// Cross-node selection - not allowed
		if (range.startContainer.parentElement !== range.endContainer.parentElement)
		{
			return;
		}

		range.surroundContents(into);

		let newRange = document.createRange();
		newRange.selectNode(into);
		selection.removeAllRanges();
		selection.addRange(newRange);

		if (selectionType === SelectionType.Caret)
		{
			// let space = document.createElement("div");
			// space.innerHTML = "&#8203;";
			// into.appendChild(space.childNodes[0]);
			into.appendChild(document.createTextNode(SeoIwyg.PlaceholderChar));

			range.setStart(into, 1);
			// range.setEnd(into, 1);
			range.collapse(true);
		}
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * Remove wraping node
	 * @param {Selection} selection
	 * @param {Node|string} nodeOrSelector Node or element selector
	 */
	public unwrapSelection(selection: Selection, nodeOrSelector: Node | string | null)
	{
		let node: Node | null = null;

		if (typeof nodeOrSelector === "string")
		{
			let el = this.getFocusedElement(selection);

			if (el)
			{
				node = el.closest(nodeOrSelector as string);
			}
		}
		else
		{
			node = nodeOrSelector;
		}

		if (node == null)
		{
			return;
		}

		// console.log(selection);
		// return;

		let range = selection.getRangeAt(0);

		if (selection.type === SelectionType.Caret && range.endContainer.textContent != null && range.endOffset === range.endContainer.textContent.length)
		{
			let sib = range.endContainer.nextSibling;
			let newRange = document.createRange();

			if (!sib || sib.nodeType !== Node.TEXT_NODE)
			{
				(range.endContainer.parentElement as Element).insertAdjacentText("afterend", SeoIwyg.PlaceholderChar);
				sib = (range.endContainer.parentElement as Element).nextSibling as Node;
				// let newSib = sib = document.createTextNode(" ");
				//
				// if (!sib)
				// {
				// 	(range.endContainer.parentNode as Node).appendChild(sib);
				// }

				newRange.setStart(sib, 1);
				newRange.setEnd(sib, 1);
			}
			else {
				newRange.setStart(sib, 0);
			}

			newRange.collapse(true);
			// newRange.setStart(sib, 0);
			// newRange.setEnd(sib, 1);

			selection.removeAllRanges();
			selection.addRange(newRange);

			return;
		}

		// Select whole node
		range.selectNode(node);

		// Take out from DOM
		let content = range.extractContents();

		// Add wrap's childrens back
		let childs = content.children[0].childNodes;

		for (let i = 0; i < childs.length; i++)
		{
			range.insertNode(childs[i]);
		}
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * Returns selected element
	 * @param {Selection} selection
	 */
	public getFocusedElement(selection: Selection): Element | null
	{
		return selection.focusNode.nodeType === Node.TEXT_NODE ? selection.focusNode.parentElement : selection.focusNode as Element;
	}

	/**
	 *
	 * @param {Selection} selection
	 * @param {Node | undefined} __node Donť use - recursive param
	 * @returns {Node | null}
	 */
	public getFocusedTextNode(selection: Selection, __node: Node | undefined | null = undefined): Node | null
	{
		if (__node === null) {
			return null;
		}

		if (__node == undefined) {
			__node = selection.focusNode;
		}

		return __node.nodeType === Node.TEXT_NODE ? __node : this.getFocusedTextNode(undefined as any, __node.childNodes[0] || null);
	}

	//endregion

	//region Private methods

	/**
	 * On document load initialization
	 * @param {string} selector
	 */
	private init(selector: string)
	{
		this.addCommand(new BoldCommand());
		this.addCommand(new OutlineCommand());

		document.addEventListener("DOMContentLoaded", () => {
			// Find and store container
			this.findAndStoreContainer(selector);

			// Initialize
			this.initOnReady();
		});
	}

	/**
	 * Find and store container lement
	 * @param {string} selector
	 */
	private findAndStoreContainer(selector: string)
	{
		let container = document.querySelector(selector);

		if (container == null)
		{
			throw new Error(`Container elemnt not found by selector ${container}`);
		}

		this._container = container;
	}

	/**
	 * Editor initialization
	 */
	private initOnReady()
	{
		this.createEditor();
		this.handleChanges();

		document.addEventListener("selectionchange", (e) => {
			this.onSelectionEvent.invoke(this, this.getSelection());
		});
	}

	/**
	 * Handling change events
	 */
	private handleChanges()
	{
		const handler = (e) => {
			this.removePlaceholdingNodes();

			// TODO: Maybe add event into invoke?
			this.onChangeEvent.invoke(this, this.getSelection());
		};

		// TODO: change behavior of ENTER and space - ENTER insert div or section, space insert &nbsp...
		// this.content.addEventListener("keyup", (e) => {
		// 	e.preventDefault();
		// });

		// IE
		if ((document as any).documentMode)
		{
			this.content.addEventListener("keyup", (e: any) => {
				if (e.keyCode > 13 && e.keyCode <= 40) // Arrows, page up/down, ctrl, shift etc...
				{
					return;
				}

				handler(e);
			});
			this.content.addEventListener("paste", handler);

			// TODO: What about drag&drop?
		}
		else
		{
			this.content.addEventListener("input", handler);
		}
	}

	private createEditor()
	{
		const editorText = this._container.innerHTML;
		this._container.innerHTML = "";

		const existingClasses = this._container.getAttribute("class");
		this._container.setAttribute("class", (existingClasses ? (existingClasses + " ") : "") + "seoiwyg-editor");

		// Toolbar
		this._container.appendChild(this.toolbar.render());

		// Content
		this._content = document.createElement("div");
		this._content.setAttribute("contenteditable", "true");
		this._content.setAttribute("class", "seoiwyg-content");
		this._content.innerHTML = editorText;
		this._container.appendChild(this._content);
	}

	/**
	 * Remove placeholding text nodes with #8203 char
	 */
	private removePlaceholdingNodes()
	{
		const sel = window.getSelection();
		const el = this.getFocusedTextNode(sel);

		if (el != null && el.textContent)
		{
			if (SeoIwyg.PlaceHolderCharRegExp.test(el.textContent))
			{
				const range = sel.getRangeAt(0);
				const startOffset = range.startOffset;
				const endOffset = range.endOffset;

				// Remove placeholding characters
				let newTextContent = el.textContent.replace(SeoIwyg.PlaceHolderCharRegExp, "");

				// If non-empty string left (cuz blank text nodes are reoved from DOM)
				if (newTextContent.trim().length)
				{
					// length offset diff
					const diff = el.textContent.length - newTextContent.length;

					// Update content
					el.textContent = newTextContent;

					// Set new range
					range.setStart(range.startContainer, startOffset - diff);
					range.setEnd(range.endContainer, endOffset - diff);
					range.collapse(false);
				}
			}
		}
	}

	//endregion
}