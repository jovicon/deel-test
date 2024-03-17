/**
 * @returns contract by id
 * Filter by profile id
 * It should return the contract only if it belongs to the profile calling.
 */

const GetContractByID = async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const { profile } = req;

  const contract = await Contract.findOne({
    where: { id, ClientId: profile.id },
  });

  if (!contract) return res.status(404).end();

  res.json(contract);
};

module.exports = { GetContractByID };
