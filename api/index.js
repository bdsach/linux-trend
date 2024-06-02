const express = require("express");
const app = express();
const dataLast1months = require("../data/last1months.json");
const dataLast3months = require("../data/last3months.json");
const dataLast6months = require("../data/last6months.json");
const dataLast12months = require("../data/last12months.json");

app.use(express.static("public"));

app.get("/api/last1months", (req, res) => {
  res.json(dataLast1months);
});

app.get("/api/last3months", (req, res) => {
  res.json(dataLast3months);
})

// last6months
app.get("/api/last6months", (req, res) => {
  res.json(dataLast6months);
});

// last12months
app.get("/api/last12months", (req, res) => {
  res.json(dataLast12months);
})


app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
