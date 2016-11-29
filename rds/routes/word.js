var mysqlconn = require('./mysqlconn');

//提交上次测试结果
module.exports.commit = function commit(uid, wid, grade, rword) {
	var savetosql = function(conn, exist, level, gap, ef) {
		if(exist)
			conn.query("update uwords"+uid+" set level="+level+",gap="+gap+",ef="+ef+" where wid="+wid+";");
		else
			conn.query("insert into uwords"+uid+" (wid,level,gap,ef) values ("+wid+","+level+","+gap+","+ef+");");
	}
	mysqlconn.conn(function(conn) {
		//conn.query("create table if not exists uwords"+uid+" (wid int not null unique,level int not null default 0,ef float not null default 2.5,gap int not null default 0);");
		conn.query('select * from uwords'+uid+' where wid='+wid+';', function(err, results) {
			if(err) {
				console.log('commit_error:'+err);
				return;
			}
			var level = 0;
			var gap = 0;
			var ef = 2.5;
			var exist = false;
			if(results && results.length > 0) {	//查询到结果
				level = results[0].level;
				gap = results[0].gap;
				ef = results[0].ef;
				exist = true;
				console.log(level+','+gap+','+ef);
			}
			if(grade > 3) {
				if(level == 0) {
					gap = 1;
					level = 1;
				} else if(level == 1) {
					gap = 6;
					level = 2;
				} else {
					gap = Math.round(gap * ef);
					level = level + 1;
				}
			} else {
				level = 0;
				gap = 1;
			}
			var ef =  ef - 0.8 + 0.28 * grade - 0.02 * grade * grade;
			if(ef < 1.3) ef = 1.3;
			savetosql(conn, exist, level, gap, ef);
			getWord(conn, uid, rword);
		});
	});
}

//取一个新词
function getWord(conn, uid, rword) {
	conn.query('select wid from uwords'+uid+' where gap=0;', function(err, results) {
		if(err) {
			console.log('getWord_error:'+err);
			return;
		}
		var len = results.length;
		if(len > 0) {
			var rand = Math.random()*len;
			readWord(results[rand].wid, rword);
		} else {
			rword();						//返回null当没有词需要今天背的时候
		}
	});
}

//更新所有用户单词表的间隔（减一）
module.exports.updateGap;function updateGap() {
	mysqlconn.conn(function(conn) {
		conn.query("show tables like '%uwords%'", function(err, results) {
			if(err) {
				console.log('updateGap_error:'+err);
				return;
			}
			for(var i = 0; i < results.length; i ++) {
				var table = results[0]['Tables_in_demodb (%uwords%)'];
				conn.query("update "+table+" set gap=gap-1 where gap>0;");
			}
		});
	});
}

//从字典中读取单词
function readWord(wid, rword) {
	mysqlconn.conn(function(conn) {
		conn.query('select * from dictionary where id='+wid+';', function(err, results) {
			if(err) {
				console.log('readWord_error:'+err);
				return;
			}
			if(results.length <= 0) {
				rword();
			} else {
				rword(results[0]);
			}
		});
	});
}

//向用户单词表中加入新词
function addNew(uid, words) {
	mysqlconn.conn(function(conn) {
		
	});
}
