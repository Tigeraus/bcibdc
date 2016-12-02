var http = require('http');

var words;	//待背单词集合，启动时向远程服务器请求

module.exports.getWord = function() {
	return words.splice(Math.floor(Math.random()*words.length),1)[0];
}

//从远程服务器获取单词数据
module.exports.getWordsFromRDS =  function getWordsFromRDS(user,callback) {
	var postbody = {
		user:user,
		len:30
	};
	var options = {
		hostname: 'hopeful.uicp.cn',
		port: '3001',
		path: '/gettestwords',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}
	var req = http.request(options, function(res) {
		var result = '';
		res.on('data', function(data) {
			result += data;
		});
		res.on('end', function() {
			var r = JSON.parse(result);
			if(r.err) {
				console.log(r);
				callback(false);
				return;
			}
			words = r.words;
			//console.log(words);
			callback(true);
		});
	});
	req.on('error', function(e) {
		console.log('getWordsFromRDS_error:'+e);
	});
	req.write(JSON.stringify(postbody));
	req.end();
}

