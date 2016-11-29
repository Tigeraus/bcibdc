var express = require('express');
var word = require('./word');
var router = express.Router();
var machine = require('./machine');

var postbody;

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});
/*.post('/', function(req, res, next) {
	var cookie = req.cookies;
	if(!cookie.uid || cookie.uid <= 0) {
		res.cookie('uid',1).status(400).send('未知用户！');
	} else {
		if(!req.body.wid) {
			word.getWordsFromRDS({
				id: cookie.uid,
				verify: '123'
			}, function(ok) {
				if(ok) {
					machine.connect();
					resWord(res);
				} else {
					res.status(400).send('user verify failed!');
				}	
			});
		} else {
			machine.pause(req.body.wid,req.body.grade);
			resWord(res);
		}
	}
});*/

function resWord(res) {
	var w = word.getWord();
	if(w == undefined) {
		machine.disconnect();
	} else {
		res.json(w);
		machine.start(w.wid);
	}
}

module.exports = router;
