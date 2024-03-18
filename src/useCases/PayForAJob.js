/**
 * @post Pay for a job
 * A client can only pay if his balance >= the amount to pay.
 * The amount should be moved from the client's balance to the contractor balance.
 */

const { Profile, Job } = require("../model");

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

const paymentProcess = (profile, contractor, jobToPay) => async (t) => {
  console.log("paymentProcess -> t - INIT", t.id);

  await Profile.update(
    { balance: profile.balance - jobToPay.price },
    { where: { id: profile.id }, transaction: t }
  );

  await Profile.update(
    { balance: contractor.balance + jobToPay.price },
    { where: { id: contractor.id }, transaction: t }
  );

  await Job.update(
    { paid: true, paymentDate: new Date() },
    { where: { id: jobToPay.id }, transaction: t }
  );

  console.log("paymentProcess -> t - FINISH", t.id);
  return t.id;
};

const PayForAJob = async (req, res) => {
  try {
    const { Job, Contract } = req.app.get("models");
    const { job_id: jobId } = req.params;
    const { profile } = req;

    const jobToPay = await Job.findOne({
      where: { id: jobId },
    });

    jobValidations(jobToPay, profile);

    const contract = await Contract.findOne({
      where: { id: jobToPay.ContractId },
    });

    contractorValidations(contract, profile);

    const contractor = await Profile.findOne({
      where: { id: contract.ContractorId },
    });

    // ! this transaction could be handle by a event listener
    const transactionId = await req.app
      .get("sequelize")
      .transaction(paymentProcess(profile, contractor, jobToPay));

    res.json({ message: "job payed successfully", transactionId });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { PayForAJob };
