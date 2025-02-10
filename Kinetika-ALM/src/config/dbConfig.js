const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'alm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Wrap the pool query in a Promise to allow async/await usage
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  query,
  pool, // Export the pool if needed elsewhere
};
