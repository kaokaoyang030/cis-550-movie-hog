const express = require("express");
var cors = require("cors");
const routes = require("./routes");
const app = express();

// whitelist localhost 3000
app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));

// Route 1
app.get("/hello", routes.hello);

// Route 1
app.get("/", routes.all_matches);

app.listen(3000, () => console.log("Listening on port 3000..."));
