///<reference path="command.tsx"/>

/**
 * Simple tag command
 */
class SimpleTagCommand extends Command
{
	/**
	 * Primary tag name
	 * @type {string}
	 */
	private tagName: string = "";

	/**
	 * Secondary tag name
	 * @type {string}
	 */
	private secondaryTagName: string | null = null;

	/**
	 * Selector
	 */
	private selector: string = undefined as any;

	/**
	 * Ctor
	 * @param {string} name
	 * @param {string} icon
	 * @param {string} tag Eg. "strong"
	 * @param {string} secondaryTag Eg. "b"
	 */
	constructor(name: string, icon: string, tag: string, secondaryTag: string | null = null)
	{
		super(name, icon);

		this.tagName = tag;
		this.secondaryTagName = secondaryTag;
		this.selector = tag + (secondaryTag ? ("," + secondaryTag) : "");
	}

	apply(editor: SeoIwyg, selection: EditorSelection): void
	{
		// noinspection JSUnusedLocalSymbols
		const Tag = this.tagName;
		editor.wrapSelection(selection.selection, (<Tag></Tag>));
	}

	redo(editor: SeoIwyg, selection: EditorSelection): void
	{
		editor.unwrapSelection(selection.selection, this.selector);
	}

	isActive(editor: SeoIwyg, selection: EditorSelection): boolean
	{
		if (selection.element)
		{
			let strong = selection.element.closest(this.selector);

			if (strong != null)
			{
				return true;
			}
		}

		return false;
	}
}