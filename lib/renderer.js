
var path 	= 	require("path"),
	fs   	= 	require( "fs" ),
	marked	= 	require("marked"),
	hljs	= 	require('highlight.js');
	


var templates = {};
var tplDir = path.resolve(__dirname + "/../templates/");
if(fs.existsSync("./templates/")) {
	tplDir = "./templates";
}
var files = fs.readdirSync(tplDir);
for(var f in files) {
	if(files[f].indexOf(".html") != -1) {
		templates[path.basename(files[f], ".html")] = fs.readFileSync("../templates/" + files[f]).toString();
	}
}
function buildTemplate(template, data) {
	var raw = templates[template];
	var r = null;
	for(var v in data) {
		if(data[v] == null) data[v] = "";
		r = new RegExp("{{" + v + "}}", 'g');
		raw = raw.replace(r, data[v]);
	}
	return raw;
}

var renderer = new marked.Renderer();
renderer.code = function(code, language) {
	var code = hljs.highlight(language, code).value;
	return buildTemplate("code", {
		"LANGUAGE": language,
		"CODE": code
	});
}
renderer.blockquote = function(quote) {
	return buildTemplate("blockquote", {
		"CONTENT": quote
	});
}
renderer.heading = function(text, level) {
	var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
	return buildTemplate("heading", {
		"LEVEL": level,
		"SAFETEXT": escapedText,
		"TEXT": text
	});
}
renderer.hr = function() {
	return buildTemplate("hr", {});
}
renderer.list = function(body, ordered) {
	return buildTemplate("list", {
		"ORDERED": ordered == true ? "o" : "u",
		"BODY": body
	});
}
renderer.listitem = function(text) {
	return buildTemplate("listitem", {
		"TEXT": text
	});
}
renderer.paragraph = function(text) {
	return buildTemplate("paragraph", {
		"TEXT": text
	});
}
renderer.table = function(header, body) {
	return buildTemplate("table", {
		"HEADER": header,
		"BODY": body
	});
}
renderer.tablerow = function(content) {
	return buildTemplate("tablerow", {
		"CONTENT": content
	});
}
renderer.tablecell = function(content, flags) {
	return buildTemplate("tablecell", {
		"HEAD": (flags.header == true ? "h" : "d"),
		"ALIGN": flags.align,
		"CONTENT": content
	});
}
renderer.strong = function(text) {
	return buildTemplate("strong", {
		"TEXT": text
	});
}
renderer.em = function(text) {
	return buildTemplate("em", {
		"TEXT": text
	});
}
renderer.codespan = function(code) {
	var code = hljs.highlightAuto(code).value;
	return buildTemplate("codespan", {
		"CODE": code
	});
}
renderer.br = function() {
	return buildTemplate("br", {})
}
renderer.del = function() {
	return buildTemplate("del", {
		"TEXT": text
	});
}
renderer.link = function(href, title, text) {
	return buildTemplate("link", {
		"HREF": href,
		"TITLE": title,
		"TEXT": text
	});
}
renderer.image = function(href, title, text) {
	return buildTemplate("image", {
		"HREF": href,
		"TITLE": title,
		"TEXT": text
	});
}
exports.buildTemplate = buildTemplate;
exports.instance = renderer;