const $fs = require("fs");
const $path = require("path");

$fs.copyFileSync(
	require.resolve("document-outliner/bundle/document-outliner.js"),
	$path.join(__dirname, "dist", "document-outliner.js")
);