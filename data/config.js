const dev = process.env.NODE_ENV === "development";
console.log("dev:", dev);

const config = {
	// node server
	port: process.env.PORT,
	
	// URI and location preparation
	userPath: "users",
	apisPath: "apis",
	dumpsPath: "dumps",
	dataPath: "data",
	
	// web server
	scheme: process.env.SCHEME,
	authority: process.env.AUTHORITY,
	prepath: process.env.PREPATH,
	host: process.env.HOST,
	
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
		host: process.env.SMTP_SERVER_HOST,
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
