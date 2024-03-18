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

const { Job, Contract } = require("../model");

const { Op } = require("sequelize");

const unpaidJobsByContract = (Ids) => {
  return {
    ContractId: {
      [Op.in]: [...Ids],
    },
    paid: null,
  };
};

const jobsByClientId = async (ClientId) => {
  const contracts = await Contract.findAll({
    where: { ClientId },
  });

  const contractIds = contracts.map((contract) => contract.id);

  const jobs = await Job.findAll({
    where: { ...unpaidJobsByContract(contractIds) },
  });

  if (jobs.length === 0) throw new Error("No unpaid jobs");

  return jobs;
};

const GetUnpaidJobs = async (req, res) => {
  try {
    const { profile } = req;
    const jobs = await jobsByClientId(profile.id);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { GetUnpaidJobs, unpaidJobsByContract, jobsByClientId };
