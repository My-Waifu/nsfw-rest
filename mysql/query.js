const mysql = require("mysql2");
const pool = mysql.createPool({connectionLimit: 10, host: "localhost", user: "root", database: "waifudb"});

export async function query(query, params, callback) {
    pool.getConnection(async function (error, connection) {

        if (error) {
            connection.release();
            callback(null, error);
            console.log(error);
            return;
        }

        connection.query(query, params, async function (err, rows) {
            connection.release();
            if (!err) callback(rows);
            else callback(null, err);
        });

        connection.on('error', async function (error) {
            connection.release();
            callback(null, error);
            console.log(error);
        });
    });
}
