const express = require("express");
const app = express();
const data = require("../data/last1months.json");

app.get("/", (req, res) => res.send("Express on Vercel"));


app.get("/last1months", (req, res) => {
    res.json(data);
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;