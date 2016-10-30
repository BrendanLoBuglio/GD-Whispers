var fs 		= require('fs'), 								//Filesystem guy
	path 	= require('path'),								//Other filesystem guy
	Twit 	= require('twit'),								//Twitter guy
	config 	= require(path.join(__dirname, 'config.js'));	//All my little Twitter keys

var T = new Twit(config);

T.get('statuses/user_timeline', {screen_name: '@grassmumblings', count: 3}, function(err, data, response)
{
	console.log(data);
});