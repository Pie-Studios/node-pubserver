var program = require('commander');
var server = require('../lib/server');

program
	.version('0.0.1')
	.option('-p, --port [portnumber]',"Port to listen on")
	.option('--host [hostname]', "Hostname to listen on")
	.option('-s, --serve [folder]', "Folder to serve markdown from")
	.parse(process.argv);

server.startServer(program.port, program.host, program.serve);