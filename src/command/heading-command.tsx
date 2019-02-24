///<reference path="command.tsx"/>

class HeadingCommand extends Command
{
	constructor()
	{
		super("Heading", "images/cmd/heading.png");
	}

	apply(editor: SeoIwyg, selection: EditorSelection): void
	{
		const Heading = "h" + ((this.getSectionHeadingRank(selection) || 0) + 1).toString();
		editor.wrapSelection(selection.selection, (<section><Heading></Heading></section>));
	}

	redo(editor: SeoIwyg, selection: EditorSelection): void
	{
		// const h = this.getSectionHeadingRank(selection);

		// No heading but trying to redo, error
		if (!selection.context.heading) { // if (!h)
			console.error("No heading found to redo.");
			return;
		}

		// const heading = "h" + h;

		editor.unwrapSelection(selection.selection, selection.context.heading);
	}

	isActive(editor: SeoIwyg, selection: EditorSelection): boolean
	{
		return !!selection.context.heading && selection.context.heading.contains(selection.selection.focusNode);
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * Return heading rank
	 * @param {EditorSelection} selection
	 * @returns {number | number}
	 */
	private getSectionHeadingRank(selection: EditorSelection): number | null {
		let lastH = selection.context.heading;
		return lastH ? parseInt(lastH.tagName.slice(-1)) : null;
	}
}