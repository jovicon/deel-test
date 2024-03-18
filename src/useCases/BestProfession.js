/**
 * @Returns Returns the profession that earned the most money (sum of jobs paid)
 * for any contactor that worked in the query time range.
 */
const { Op } = require("sequelize");
const { Job, Profile, Contract } = require("../model");

const BestProfession = async (req, res) => {
  try {
    const { start, end } = req.query;

    datesValidation(start, end);

    const paidJobs = await getPaidJobsWithContract(start, end);

    const mustPaidContractId = getMustPaidContractId(paidJobs);

    const profession = await Profile.findOne({
      where: { id: mustPaidContractId },
    });

    res.json({
      bestProfession: profession.profession,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const datesValidation = (start, end) => {
  if (!start || !end) throw new Error("start and end are required");

  if (isNaN(Date.parse(start)) || isNaN(Date.parse(end)))
    throw new Error("start and end should be valid dates");

  if (Date.parse(start) > Date.parse(end))
    throw new Error("start should be before end");
};

const getPaidJobsWithContract = async (start, end) => {
  return Job.findAll({
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
    include: [
      {
        model: Contract,
      },
    ],
  });
};

// ! if this solution have performance issues, we can use transduction concepts
const getMustPaidContractId = (paidJobs) => {
  const mustPaidJobsMapped = paidJobs.reduce(mustPaidJobsToContractHashMap, {});
  const getMaxValueFromHashMap = hashmapReducer(mustPaidJobsMapped);

  return Object.keys(mustPaidJobsMapped).reduce(getMaxValueFromHashMap);
};

const mustPaidJobsToContractHashMap = (acc, job) => {
  const {
    Contract: { ContractorId },
  } = job;

  !acc[ContractorId]
    ? (acc[ContractorId] = job.price)
    : (acc[ContractorId] += job.price);

  return acc;
};

const hashmapReducer = (hashmap) => (a, b) => hashmap[a] > hashmap[b] ? a : b;

module.exports = { BestProfession };
