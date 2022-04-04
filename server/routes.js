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

async function sign_up(req, res) {
   const username = req.body.username;
   const password = req.body.password;
   if (!username || !password) {
      res.send("Enter username and password!");
      res.end();
   }
   let sql = `
   insert into Users
   value ('${username}', '${password}', 'NULL');
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         if (error.errno == 1062) {
            //duplicate username
            console.log(`Username already in use!`);
            res.json({ valid: false });
         } else {
            console.log(error);
            res.json({ error: error });
         }
      } else {
         res.json({ valid: true });
      }
   });
}

async function sign_in(req, res) {
   const username = req.body.username;
   const password = req.body.password;
   if (!username || !password) {
      res.send("Enter username and password!");
      res.end();
   }
   let sql = `
   select *
   from Users 
   where username = '${username}'
   and password = '${password}'
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error);
         res.json({ error: error });
      } else {
         const creds = JSON.parse(JSON.stringify(results));
         if (creds.length == 1) {
            req.session.username = username;
            req.session.loggedin = true;
            console.log(`Logged in as ${username}!`);
            res.json({ valid: true });
         } else {
            console.log(`Wrong logging details!`);
            res.json({ valid: false });
         }
      }
   });
}

async function favorites(req, res) {
   const username = req.body.username;
   let where_clause = "";
   if (username) {
      where_clause = `where username = '${username}'`;
   }
   let sql = `
   Select *
   from Favorites
   ${where_clause};
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

async function like(req, res) {
   const username = req.body.username;
   const movie_id = parseInt(req.body.movie_id);
   let sql = `
    insert into Favorites
    Value ('${username}', '${movie_id}', 'NULL')
    `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         if (error.errno == 1062) {
            //duplicate username
            console.log(`Movie already liked!`);
            res.json({ valid: false });
         } else if (error.errno == 1452) {
            console.log("Movie id or username doesnt exist!");
            res.json({ valid: false });
         } else {
            console.log(error);
            res.json({ error: error });
         }
      } else {
         res.json({ valid: true });
      }
   });
}

async function unlike(req, res) {
   const username = req.body.username;
   const movie_id = parseInt(req.body.movie_id);
   let sql = `
     delete from Favorites
     where username = '${username}'
     and movie_id = '${movie_id}'
     `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         if (error.errno == 1452) {
            console.log("Movie id or username doesnt exist!");
            res.json({ valid: false });
         } else {
            console.log(error);
            res.json({ error: error });
         }
      } else {
         res.json({ valid: true });
      }
   });
}

module.exports = {
   hello,
   sign_up,
   sign_in,
   favorites,
   like,
   unlike,
};
