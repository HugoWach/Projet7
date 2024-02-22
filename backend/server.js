/* Import des modules necessaires */
const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ encoding: "latin1" });

/* Connection BDD mongoose */
mongoose
    .connect(process.env.DBCONNECT)

    .then(() =>
        app.listen(process.env.SERVER_PORT, () => {
            console.log(`🚀 Express running → On PORT : ${process.env.SERVER_PORT}.⭐️ `);
        })
    )
    .catch(err => {
        console.log(`1. 🔥 Erreur: server.js`);
        console.error(`🚫 Error → : ${err}`);
    });
