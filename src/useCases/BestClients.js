/**
 * @Returns returns the clients the paid the most for jobs
 * in the query time period. limit query parameter should be applied,
 * default limit is 2.
 */
const { Op, fn, col } = require("sequelize");
const { sortWith, descend, prop, groupBy } = require("ramda");

const { Profile } = require("../model");

const {
  getPaidJobsWithContract,
  datesValidation,
} = require("./BestProfession");

const BestClients = async (req, res) => {
  try {
    const { start, end, limit } = req.query;

    datesValidation(start, end);
    limitValidation(limit);

    const limitNumber = limit ? parseInt(limit) : 2;

    const paidJobs = await getPaidJobsWithContract(start, end);

    const mostPaidJobsMapped = paidJobs.reduce(
      mostPaidJobsToClientsHashMap,
      {}
    );

    const mostPaidJobs = hashmapToObjects(mostPaidJobsMapped);
    const sortedMostPaidJobs = paidSort(mostPaidJobs);

    const clientsIds = sortedMostPaidJobs
      .map((client) => client.id)
      .slice(0, limitNumber);

    const clients = await getClientsByIds(clientsIds, limitNumber);

    const finalClients = clients.map(mergeClientsPayments(sortedMostPaidJobs));

    res.json([...paidSort(finalClients)]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const limitValidation = (limit) => {
  if (limit && isNaN(limit)) throw new Error("limit should be a number");
};

const mostPaidJobsToClientsHashMap = (acc, job) => {
  const {
    Contract: { ClientId },
  } = job;

  !acc[ClientId] ? (acc[ClientId] = job.price) : (acc[ClientId] += job.price);

  return acc;
};

const hashmapToObjects = (mostPaidJobsMapped) =>
  Object.entries(mostPaidJobsMapped).map(([id, paid]) => ({
    id: parseInt(id),
    paid,
  }));

const paidSort = sortWith([descend(prop("paid"))]);

const getClientsByIds = (ids, limit) => {
  return Profile.findAll({
    where: { id: { [Op.in]: ids } },
    attributes: [
      "id",
      [fn("concat", col("firstName"), " ", col("lastName")), "fullName"],
    ],
    limit,
  });
};

const mergeClientsPayments = (objectToSort) => (todo) => {
  const paidDetails = paidDetailsById(objectToSort)[todo.id][0];

  return {
    id: todo.id,
    fullName: todo.dataValues.fullName,
    paid: paidDetails.paid,
  };
};

const paidDetailsById = (objectToSort) => groupBy(prop("id"), objectToSort);

module.exports = { BestClients };
