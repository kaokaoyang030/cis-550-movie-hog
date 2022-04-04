var mysql = require("mysql");
const config = require("./config.json");

//  connection details
const connection = mysql.createConnection({
   host: config.rds_host,
   user: config.rds_user,
   password: config.rds_password,
   port: config.rds_port,
   database: config.rds_db,
});

connection.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");
});

async function hello(req, res) {
   // a GET request to /hello?name=Steve
   if (req.query.name) {
      res.send(`Hello, ${req.query.name}! Welcome to the Movies server!`);
   } else {
      res.send(`Hello! Welcome to the Movies server!`);
   }
}

async function all_matches(req, res) {
   sql = `
   Select movie_id
   from cast_db
   where cast_name = 'Tom Hanks';
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error);
         res.json({ error: error });
      } else if (results) {
         res.json({ results: results });
      }
   });
}

module.exports = {
   hello,
   all_matches,
};
