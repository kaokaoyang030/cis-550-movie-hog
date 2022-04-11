var mysql = require("mysql");
const config = require("./config.json");

// connection details
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

/* dummy route */
async function hello(req, res) {
   // a GET request to /hello?name=Steve
   if (req.query.name) {
      res.send(`Hello, ${req.query.name}! Welcome to the Movies server!`);
   } else {
      res.send(`Hello! Welcome to the Movies server!`);
   }
}

/*
Purpose: allows users to sign up and create credentials to sign in 
Type: POST
Arguments: body.username, body.password 
Return: username if successful, otherwise null
*/
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
            res.json({ username: username });
         } else {
            console.log(error);
            res.json({ error: error });
         }
      } else {
         res.json({ username: null });
      }
   });
}

/*
Purpose: checks credentials provided by user to sign in against database to allow access 
Type: POST
Arguments: body.username, body.password 
Return: username if successful, otherwise null
*/
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
            res.json({ username: username });
         } else {
            console.log(`Wrong logging details!`);
            res.json({ username: null });
         }
      }
   });
}

/* 
Purpose: displays movies liked by a specific user all all users 
Type: GET
Arguments: (optional) query.username
Return: list of {username, movie_id} liked by username
*/
async function favorites(req, res) {
   const username = req.query.username;
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

/* 
Purpose: adds movie_id to list of favorites for username
Type: POST
Arguments: body.username, body.movie_id
Return: {username, movie_id} if succesful, otherwise {null, null}
*/
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
            res.json({ username: null, movie_id: null });
         } else if (error.errno == 1452) {
            //not found
            console.log("Movie id or username doesnt exist!");
            res.json({ username: null, movie_id: null });
         } else {
            console.log(error);
            res.json({ error: error });
         }
      } else {
         res.json({ username: username, movie_id: movie_id });
      }
   });
}

/* 
Purpose: removes movie_id from list of favorites for username
Type: POST
Arguments: body.username, body.movie_id
Return: {username, movie_id} if succesful, otherwise {null, null}
*/
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
            res.json({ username: null, movie_id: null });
         } else {
            console.log(error);
            res.json({ error: error });
         }
      } else {
         res.json({ username: username, movie_id: movie_id });
      }
   });
}

