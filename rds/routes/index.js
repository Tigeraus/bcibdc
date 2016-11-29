var express = require('express');
var mysqlconn = require('./mysqlconn');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}).post('/', function(req, res, next) {
	console.log(req.body);

	res.send('post');
});

router.post('/getwords', function(req, res, next) {
	var user = req.body.user;
	verifyUser(user, function(ok) {
		if(ok) {
			mysqlconn.conn(function(conn) {
				conn.query('select * from uwords'+user.id+' where gap<=0 order by gap DESC;', function(err, results) {
					if(err) {
						console.log('getwords_error:'+err);
						return res.status(500).json({err:'something wrong happend in mysql:'+err});
					}
					var words = [];
					var len = req.body.len;
					//将所有非新词加入
					if(results.length < len) {
						words = results;
					} else {
						while(results[0].gap > -10 && words.length <= len) {	
							words.push(results.unshift());
						}
						while(words.length < len) {
							var index = Math.floor(Math.random() * results.length);
							words.push(results[index]);
							results.remove(index);
						}
					}
					getWordsFromDictionary(words, function() {
						res.json({words:words});	
					});
				});
			});	
		} else {
			res.status(400).json({err:'user verify failed!'});
		}
	});
});

router.post('/updatewords', function(req, res, next) {
	console.log(req.body);
	res.send('success!');
});

router.post('/gettestwords', function(req, res, next) {
	var user = req.body.user;
	verifyUser(user, function(ok) {
		if(ok) {
			mysqlconn.conn(function(conn) {
				var words = [];
				var len = req.body.len;
				var que = function(i) {
					conn.query('select * from dictionary where level='+i+';', function(err, results) {
						if(err) {
							console.log('gettestwords_error:'+err);
							return res.status(500).json({err:'something wrong happend in mysql:'+err});
						}
						if(results.length < len / 6) {
							while(results.length > 0)
								words.push(results.shift());
						} else {
							while(words.length <= len * (i+1) / 6) {
								var index = Math.floor(Math.random()*results.length);
								words.push(results.splice(index,1)[0]);
							}
						}
						if(i<5)
							que(i+1);
						else {
							console.log(words);
							res.json({words:words});
						}
					});
				}
				que(0);
			});	
		} else {
			res.status(400).json({err:'user verify failed!'});
		}
	});
});

function verifyUser(user, callback) {
	mysqlconn.conn(function(conn) {
		conn.query('select verify from users where id='+user.id+';',function(err, results){
			if(err) {
				console.log('verifyUser_error:'+err);
				callback(false);
				return;
			}
			if(results && results.length > 0 && user.verify == results[0].verify) {
				callback(true);
			} else {
				callback(false);
			}
		});
	});
}

function getWordsFromDictionary(words, callback) {
	var len = words.length;
	var getWordFromDictionary = function(conn, word) {
		conn.query('select * from dictionary where id='+word.wid+';', function(err, results) {
			if(err) {
				console.log('getWordFromDictionary_error:'+err);
				words.push(word);
				return;
			}
			if(!results || results.length <=0) {
				words.push(word);
			} else {
				word.word = results[0].word;
				word.mean = results[0].mean;
				words.push(word);
			}
			if(words.length == len) {
				callback();
			}
		});
	};
	mysqlconn.conn(function(conn) {
		while(words.length > 0) {
			getWordFromDictionary(conn, words.shift());
		}
	});
}

module.exports = router;
