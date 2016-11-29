var http = require('http');

var words;	//待背单词集合，启动时向远程服务器请求
var okwords = [];	//已被单词集合，结束时向远程服务器更新

module.exports.getWord = function() {
	return words.shift();
}

//从远程服务器获取单词数据
module.exports.getWordsFromRDS =  function getWordsFromRDS(user,callback) {
	var postbody = {
		user:user,
		len:50
	};
	var options = {
		hostname: 'localhost',
		port: '3001',
		path: '/getwords',
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
			console.log(words);
			callback(true);
		});
	});
	req.on('error', function(e) {
		console.log('getWordsFromRDS_error:'+e);
	});
	req.write(JSON.stringify(postbody));
	req.end();
}

//将单词数据更新到远程服务器
function updateWordsToRDS(user) {
	var postbody = {
		user:user,
		words:okwords
	};
	var options = {
		hostname: 'localhost',
		port: '3001',
		path: '/updatewords',
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
			console.log(result);
		});
	});
	req.on('error', function(e) {
		console.log('updateWordsToRDS_error:'+e);
	});
	req.write(JSON.stringify(postbody));
	req.end();
}

//提交上次测试结果
module.exports.commit = function commit(wid, grade) {
	if(words[0].wid != wid) //something wrong happend
		return false;
	var word = {
		wid:words[0].wid,
		repe:words[0].repe,
		ef:words[0].ef,
		gap:words[0].gap
	}
	if(grade > 3) {
		if(word.repe == 0) {
			word.gap = 1;
			word.repe = 1;
		} else if(word.repe == 1) {
			word.gap = 6;
			word.repe = 2;
		} else {
			word.gap = Math.round(word.gap * word.ef);
			word.repe = word.repe + 1;
		}
	} else {
		word.repe = 0;
		word.gap = 1;
	}
	word.ef =  word.ef - 0.8 + 0.28 * grade - 0.02 * grade * grade;
	if(word.ef < 1.3) word.ef = 1.3;
	words.shift();
	okwords.push(word);
	return true;
}

var user = {
	id:1,
	verify:'badafwaf'
}

/*getWordsFromRDS(user,function() {
	while(words.length > 0) {
		module.exports.commit(words[0].wid,3);
	}	
	//updateWordsToRDS(user);
});*/
