const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");

const { getProfile } = require("./middleware/getProfile");

const { GetContractByID } = require("./useCases/GetContractbyProfileID");

const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

app.get("/contracts/:id", getProfile, GetContractByID);

module.exports = app;
