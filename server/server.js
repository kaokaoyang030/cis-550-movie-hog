const express = require("express");
var cors = require("cors");
const routes = require("./routes");
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());
var session = require("express-session");
app.use(session({ secret: "shh" }));
const config = require("./config.json");

//API Connection
const API_KEY = "api_key=fc9f519488c11a17e9c91f5d397bbd38";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const searchURL = BASE_URL + "/search/movie?" + API_KEY;
//const MoviesDetails = `${BASE_URL}/find/${IMDB_ID}?external_source=imdb_id&${API_KEY}`;

// whitelist localhost 3000
app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));

// Route 1
app.get("/hello", routes.hello);

// Register a new user
app.post("/sign_up", routes.sign_up);

app.post("/sign_in", routes.sign_in);

app.get("/favorites", routes.favorites);

app.post("/like", routes.like);

app.post("/unlike", routes.unlike);

app.get("/favorites", routes.favorites);

app.get("/likes", routes.likes);

app.get("/users", routes.users);

app.get("/resilient", routes.resilient);

app.get("/versatile", routes.versatile);

app.get("/top_rating", routes.top_rating);

app.get("/top_review", routes.top_review);

app.get("/random_genre", routes.random_genre);

app.get("/actors", routes.actors);

app.get("/co_actors", routes.co_actors);

app.get("/connections", routes.connections);

app.get("/search", routes.search);

app.get("/search_movies", routes.search_movies);

app.get("/rating_filter", routes.rating_filter);

app.get("/get_imdb", routes.get_imdb);

app.get("/get_tags", routes.get_tags);

app.get("/get_cast", routes.get_cast);

app.get("/get_genres", routes.get_genres);

app.get("/get_avg_rating", routes.get_avg_rating);

app.get("/get_meta", routes.get_meta);

app.get("/get_movie_info_by_MovieID", routes.get_movie_info_by_MovieID);

app.listen(config.server_port, () => {
   console.log(
      `Server running at http://${config.server_host}:${config.server_port}/`
   );
});
