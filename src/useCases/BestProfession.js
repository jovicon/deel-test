/**
 * @Returns Returns the profession that earned the most money (sum of jobs paid)
 * for any contactor that worked in the query time range.
 */
const { Op } = require("sequelize");

const mustPaidJobsHashMap = (acc, job) => {
  const {
    Contract: { ContractorId },
  } = job;

  !acc[ContractorId]
    ? (acc[ContractorId] = job.price)
    : (acc[ContractorId] += job.price);

  return acc;
};

const hashmapReducer = (hashmap) => (a, b) => hashmap[a] > hashmap[b] ? a : b;

const datesValidation = (start, end) => {
  if (!start || !end) throw new Error("start and end are required");

  if (isNaN(Date.parse(start)) || isNaN(Date.parse(end)))
    throw new Error("start and end should be valid dates");

  if (Date.parse(start) > Date.parse(end))
    throw new Error("start should be before end");
};

const BestProfession = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { Job, Profile } = req.app.get("models");

    datesValidation(start, end);

    const paidJobs = await Job.findAll({
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [start, end],
        },
      },
      include: [
        {
          model: req.app.get("models").Contract,
        },
      ],
    });

    const mustPaidJobsMapped = paidJobs.reduce(mustPaidJobsHashMap, {});

    const getMaxValueFromHashMap = hashmapReducer(mustPaidJobsMapped);

    const mustPaidContractId = Object.keys(mustPaidJobsMapped).reduce(
      getMaxValueFromHashMap
    );

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

module.exports = { BestProfession };
