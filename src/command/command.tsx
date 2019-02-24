/**
 * Command component class
 */
abstract class Command
{
	//region Fields

	/**
	 * Command name
	 */
	private _name: string;

	/**
	 * Command icon
	 */
	private _icon: string;

	/**
	 * Rendered entity
	 */
	public entity: Node | null = null;

	/**
	 * Last result f isActive called from SoIwyg class
	 * @type {boolean}
	 */
	public active: boolean = false;

	/**
	 * On click event
	 * @type {EditorEvent}
	 * @private
	 */
	private _onClick: EditorEvent<(event: Event) => void> = new EditorEvent<(event: Event) => void>();

	//endregion

	//region Properties

	/**
	 * Get onClick event
	 * @returns {EditorEvent<(event: Event) => void>}
	 */
	public get onClick() {
		return this._onClick;
	}

	public get name(): string
	{
		return this._name;
	}

	public get icon(): string
	{
		return this._icon;
	}

	//endregion

	/**
	 * Ctor
	 * @param {string} name
	 * @param {string} icon
	 */
	constructor(name: string, icon: string)
	{
		this._name = name;
		this._icon = icon;
	}

	//region Methods

	/**
	 * Render command button
	 */
	public render(): Node
	{
		return this.entity = (<span class={"seoiwyg-command-button" + (this.active ? " active" : "")}
									onClick={(...args) => this._onClick.invoke(...args)}>
				{/*<img src={tool.icon} alt={tool.name} title={tool.name}/>*/}
				{this.name}
			</span>);
	}

	/**
	 * On change event handling method
	 * @param {SeoIwyg} editor
	 * @param {Selection} selection
	 */
	public onChange(editor: SeoIwyg, selection: EditorSelection) {
		throw new Error("Not implemented. Do not call super.onChange();");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * On selection event handling method
	 * @param {SeoIwyg} editor
	 * @param {Selection} selection
	 */
	public onSelection(editor: SeoIwyg, selection: EditorSelection) {
		this.active = this.isActive(editor, selection);
		// throw new Error("Not implemented. Do not call super.onSelection();");
	}

	/**
	 * Apply command on selection
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 */
	abstract apply(editor: SeoIwyg, selection: EditorSelection): void;

	/**
	 * Redo (remove) command from selection
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 */
	abstract redo(editor: SeoIwyg, selection: EditorSelection): void;

	/**
	 * Method for command status check over given selection
	 * @param {SeoIwyg} editor
	 * @param {EditorSelection} selection
	 * @returns {boolean}
	 */
	abstract isActive(editor: SeoIwyg, selection: EditorSelection): boolean;

	//endregion
}