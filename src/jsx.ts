// /*
// 	Taken from https://fettblog.eu/jsx-syntactic-sugar/
//  */
//
// /**
//  * A helper function that ensures we won't work with null values
//  */
// function nonNull(val, fallback) { return Boolean(val) ? val : fallback }
//
// /**
//  * How do we handle children. Children can either be:
//  * 1. Calls to DOMcreateElement, returns a Node
//  * 2. Text content, returns a Text
//  *
//  * Both can be appended to other nodes.
//  */
// function DOMparseChildren(children) {
// 	return children.map(child => {
// 		if(typeof child === 'string') {
// 			return document.createTextNode(child);
// 		}
// 		return child;
// 	})
// }
//
// /**
//  * How do we handle regular nodes.
//  * 1. We create an element
//  * 2. We apply all properties from JSX to this DOM node
//  * 3. If available, we append all children.
//  */
// function DOMparseNode(element, properties, children) {
// 	const el = document.createElement(element);
// 	Object.keys(nonNull(properties, {})).forEach(key => {
// 		el[key] = properties[key];
// 	});
// 	DOMparseChildren(children).forEach(child => {
// 		if (child instanceof Array)
// 		{
// 			el.appendChild(child[0]);
// 		}else
// 		{
// 			el.appendChild(child);
// 		}
// 	});
// 	return el;
// }
//
// /**
//  * Our entry function.
//  * 1. Is the element a function, than it's a functional component.
//  *    We call this function (pass props and children of course)
//  *    and return the result. We expect a return value of type Node
//  * 2. If the element is a string, we parse a regular node
//  */
// function DOMcreateElement(element, properties, ...children) {
// 	if(typeof element === 'function') {
// 		return element({
// 			...nonNull(properties, {}),
// 			children
// 		});
// 	}
// 	return DOMparseNode(element, properties, children);
// }

function createElement(name: string, props: { [id: string]: any } = {}, ...children)
{
	const el = document.createElement(name);

	for (let prop in props)
	{
		if (props.hasOwnProperty(prop))
		{
			// Event bind - prefix "on" followed by uppercase letter
			if (prop.slice(0, 2) === "on" && prop.slice(2, 3).charCodeAt(0) <= 90) {
				el.addEventListener(prop.slice(2).toLowerCase(), props[prop]);
			}
			else
			{
				if (prop === "className")
				{
					prop = "class";
				}

				el.setAttribute(prop, props[prop]);
			}
		}
	}

	if (children)
	{
		if (children[0] && children[0].constructor === Array)
		{
			children = children[0];
		}

		for (let child of children)
		{
			if (typeof child === "string") {
				child = document.createTextNode(child);
			}

			if (child)
			{
				el.appendChild(child);
			}
		}
	}

	return el;
}