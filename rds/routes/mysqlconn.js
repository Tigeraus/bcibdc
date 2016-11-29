var mysql  = require('mysql');  //调用MySQL模块

var pool = mysql.createPool({     
  host     : 'localhost',
  user     : 'root',
  password : 'hopeful4910',
  database : 'demodb',
  port: '3306',
});

module.exports.conn = function(callback) {
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log('mysqlconn_error:'+err);
		}
		callback(connection);
		connection.release();
	});
}
