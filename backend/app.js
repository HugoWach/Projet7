
const express = require('express');
const path = require('path');
const authRoutes = require('./routes/Auth.routes');
const booksRoutes = require('./routes/Book.routes');
const cors = require("cors");

/* Initialisation de l'API */
const app = express();

app.use(express.urlencoded({ extended: true }))

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, x-access-token, role, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

app.use(cors({
    credentials: true,
}));

/* Securite en tete */
const helmet = require("helmet");

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

/* RateLimit */
const rateLimit = require("express-rate-limit");

app.use(
    rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100,
        message:
            "Vous avez effectué plus de 100 requêtes dans une limite de 10 minutes!",
        headers: true,
    })
);

/* Mise en place du routage */
app.use(express.static('images'));
app.use("/images", express.static(path.join("images")));

app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);

module.exports = app;