const mysql = require("mysql");
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
Return: {username} if successful, otherwise null
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
      value ('${username}', '${password}', 'NULL')
      ;`;
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
Return: {username} if successful, otherwise {null}
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
      ;`;
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
            res.json({ cred: creds });
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
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
   const username = req.query.username;
   let where_clause = "";
   if (username) {
      where_clause = `where username = '${username}'`;
   }
   let sql = `
      Select *
      from Favorites
      ${where_clause}
      ${limit_clause}
      ${offset_clause}
      ;`;
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

/* 
Purpose: displays number of likes by all users for a movie_id 
Type: GET
Arguments: (optional) query.movie_id
Return: list of {movie_id, # of likes} 
*/
async function likes(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
   const movie_id = req.query.movie_id;
   let where_clause = movie_id ? `where movie_id = '${movie_id}'` : "";
   let sql = `
     select movie_id, count(*) as likes
     from Favorites
     ${where_clause}
     group by movie_id
     ${limit_clause}
     ${offset_clause}
     ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays all usernames
Type: GET
Arguments: none
Return: list of {username} 
*/
async function users(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
   let sql = `
     select username
     from Users
     ${limit_clause}
     ${offset_clause}
     ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays actor names that both experienced a terrible flop and an immense success in revenues threshold for a movie they played in
Type: GET
Arguments: (optional) query.revenues 
Return: list of {actor}
*/
async function resilient(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
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
      where cast_name in (select cast_name from win_actors)
      ${limit_clause}
      ${offset_clause}
      ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays name of actors which have played the most number of different genres 
Type: GET
Arguments: none
Return: list of {actor} 
*/
async function versatile(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
   let sql = `
      select cast_name, count(distinct genre) as genres
      from genres_db 
            join cast_db cd 
            on genres_db.movie_id = cd.movie_id
      where cd.movie_id in (
         select movie_id from meta_db 
         )
      group by cast_name
      order by count DESC
      ${limit_clause}
      ${offset_clause}
      ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays movies with highest ratings
Type: GET
Arguments: (optional) query.max: number of movies returned
Return: list of {movie_id, other attr.}  
*/
async function top_rating(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
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
      ${limit_clause}
      ${offset_clause}
      ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays movies with highest reviews
Type: GET
Arguments: (optional) query.max number of movies returned
Return: list of {movie_id, other attr.} 
*/
async function top_review(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
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

/* 
Purpose: displays a random movie pertaining to given genre, released in given year range
Type: GET
Arguments: (optional) query.genre, query.start_year, query.end_year, query.max: items returned
Return: list of {movie_id, other attr.} 
*/
async function random_genre(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "LIMIT 1";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
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
      ${limit_clause}
      ${offset_clause}
      ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays actors playing in a given movie
Type: GET
Arguments: query.movie_id or query.movie_title, (optional) query.max: number of returned results 
Return: list of {actor}
*/
async function actors(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
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
      ${limit_clause}
      ${offset_clause}
      ;`;
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

/* 
Purpose: displays co-actors that have played in movie with a given actor 
Type: GET
Arguments: query.actor: name
Return: list of {co-actor} 
*/
async function co_actors(req, res) {
   let actor = req.query.actor ? req.query.actor : "Tom Hanks";
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
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
      )
      ${limit_clause}
      ${offset_clause}
      ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays connected actors linked to a given actor: 
   0 connection if actors have played in same movie with given actor, 
   1 connection if the actors played with other actors that have played in a common movie, 
   2 connection if they played with actors who have played with other actors that have played in a common movie 
Type: GET
Arguments: (optional) query.max: number of movies returned
Return: list of movies 
*/
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
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

/* 
Purpose: displays movies that respect the filters 
Type: GET
Arguments: 
Return: list of {movie_ids} 
*/
async function search(req, res) {
   const page_size = req.query.page_size;
   const offset = req.query.offset;
   let limit_clause = page_size ? `LIMIT ${page_size}` : "";
   let offset_clause = offset ? `OFFSET ${offset}` : "";
   const movie_id = req.query.movie_id;
   const title = req.query.title;
   const country = req.query.country;
   const director = req.query.director;
   const year = req.query.year;
   let where_clause = "WHERE 1=1 "; //dummy
   if (movie_id) where_clause = `${where_clause} AND m.movie_id = ${movie_id} `;
   if (title) where_clause = `${where_clause} AND m.title LIKE '%${title}%' `;
   if (director)
      where_clause = `${where_clause} AND m.Director LIKE '%${director}%' `;
   if (country)
      where_clause = `${where_clause} AND m.Country LIKE '%${country}%' `;
   if (year)
      where_clause = `${where_clause} AND m.release_date LIKE '%${year}%' `;
   const actor = req.query.actor;
   const genre = req.query.genre;
   let with_clause = "";
   if (actor && !genre) {
      with_clause = `WITH 
      movies_with_actor AS (
         select movie_id 
         from cast_db 
         where cast_name like '%${actor}%'
      ) `;
      where_clause =
         where_clause +
         ` AND movie_id IN (select movie_id from movies_with_actor) `;
   }
   if (!actor && genre) {
      with_clause = `WITH 
      movies_with_genre AS (
         select movie_id 
         from genres_db 
         where genre like '%${genre}%'
      ) `;
      where_clause =
         where_clause +
         ` AND movie_id IN (select movie_id from movies_with_genre) `;
   }
   if (actor && genre) {
      with_clause = `WITH 
      movies_with_actor AS (
         select movie_id 
         from cast_db 
         where cast_name like '%${actor}%'), 
      movies_with_genre AS (
         select movie_id 
         from genres_db 
         where genre like '%${genre}%'
      ) `;
      where_clause =
         where_clause +
         ` AND movie_id IN (select movie_id from movies_with_actor) ` +
         ` AND movie_id IN (select movie_id from movies_with_genre) `;
   }
   let sql = `
      ${with_clause}
      select movie_id
      from meta_db m
      ${where_clause}
      ${limit_clause}
      ${offset_clause}
      ;`;
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

async function get_imdb(req, res) {
   const movie_id = req.query.movie_id;
   let sql = `
     select imdb_id
     from meta_db
     where movie_id = '${movie_id}'
     ;`;
   connection.query(sql, function (error, results, fields) {
      if (error) {
         console.log(error.errno);
         res.json({ error: error });
      } else {
         res.json({ results });
      }
   });
}

// Getting the corresponding movie cast
async function get_cast(req, res) {
   var movie_id = req.query.movie_id ? req.query.movie_id : 13;
   var sql = `
      SELECT cast_name 
      FROM cast_db
      JOIN meta_db 
         on cast_db.movie_id = meta_db.movie_id
      WHERE meta_db.imdb_id = "${movie_id}"
      ;`;
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
async function get_genres(req, res) {
   var movie_id = req.query.movie_id ? req.query.movie_id : 13;
   var sql = `
      SELECT genre FROM genres_db
      JOIN meta_db 
         on genres_db.movie_id = meta_db.movie_id
      WHERE meta_db.imdb_id = "${movie_id}"
      ;`;
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
async function get_avg_rating(req, res) {
   var movie_id = req.query.movie_id ? req.query.movie_id : 13;
   var sql = `
      SELECT AVG(rating) 
      FROM ratings_db
      JOIN meta_db 
         on ratings_db.movie_id = meta_db.movie_id
      WHERE meta_db.imdb_id = "${movie_id}"
      ;`;
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
async function get_meta(req, res) {
   var movie_id = req.query.movie_id ? req.query.movie_id : 13;
   var sql = `
      SELECT meta_db.title as name, meta_db.director as director, meta_db.country as country, meta_db.lang as org_language, meta_db.release_date as rel_date, meta_db.runtime as runtime, meta_db.country as country, meta_db.imdb_id as imdbid 
      FROM meta_db
      WHERE meta_db.imdb_id = "${movie_id}"
      ;`;
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
   search,
   search_movies,
   get_imdb,
   get_cast,
   get_genres,
   get_avg_rating,
   get_meta,
};
