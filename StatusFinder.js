module.exports = 
{
	findStatus: function(fs)
	{
		//Read our list of commit messages!
		var data = fs.readFileSync('log.txt', 'utf8');
		
		//Process the data into an array:
		var statusArray = data.split("$$$");
		console.log("statusArray is " + statusArray.length + " commits long");
		
		var choseGoodCommit = false;
		var commitMessageToTweet = "";
		
		while(!choseGoodCommit) {
			//Pick our random index:
			var randomIndex = Math.floor(Math.random() * statusArray.length);
			//Save our data:
			var fullCommitInfo = statusArray[randomIndex];
			var hashAndMessage = separateHash(fullCommitInfo);
			
			if(checkAlreadyTweeted(fs, hashAndMessage.hash)) {
				console.log('Already tweeted ' + hashAndMessage.hash);
			}
			else if(hashAndMessage.message.includes("Merge branch")) {
				console.log('Removing merge commit ' + hashAndMessage.hash);
				markAlreadyTweeted(fs, hashAndMessage.hash);
			}
			else {
				console.log('Marking ' + hashAndMessage.hash);
				markAlreadyTweeted(fs, hashAndMessage.hash);
				commitMessageToTweet = hashAndMessage.message;
				choseGoodCommit = true;
			}
		}
		
		return commitMessageToTweet;
	}
}

function separateHash(stringIn)
{
	//Takes in a full commit, including its message and its hash. Separates, cleans, and returns each.
	var hashString = "";
	var startedHash = false;
	for(var i = 0; i < stringIn.length; i++) {
		if(stringIn[i] == '@') {
			startedHash = !startedHash;
			hashString += stringIn[i];
		}
		else if(startedHash){
			hashString += stringIn[i];
		}
	}
	
	var commitString = hashString
	
	var outputContent = {
		hash: 	'',
		message: ''
	};
	outputContent.hash = hashString;
	while(outputContent.hash.includes('@'))
	{
		outputContent.hash = outputContent.hash.replace('@', '');
	}
	outputContent.message = stringIn.replace(hashString, '').trim();
	return outputContent;
}

function checkAlreadyTweeted(fs, hash)
{
	var data = fs.readFileSync('usedUpHashes.txt', 'utf8');
	var tweetedHashes = data.split(',');
	
	for(var i = 0; i < tweetedHashes.length; i++) {
		if(hash == tweetedHashes[i]){
			return true;
		}
	}
	return false;
}

function markAlreadyTweeted(fs, hash)
{
	if(hash == '')
		return;
	
	//Write the hash to the usedUpHashes txt:
	var usedUpHashes = fs.readFileSync('usedUpHashes.txt', 'utf8');
	if(usedUpHashes.trim().length > 0){
		usedUpHashes += ',\n' + hash;
	}
	else{
		usedUpHashes = hash;
	}
	
	fs.writeFileSync('usedUpHashes.txt', usedUpHashes, 'utf8');
	
	//Subtract the relevant entry from the log txt:
	var data = fs.readFileSync('log.txt', 'utf8');
	var statusArray = data.split("$$$");
	var removed = false;
	for(var i = 0; i < statusArray.length; i++){
		var redundantIndex = statusArray[i].indexOf(hash);
		if(redundantIndex > -1) {
			statusArray.splice(i, 1);
			removed = true;
			i--;
		}
	}
	
	if(removed) {
		var newLogContent = '';
		for(var i = 0; i < statusArray.length; i++){
			newLogContent += statusArray[i];
			if(i < statusArray.length - 1){
				newLogContent += "$$$";
			}
		}
		
		fs.writeFileSync('log.txt', newLogContent, 'utf8');		
	}
}