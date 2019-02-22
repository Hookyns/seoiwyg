/**
 * Toolbar component
 */
class Toolbar
{
	/**
	 * Instance of editor
	 */
	private seoIwyg: SeoIwyg;

	/**
	 * List of commands
	 * @type {Command[]}
	 */
	private commands: Array<Command> = [];

	/**
	 * Get registered commands list
	 * @returns {Command[]}
	 */
	get registeredCommands()
	{
		return this.commands.slice();
	}

	/**
	 * Ctor
	 * @param {SeoIwyg} seoiwyg
	 */
	constructor(seoiwyg: SeoIwyg)
	{
		this.seoIwyg = seoiwyg;

		this.seoIwyg.onChange((...args) => this.onEditorChange.apply(this, args));
		this.seoIwyg.onSelection((...args) => this.onEditorSelection.apply(this, args));
	}

	/**
	 * Add command to editor's toolbar
	 * @param {Command} command
	 */
	public addCommand(command: Command)
	{
		this.commands.push(command);
	}

	/**
	 * Render toolbar
	 * @returns {Element}
	 */
	public render(): Element
	{
		const toolButtons = this.commands.map(cmd => {
			let el = cmd.render();
			el.addEventListener("click", () => {
				this.seoIwyg.invokeCommand(cmd);
			});
			return el;
		});

		return (<div class="seoiwyg-tools">
			{toolButtons}
		</div>);
	}

	/**
	 * Call commands's onChange method
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 */
	private onEditorChange(editor: SeoIwyg, selection: EditorSelection)
	{
		for (let cmd of this.commands) {
			if (cmd.constructor.prototype.hasOwnProperty("onChange")) {
				cmd.onChange(editor, selection);
			}
		}
	}

	/**
	 * Call commands's onSelection method
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 */
	private onEditorSelection(editor: SeoIwyg, selection: EditorSelection)
	{
		for (let cmd of this.commands) {
			if (cmd.constructor.prototype.hasOwnProperty("onSelection")) {
				cmd.onSelection(editor, selection);
			}
		}
	}
}