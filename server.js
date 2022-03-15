const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const userRoutes = require("./src/routes/user_routes");

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "./src")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./src/views/user_registration.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./src/views/user_login.html"));
});

app.use("/api/v1/user", userRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
