const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");

const { getProfile } = require("./middleware/getProfile");

const { GetContracts } = require("./useCases/GetContracts");
const { GetContractByID } = require("./useCases/GetContractbyProfileID");

const { GetUnpaidJobs } = require("./useCases/GetUnpaidJobs");

const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

app.get("/contracts", getProfile, GetContracts);
app.get("/contracts/:id", getProfile, GetContractByID);

app.get("/jobs/unpaid", getProfile, GetUnpaidJobs);

module.exports = app;
