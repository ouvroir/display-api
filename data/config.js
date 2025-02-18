const config = {
	// node server
	port: 8888,
	
	// URI and location preparation
	userPath: "users",
	apisPath: "apis",
	dumpsPath: "dumps",
	dataPath: "data",
	
	// web server
	scheme: dev ? "http" : "https",
	authority:  dev ? "localhost:8888" : "crafts.ntnlv.ca:450",
	prepath: "", 
	
	// users, api and dump lists
	usersFile: "users.json",
	listDumpFileEnding: "_dumpIndex.json",
	
	// lang
	nolang: "en",
	
	// root
	root: "root",
	rootEmail: process.env.SMTP_USER,	
	
	// SMTP server
	smtpServer: {
		host: "ntnlv.ca",
		port: process.env.SMTP_SERVER_PORT,
		secure: true,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		}
 	},
 	
 	// timespan of a resource in the cache
 	daysCache: 3,
 	millisecsCleanCache: 60*60*1000, // every hour
 	
 	// google analytics
 	gaTrackId: ""
}

module.exports = config
