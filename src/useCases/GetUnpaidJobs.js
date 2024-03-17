/**
 * @returns array of contract
 * Filter by profile id
 * Returns a list of contracts belonging to a user (client or contractor)
 */

const { Op } = require("sequelize");

const unpaidJobsByContract = (Ids) => {
  return {
    ContractId: {
      [Op.in]: [...Ids],
    },
    paid: null,
  };
};

const GetUnpaidJobs = async (req, res) => {
  const { Contract, Job } = req.app.get("models");
  const { profile } = req;

  const contracts = await Contract.findAll({
    where: { ClientId: profile.id },
  });

  const contractIds = contracts.map((contract) => contract.id);

  const jobs = await Job.findAll({
    where: { ...unpaidJobsByContract(contractIds) },
  });

  if (jobs.length === 0) return res.status(404).end();

  res.json(jobs);
};

module.exports = { GetUnpaidJobs };
