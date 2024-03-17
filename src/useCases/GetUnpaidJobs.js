/**
 * @returns array of Jobs
 * Get all unpaid jobs for a user (**_either_** a client or contractor)
 * for **_active contracts only_**.
 *
 * Doubts:
 * - What is the meaning of "active contracts only"?
 *
 * Domain suppositions:
 * - active contracts are those that exist.
 * because, contract with id 1 is terminated
 * but there are unpaid jobs for it.
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
