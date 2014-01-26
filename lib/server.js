var http 	= 	require("http"),
	fs		=	require("fs"),
	marked	= 	require("marked"),
	url 	= 	require("url"),
	crypto 	= 	require('crypto'),
	rdr		= 	require('./renderer');

function hitCache(file, path, callback) {
	var md5 = crypto.createHash('md5');
	var hash = md5.update(name).digest('hex');
	var cfile = "./cache/" + hash + ".html";
	fs.exists(cfile, function(exists) {
		if(exists) {
			fs.stat(file, function(stat) {
				fs.stat(cfile, function(cstat) {
					if(cstat.mtime.getTime() < stat.mtime.getTime()) {
						callback(false);
					} else {
						fs.readFile(file, function(err, data) {
							callback(data.toString());
						});
					}
				});
			});
		} else {
			callback(false);
		}
	});
}
function saveCache(name, data) {
	var md5 = crypto.createHash('md5');
	var hash = md5.update(name).digest('hex');
	var file = "./cache/" + hash + ".html";
	fs.writeFile(file, data);
}
function parseFile(fileData) {
	var title = "Untitled Document";
	var tokens = marked.lexer(fileData);
	for(var t in tokens) {
		if(tokens[t].type == 'heading' && tokens[t].depth < 4) {
			title = tokens[t].text;
			break;
		}
	}
	var output = marked.parser(tokens, { renderer : rdr.instance });
	output = rdr.buildTemplate("body", {
		"TITLE": title,
		"BODY": output
	});
	return output;
}
function startServer(port, hostname, basedir) {
	var server = http.createServer(function(request, response) {
		var path = request.url;
		if(path.indexOf(".md") == -1) {
			if(path[path.length-1] == "/") {
				path = path + "index.md";
			} else {
				path = path + ".md";
			}
		}
		var file = basedir + path;
		fs.exists(file, function(exists) {
			if(exists) {
				hitCache(file, path, function(data) {
					if(data === false) {
						fs.readFile(file, function(err, data) {
							if(err) {
								response.writeHead("500");
								response.end("<h1>Internal Server Error</h1>");
								return;
							}
							var output = parseFile(data.toString());
							saveCache(path, output);
							response.writeHead("200");
							response.end(output);
						});
					} else {
						response.writeHead("200");
						response.end(data);
					}
				});
			} else {
				fs.readFile(basedir + "/404.md", function(err, data) {
					var output = parseFile(data.toString());
					saveCache("/404.md", output);
					response.writeHead("404");
					response.end(output);
				});
			}
		});
	}).listen(port, hostname);
}
exports.startServer = startServer;