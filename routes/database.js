var mysql=require('mysql');

const connectionPool=mysql.createPool({
    connectionLimit:10,
    socketPath:'/Applications/MAMP/tmp/mysql/mysql.sock',
    host:'localhost',
    user:'root',
    password:'root',
    port:8889,
    database:'kautilya_hms_app',
    multipleStatements:true
    })

connectionPool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
                console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
                console.error('Database connection was refused.')
            }
        }
        if (connection) connection.release()
        return
    })
module.exports = connectionPool