async function likes(req, res) {
   const movie_id = req.query.movie_id;
   let where_clause = movie_id ? `where movie_id = '${movie_id}'` : "";
   let sql = `
     select movie_id, count(*) as likes
     from Favorites
     ${where_clause}
     group by movie_id
     `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function users(req, res) {
   let sql = `
     select username
     from Users
     `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function resilient(req, res) {
   let revs = req.query.revs ? req.query.revs : "100000000"; //default value
   let sql = `
   with losing as (
      select distinct md.movie_id, title, budget, revs
      from cast_db
               join meta_db md on cast_db.movie_id = md.movie_id
      where revs - budget < -'${revs}'
        and revs > 1000
        and budget > 1000
      order by revs - budget
      #limit 100
  ),
   lose_actors as (
      select *
      from cast_db
      where movie_id in (select movie_id from losing)
  ),
  winning as (
      select distinct md.movie_id, title, budget, revs
      from cast_db
               join meta_db md on cast_db.movie_id = md.movie_id
      where revs - budget > '${revs}'
        and revs > 1000
        and budget > 1000
      order by revs - budget DESC
      #limit 100
  ),
  win_actors as (
      select *
      from cast_db
      where movie_id in (select movie_id from winning)
  )
  select cast_name
  from lose_actors
  where cast_name in (select cast_name from win_actors);
     `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function versatile(req, res) {
   let sql = `
   select cast_name, count(distinct genre) as genres
   from genres_db 
         join cast_db cd 
         on genres_db.movie_id = cd.movie_id
   where cd.movie_id in (
      select movie_id from meta_db 
      )
   group by cast_name
   order by count DESC;
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function top_rating(req, res) {
   const max = req.query.max;
   let limit_clause = max ? `LIMIT ${max}` : "";
   let sql = `
   WITH rating AS(
         SELECT movie_id, ROUND(AVG(rating),1) as RATING, COUNT(*) AS RatingCounts
         FROM ratings_db
         GROUP BY movie_id
   )
   SELECT meta_db.movie_id, TITLE, YEAR(release_date) AS YEAR, runtime,rd.rating
   FROM meta_db JOIN rating rd on meta_db.movie_id = rd.movie_id
   WHERE rd.RatingCounts > 50
   ORDER BY rd.rating DESC
   ${limit_clause};
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function top_review(req, res) {
   const max = req.query.max;
   let limit_clause = max ? `LIMIT ${max}` : "";
   let sql = `
   WITH rating AS(
      SELECT movie_id, ROUND(AVG(rating),1) as RATING, COUNT(*) AS RatingCounts
      FROM ratings_db
      GROUP BY movie_id
  )
  SELECT meta_db.movie_id, TITLE, YEAR(release_date) AS year, runtime, RatingCounts
  FROM meta_db JOIN rating rd on meta_db.movie_id = rd.movie_id
  WHERE rd.RatingCounts > 50
  ORDER BY RatingCounts DESC
  ${limit_clause};
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function random_genre(req, res) {
   let max = req.query.max ? req.query.max : 1;
   let genre = req.query.genre ? req.query.genre : "Comedy";
   let min_year = req.query.min_year ? req.query.min_year : 2000;
   let max_year = req.query.max_year ? req.query.max_year : 2020;
   let sql = `
   SELECT *
   FROM meta_db JOIN genres_db gd on meta_db.movie_id = gd.movie_id
   WHERE gd.genre = '${genre}'
   AND release_date >= ${min_year}
   AND release_date <= ${max_year}
   ORDER BY RAND()
   LIMIT ${max};
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function actors(req, res) {
   let max = req.query.max ? req.query.max : 10;
   let where_clause = req.query.title
      ? `title =  '${req.query.title}'`
      : "title = 'Forrest Gump'";
   where_clause = req.query.movie_id
      ? `md.movie_id = ${req.query.movie_id}`
      : where_clause; //overwrites title !
   let sql = `
   SELECT DISTINCT cast_name
   FROM cast_db 
      JOIN meta_db md on cast_db.movie_id = md.movie_id
   WHERE ${where_clause}
   LIMIT ${max}
   `;
   console.log(sql);
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function co_actors(req, res) {
   let actor = req.query.actor ? req.query.actor : "Tom Hanks";
   let sql = `
   WITH movies_cast_in AS (
         SELECT md.movie_id, title
         FROM cast_db 
            JOIN meta_db md 
            on cast_db.movie_id = md.movie_id
         WHERE cast_name = '${actor}'
   )
   SELECT DISTINCT cast_name
   FROM cast_db 
      JOIN meta_db md 
      on cast_db.movie_id = md.movie_id
   WHERE cast_name <> '${actor}' 
   AND md.movie_id IN (
         SELECT movie_id
         FROM movies_cast_in
   );
   `;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

async function connections(req, res) {
   let actor = req.query.actor ? req.query.actor : "Tom Hanks";
   let max = req.query.max ? req.query.max : 10;
   let sql = `
   WITH movies_cast_in AS (
         SELECT md.movie_id, cast_name,title
         FROM cast_db 
            JOIN meta_db md on cast_db.movie_id = md.movie_id
         WHERE cast_name = '${actor}' 
   ),
   actors_network1 AS (
         SELECT DISTINCT cd.cast_name
         FROM cast_db cd 
            JOIN movies_cast_in mc on cd.movie_id = mc.movie_id
         WHERE cd.cast_name <> '${actor}' 
   ),
   movies_cast_in1 AS (
         SELECT md.movie_id,title
         FROM actors_network1 an 
            JOIN cast_db cd ON an.cast_name = cd.cast_name 
            JOIN meta_db md ON cd.movie_id = md.movie_id
         WHERE md.movie_id NOT IN (
            SELECT movie_id
            FROM movies_cast_in)
   ),
   actors_network2 AS (
         SELECT DISTINCT cd.cast_name
         FROM cast_db cd 
            JOIN movies_cast_in1 mc on cd.movie_id = mc.movie_id
         WHERE cd.cast_name <> '${actor}' 
         AND cd.cast_name NOT IN(
            SELECT cast_name
            FROM actors_network1
         )
   ),
   movies_cast_in2 AS (
         SELECT md.movie_id,title
         FROM actors_network2 an
            JOIN cast_db cd ON an.cast_name = cd.cast_name
            JOIN meta_db md ON cd.movie_id = md.movie_id
         WHERE md.movie_id NOT IN (
            SELECT movie_id
            FROM movies_cast_in)
         AND md.movie_id NOT IN (
               SELECT movie_id
               FROM movies_cast_in1)
   ),
   actors_network3 AS (
         SELECT DISTINCT cd.cast_name
         FROM cast_db cd 
            JOIN movies_cast_in2 mc on cd.movie_id = mc.movie_id
         WHERE cd.cast_name <> '${actor}' 
         AND cd.cast_name NOT IN(
            SELECT cast_name
            FROM actors_network1
         )
         AND cd.cast_name NOT IN (
            SELECT cast_name
            FROM actors_network2
         )
   )
   SELECT DISTINCT cast_name, 0 AS Connection
   FROM movies_cast_in
   UNION
   SELECT DISTINCT cast_name, 1 AS Connection
   FROM actors_network1
   UNION
   SELECT DISTINCT cast_name, 2 AS Connection
   FROM actors_network2
   UNION
   SELECT DISTINCT cast_name, 3 AS Connection
   FROM actors_network3
   LIMIT ${max}; 
   `;
   console.log("sfha");
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

// film searching and showing part
// Target: search can be filtered by name, genres, actors, director, country, rel yr, rating
// return: imdb id
// Can use imdb id to get full list to show: name, director, actor, genres, homepage link (prob handled by frontend), country, org lang, rel date, runtime, imdb id, rating - to show on the display page

// Need more polish so I hide it now
async function search_movies(req, res) {
   var searchQuery = `select meta_db.title as name, meta_db.director as director, cast_db.cast_name as actors, genres_db.genre as genre, meta_db.country as country, meta_db.lang as org_language, meta_db.release_date as rel_date, meta_db.runtime as runtime, meta_db.country as country, meta_db.imdb_id as imdbid
   from meta_db
   join cast_db on meta_db.movie_id = cast_db.movie_id
   join genres_db on meta_db.movie_id = genres_db.movie_id
   where`;
   var nameCond = req.query.moviename
      ? " meta_db.title like '" + req.query.moviename + "'"
      : " meta_db.title like 'Heat'"; // for testing
   var genreCond = req.query.genre
      ? " AND genres_db.genre like '" + req.query.genre + "'"
      : "";
   var actorCond = req.query.actor
      ? " AND cast_db.cast_name like '" + req.query.actor + "'"
      : "";
   var countryCond = req.query.country
      ? " AND meta_db.country like '" + req.query.country + "'"
      : "";
   var yearCond = req.query.year
      ? " AND YEAR(meta_db.release_date) = " + req.query.year + "'"
      : "";
   var endquery = " ORDER BY meta_db.title; ";
   var query =
      searchQuery +
      nameCond +
      genreCond +
      actorCond +
      countryCond +
      yearCond +
      endquery;
   connection.query(query, function (error, results, fields) {
      if (error) {
         console.log(error);
         res.json({ error: error });
      } else if (results) {
         res.json({ results });
      }
   });
}

// this currently only returns the imdb id of the movie. Will polish later
async function rating_filter(req, res) {
   var searchQuery = `select meta_db.title as name, meta_db.director as director, cast_db.cast_name as actors, genres_db.genre as genre, meta_db.country as country, meta_db.lang as org_language, meta_db.release_date as rel_date, meta_db.runtime as runtime, meta_db.country as country, meta_db.imdb_id as imdbid
   from meta_db
   join cast_db on meta_db.movie_id = cast_db.movie_id
   join genres_db on meta_db.movie_id = genres_db.movie_id
   join ratings_db on meta_db.movie_id = ratings_db.movie_id
   where`;
   var ratinglowCond = req.query.ratinglow
      ? " AND ratings_db.rating >= " + req.query.ratinglow
      : "";
   var ratinghighCond = req.query.ratinghigh
      ? " AND ratings_db.rating <= " + req.query.ratinghigh
      : "";
   var endquery = " ORDER BY meta_db.title; ";
   var query = searchQuery + ratinglowCond + ratinghighCond + endquery;
   connection.query(query, function (error, results, fields) {
      if (error) {
         console.log(error);
         res.json({ error: error });
      } else if (results) {
         res.json({ results: results });
      }
   });
}

// Getting the corresponding movie cast by IMDB ID
async function get_casts_by_ID(req, res) {
   var ID = req.query.imdbid; //? req.query.imdbid : "tt0094675";
   var sql = `SELECT cast_name FROM cast_db
   JOIN meta_db on cast_db.movie_id = meta_db.movie_id
   WHERE meta_db.imdb_id = "${ID}";`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error);
         res.json({ error: error });
      } else if (results) {
         res.json({ results: results });
      }
   });
}

// Getting the corresponding genre by IMDB ID
async function get_genres_by_ID(req, res) {
   var ID = req.query.imdbid; //? req.query.genre : "tt0094675";
   var sql = `SELECT genre FROM genres_db
   JOIN meta_db on genres_db.movie_id = meta_db.movie_id
   WHERE meta_db.imdb_id = "${ID}";`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error);
         res.json({ error: error });
      } else if (results) {
         res.json({ results: results });
      }
   });
}

