var program = require('commander'),
	path 	= require('path');

program
	.version('0.0.1')
	.option('-p, --port [portnumber]',"Port to listen on")
	.option('--host [hostname]', "Hostname to listen on")
	.option('-s, --serve [folder]', "Folder to serve markdown from when running as a server")
	.option('-r, --prerender [folder]', "Prerender all markdown files in the folder, suitable for static content webservers such as github pages")
	.parse(process.argv);

if(program.prerender) {
	var render = require('../lib/prerender');
	render.prerender(program.prerender);
} else if(program.port && program.host) {
	var server = require('../lib/server');
	server.startServer(program.port, program.host, program.serve || "./webroot");
}