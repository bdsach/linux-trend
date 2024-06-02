const express = require("express");
const app = express();
const dataLast1months = require("../data/last1months.json");

app.use(express.static("public"));

app.get("/api/last1months", (req, res) => {
  res.json(dataLast1months);
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
