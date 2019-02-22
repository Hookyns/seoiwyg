declare interface EditorSelectionContext
{
	/**
	 * Current section
	 */
	section: Element | null;

	/**
	 * Heading of current section
	 */
	heading: Element | null;

	/**
	 * Parent heading
	 */
	parentHeading: Element | null;

	/**
	 * Main heading in current tree
	 * @description It'll be always H1. Eg.
	 * <section>
	 *     <h1>Main1</h1>
	 *     <p>Text</p>
	 *
	 *     <section>
	 *         <h2>Minor 1.1</h2>
	 *         <p>
	 *             [CURSOR POSITION]
	 *         </p>
	 *     </section>
	 * </section>
	 * <section>
	 *     <h1>Main2</h1>
	 *     <p>Text</p>
	 * </section>
	 * The main heading will be <h1> Main1
	 */
	mainHeading: Element | null;
}

declare interface EditorSelection
{
	/**
	 * Original selection
	 */
	selection: Selection;

	/**
	 * Selection context
	 */
	context: EditorSelectionContext;

	/**
	 * Selected text
	 */
	text: string;

	/**
	 * Focused element
	 */
	element: Element | null;

	/**
	 * Focused text node
	 */
	node: Node;
}