// Get the average ratings by ID
async function get_avg_ratings_by_ID(req, res) {
   var ID = req.query.imdbid; //? req.query.genre : "tt0094675";
   var sql = `SELECT AVG(rating) FROM ratings_db
   JOIN meta_db on ratings_db.movie_id = meta_db.movie_id
   WHERE meta_db.imdb_id = "${ID}";`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error);
         res.json({ error: error });
      } else if (results) {
         res.json({ results: results });
      }
   });
}

// get other movie info to show except casts, genres, avg_ratings
async function get_movie_info_by_ID(req, res) {
   var ID = req.query.imdbid; //? req.query.genre : "tt0113101";
   var sql = `SELECT meta_db.title as name, meta_db.director as director, meta_db.country as country, meta_db.lang as org_language, meta_db.release_date as rel_date, meta_db.runtime as runtime, meta_db.country as country, meta_db.imdb_id as imdbid FROM meta_db
   WHERE meta_db.imdb_id = "${ID}";`;
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
   sign_up,
   sign_in,
   favorites,
   like,
   unlike,
   likes,
   users,
   resilient,
   versatile,
   top_rating,
   top_review,
   random_genre,
   co_actors,
   connections,
   actors,
   search_movies,
   get_casts_by_ID,
   get_genres_by_ID,
   get_avg_ratings_by_ID,
   get_movie_info_by_ID,
};
