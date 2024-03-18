const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");

const { getProfile } = require("./middleware/getProfile");
const { isClient } = require("./middleware/isClient");

const { GetContracts } = require("./useCases/GetContracts");
const { GetContractByID } = require("./useCases/GetContractbyProfileID");

const { GetUnpaidJobs } = require("./useCases/GetUnpaidJobs");
const { PayForAJob } = require("./useCases/PayForAJob");

const { DepositMoneyByUserID } = require("./useCases/DepositMoneyByUserID");

const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

app.get("/contracts", getProfile, GetContracts);
app.get("/contracts/:id", getProfile, GetContractByID);

app.get("/jobs/unpaid", getProfile, GetUnpaidJobs);
app.post("/jobs/:job_id/pay", isClient, PayForAJob);

app.post("/balances/deposit/:userId", isClient, DepositMoneyByUserID);

module.exports = app;
