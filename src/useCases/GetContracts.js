/**
 * @returns array of contract
 * Filter by profile id
 * Returns a list of contracts belonging to a user (client or contractor)
 */

const { Op } = require("sequelize");

const NOT_TERMINATED_CONTRACTS = {
  status: {
    [Op.not]: "terminated",
  },
};

const GetContracts = async (req, res) => {
  console.log("GetContracts");

  const { Contract } = req.app.get("models");
  const { profile } = req;

  const contracts = await Contract.findAll({
    where: { ClientId: profile.id, ...NOT_TERMINATED_CONTRACTS },
  });

  if (contracts.length === 0) return res.status(404).end();

  res.json(contracts);
};

module.exports = { GetContracts };
