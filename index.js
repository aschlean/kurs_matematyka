// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
require("dotenv").config();
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};
if (app.get("env") === "production") {
// Serve secure cookies, requires HTTPS
    session.cookie.secure = true;
}
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req,res) => {
    res.render("index", { title: "Home" });
});


/**
 * Server Activation
 */
app.listen(port, () => {
});

