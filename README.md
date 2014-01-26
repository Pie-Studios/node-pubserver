# http-pubserver
Pubserver can be used to both host and render markdown files.
Complete with templates for all markdown features, it is great for generating and/or hosting documentations and other quick publications.

## How to use

Install as global package, then use the pubserver executable.

To host as an http server:

	pubserver --host 127.0.0.1 -p 8008 -s /usr/share/program/docs
	
To prerender for static hosting(such as GitHub pages):

	pubserver -r /usr/share/program/docs
	
