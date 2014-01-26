var fs		=	require("fs"),
	marked	= 	require("marked"),
	path	=	require('path')
	rdr		= 	require('./renderer');
	
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
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + path.sep + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

function prerender(rpath) {
	rpath = path.resolve(rpath);
	fs.mkdir("./output/", function(err) {
		if(err) {
			if(err.code != "EEXIST") {
				throw err;
			}
		}
		walk(rpath, function(err, files) {
			for(var f in files) {
				var data = fs.readFileSync(files[f]);
				var fi = path.resolve('./output') + files[f].replace(rpath, '').replace(".md", ".html");
				console.log("Rendering " + files[f] + " to " + fi);
				var d = parseFile(data.toString());
				fs.writeFile(fi, d, function() {});
			}
		});
	});
}
exports.prerender = prerender;