class EditorEvent<THandler extends Function> {
	/**
	 * Handlers
	 * @type {Function[]}
	 */
	private handlers: Array<THandler> = [];

	/**
	 * Was event already invoked this event loop?
	 * @type {boolean}
	 */
	private invoked: boolean = false;

	/**
	 * Add handler
	 * @param {Function} handler
	 */
	public add(handler: THandler) {
		this.handlers.push(handler);
	}

	/**
	 * Invoke handlers
	 * @param args
	 */
	public invoke(...args) {
		if (this.invoked) {
			return;
		}

		this.invoked = true;

		setTimeout(() => {
			this.invoked = false;
		}, 0);

		for (let handler of this.handlers) {
			handler.apply(null, args);
		}
	}
}