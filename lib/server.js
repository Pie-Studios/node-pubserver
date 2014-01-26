var http 	= 	require("http"),
	fs		=	require("fs"),
	marked	= 	require("marked"),
	crypto 	= 	require('crypto'),
	rdr		= 	require('./renderer');

function hitCache(file, name, callback) {
	var md5 = crypto.createHash('md5');
	var hash = md5.update(name).digest('hex');
	var cfile = "./cache/" + hash + ".html";
	fs.exists(cfile, function(exists) {
		if(exists) {
			fs.stat(file, function(err, stat) {
				fs.stat(cfile, function(err, cstat) {
					if(cstat.mtime.getTime() < stat.mtime.getTime()) {
						callback(false);
					} else {
						fs.readFile(cfile, function(err, data) {
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
	fs.exists("./cache/", function(exists) {
		if(exists) {
			fs.writeFile(file, data, function() {});
		} else {
			fs.mkdir("./cache/", function(err) {
				if(err) return;
				fs.writeFile(file, data, function() {});
			})
		}
	});
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
	console.log("Starting server on " + hostname + ":" + port);
	console.log("Serving files from " + basedir);
	var server = http.createServer(function(request, response) {
		var path = request.url;
		if(path.indexOf(".html") == -1) {
			if(path[path.length-1] == "/") {
				path = path + "index.html";
			} else {
				path = path + ".html";
			}
		}
		path = path.replace(".html", ".md");
		var file = basedir + path;
		fs.exists(file, function(exists) {
			if(exists) {
				hitCache(file, path, function(data) {
					if(data === false) {
						console.log("Compiling non-cached file " + file);
						fs.readFile(file, function(err, raw) {
							if(err) {
								console.log("Internal server error on " + file);
								console.log(err);
								response.writeHead("500");
								response.end("<h1>Internal Server Error</h1>");
								return;
							}
							var output = parseFile(raw.toString());
							saveCache(path, output);
							response.writeHead("200");
							response.end(output);
						});
					} else {
						console.log("Serving cached file " + file);
						response.writeHead("200");
						response.end(data);
					}
				});
			} else {
				console.log("404 not found: " + file);
				fs.readFile(basedir + "/404.md", function(err, raw) {
					var output = parseFile(raw.toString());
					saveCache("/404.md", output);
					response.writeHead("404");
					response.end(output);
				});
			}
		});
	}).listen(port, hostname);
}
exports.startServer = startServer;