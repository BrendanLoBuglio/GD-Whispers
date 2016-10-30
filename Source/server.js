var fs 		= require('fs'), 								//Filesystem guy
	path 	= require('path'),								//Other filesystem guy
	Twit 	= require('twit'),								//Twitter guy
	config 	= require(path.join(__dirname, 'config.js'));	//All my little Twitter keys

var T = new Twit(config);

var statusFinder = require('./statusFinder');				//Status finder guy
var tweetSplitter = require('./tweetSplitter');
var screenName = "";
var tweetContentCache = {};
var replyID = "";
var tweetIndex = 0;
var lock = false;


trySendATweet();
setInterval(trySendATweet, 1000 * 30);

function trySendATweet()
{
	if(!lock){
		sendATweet();
		lock = true;
	}
}

function sendATweet()
{
	//Get commit message:
	var commitMessage 	= statusFinder.findStatus(fs);
	//Split into tweet-size chunks:
	tweetContentCache 	= tweetSplitter.splitTweetIntoChunks(commitMessage);
	var myUsername 		= T.get('account/verify_credentials',  function(err, data, response){
		screenName = "" + data.screen_name;
		replyID = "";
		tweetIndex = 0;
		sendTheTweet();
	});
}

function sendTheTweet()
{
	var tweetObj = {
		status: "",
		in_reply_to_status_id: -1
	};
	if(replyID == "")
	{
		var tweet = tweetContentCache[tweetIndex];
		console.log("tweet is " + tweet);
		tweetObj.status = tweet;
	}
	else {
		var replyTweet = '\@' + screenName + ' ' + tweetContentCache[tweetIndex];
		console.log("replyTweet is " + replyTweet);
		
		tweetObj.status = replyTweet;
		tweetObj.in_reply_to_status_id = replyID;
		
		console.log('replying to ' + tweetObj.in_reply_to_status_id);
	}
	
	tweetContentCache = tweetContentCache;
	console.log('Attempting tweet with content: \n' + tweetObj.status + '\n');
	T.post('statuses/update', tweetObj, function(err, data, response)
	{
		if(err){
			console.log('Error!');
			console.log(err);
		}
		else{
			console.log('Tweeted!');
			console.log('tweet id is ' + data.id_str);
			console.log('tweet reply ID is ' + data.in_reply_to_status_id);
			replyID = data.id_str;
		}
		
		if(tweetIndex + 1 < tweetContentCache.length){
			console.log('Replying to self...');
			tweetIndex++;
			setTimeout(sendTheTweet, 4000);
		}
		else
		{
			lock = false;
		}
	});
}