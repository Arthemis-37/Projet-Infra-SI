require('dotenv').config();

const mongoose = require("mongoose");
const app = require("./app");

userDB = process.env.DB_USER;
passwordDB = process.env.DB_PASSWORD;
clusterDB = process.env.CLUSTER
port = process.env.PORT;

mongoose.connect(`mongodb+srv://${userDB}:${passwordDB}@${clusterDB}/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log("Connexion à la base de données réussie !"))
    .catch(() => console.log("Connexion à la base de données échouée"));

app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}/`)
});