const jobValidations = (jobToPay, profile) => {
  if (!jobToPay) throw new Error("job doesn't exist");
  if (jobToPay.paid) throw new Error("job already payed");
  if (jobToPay.price > profile.balance)
    throw new Error("client balance is less than price to pay");
};

const contractorValidations = (contractor, profile) => {
  if (contractor.ClientId !== profile.id)
    throw new Error("client is not related to this Job");
};

module.exports = { jobValidations, contractorValidations };
