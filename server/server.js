const express = require("express");
var cors = require("cors");
const routes = require("./routes");
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());
var session = require("express-session");
app.use(session({ secret: "shh" }));

// whitelist localhost 3000
app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));

// Route 1
app.get("/hello", routes.hello);

// Register a new user
app.post("/sign_up", routes.sign_up);

app.post("/sign_in", routes.sign_in);

app.post("/like", routes.like);

app.post("/unlike", routes.unlike);

app.get("/favorites", routes.favorites);

app.listen(3000, () => console.log("Listening on port 3000..."));
