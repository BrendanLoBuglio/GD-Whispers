module.exports = 
{
	splitTweetIntoChunks: function(commitMessage)
	{
		if(commitMessage.length <= 140) {
			return [commitMessage];
		}
		else{
			var output = [];
			var currentChunk = "";
			for(var i = 0; i < commitMessage.length; i++){
				currentChunk += commitMessage[i]; 
				if(currentChunk.length >= 120){
					//Back up to whitespace, if possible:
					if(currentChunk.includes(' ') || currentChunk.includes('/n')) {
						while(commitMessage[i] != ' ' && commitMessage[i] != '/n')
						{
							currentChunk = currentChunk.substring(0, currentChunk.length - 1);
							i--;
						}
					}
					
					output.push(currentChunk);
					currentChunk = "";
				}
			}
			output.push(currentChunk);
			
			return output;
		}
	}
}