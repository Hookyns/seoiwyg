declare class DocumentOutliner
{
	constructor(any: any);
}

/**
 * Command for shoving document outline
 */
class OutlineCommand extends Command
{
	/**
	 * CSS class for this component
	 * @type {string}
	 */
	private static className: string = "seoiwyg-outline-show";

	/**
	 * Crated outline container
	 * @type {Element}
	 */
	private outlineContainer: Element = undefined as any;

	/**
	 * Ctor
	 */
	constructor()
	{
		super("Outline", "images/cmd/outline.png");
	}

	/**
	 * Show outline panel, create if not exists yet
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 */
	apply(editor: SeoIwyg, selection: EditorSelection): void
	{
		if (this.outlineContainer == undefined)
		{
			this.createOutlineContainer(editor);
		}

		this.updateOutline(editor);
		this.outlineContainer.removeAttribute("style");
		editor.container.setAttribute("class",
			(editor.container.getAttribute("class") || "") + " " + OutlineCommand.className);
	}

	/**
	 * Hide outline panel
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 */
	redo(editor: SeoIwyg, selection: EditorSelection): void
	{
		editor.container.setAttribute("class",
			(editor.container.getAttribute("class") || "")
				.replace(new RegExp("\\s?" + OutlineCommand.className), ""));
	}

	/**
	 * Is outline panel active/visible?
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 * @returns {boolean}
	 */
	isActive(editor: SeoIwyg, selection: EditorSelection): boolean
	{
		return (editor.container.getAttribute("class") || "").indexOf(OutlineCommand.className) !== -1;
	}

	/**
	 * Redraw outline on change
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 */
	public onChange(editor: SeoIwyg, selection: EditorSelection): void
	{
		// Redraw outline only if heading element changed (cuz of performance)
		if (selection.element) { // TODO: This will be problem on paste insert. There should be some heading but we don't know about it. => delegating original event would be nice cuz InputEvent contains inputType property but mozilla does not support this property
			if (/^h[1-9]$/i.test(selection.element.tagName.slice(0, 2))) {
				this.updateOutline(editor);
			}
		}
	}

	/**
	 * Create outline container
	 */
	private createOutlineContainer(editor: SeoIwyg)
	{
		this.outlineContainer = editor.container.insertBefore((
			<div class="seoiwyg-outline"></div>
		), editor.content);
	}

	/**
	 * Update outline
	 * @param {SeoIwyg} editor
	 */
	private updateOutline(editor: SeoIwyg)
	{
		const content = editor.content.innerHTML;
		// noinspection TypeScriptUnresolvedFunction
		const outliner: any = new DocumentOutliner(editor.content);
		outliner.makeList(this.outlineContainer);

		// content.replace(/<h[1-9]>.*?<\/h[1-9]>/, function (match, args) {
		//
		// 	return match;
		// });
	}
}