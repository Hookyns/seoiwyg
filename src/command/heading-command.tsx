///<reference path="command.tsx"/>

class HeadingCommand extends Command
{
	constructor()
	{
		super("Heading", "images/cmd/heading.png");
	}

	apply(editor: SeoIwyg, selection: EditorSelection): void
	{
		selection.context.heading.tagName
		editor.wrapSelection(selection.selection, (<strong></strong>));
	}

	redo(editor: SeoIwyg, selection: EditorSelection): void
	{
		console.log("REDO");
		editor.unwrapSelection(selection.selection, "strong,b");
	}

	isActive(editor: SeoIwyg, selection: EditorSelection): boolean
	{
		console.log(selection);

		if (selection.element)
		{
			let strong = selection.element.closest("strong,b");

			if (strong != null)
			{
				return true;
			}
		}

		return false;
	}
}