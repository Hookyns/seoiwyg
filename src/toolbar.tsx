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
	 * Last rendered node
	 * @type {null}
	 */
	private entity: Node | null = null;

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
			cmd.onClick.add((e) => {
				let orig = cmd.entity;
				this.seoIwyg.invokeCommand(cmd);

				if (orig)
				{
					this.reRenderCommand(cmd, orig);
				}
			});

			return cmd.render();
			// let el = cmd.render();
			// el.on("click", () => {
			// 	this.seoIwyg.invokeCommand(cmd);
			// });
			// return el;
		});

		return this.entity = (<div class="seoiwyg-tools">
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
			let orig = cmd.entity;

			// if (cmd.constructor.prototype.hasOwnProperty("onSelection")) {
			cmd.onSelection(editor, selection);
			// }

			if (orig)
			{
				this.reRenderCommand(cmd, orig);
			}
		}
	}

	/**
	 * Re-reder command
	 * @param {Command} cmd
	 * @param {Node} orig
	 */
	private reRenderCommand(cmd: Command, orig: Node) {
		(this.entity as Node).replaceChild(cmd.render(), orig);
	}
}