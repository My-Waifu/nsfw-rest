const mysql = require("mysql2");
const pool = mysql.createPool({connectionLimit: 10, host: "localhost", user: "root", database: "waifudb"});

const database = (function () {

    function _query(query, params, callback) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                callback(null, err);
                throw err;
            }

            connection.query(query, params, function (err, rows) {
                connection.release();
                if (!err) callback(rows);
                else callback(null, err);
            });

            connection.on('error', function (err) {
                connection.release();
                callback(null, err);
                throw err;
            });
        });
    }
    return {query: _query};
})();

module.exports = database;