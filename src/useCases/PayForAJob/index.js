/**
 * @post Pay for a job
 * A client can only pay if his balance >= the amount to pay.
 * The amount should be moved from the client's balance to the contractor balance.
 */
const { contractorValidations, jobValidations } = require("./validators");
const { paymentProcess } = require("./PaymentProcess");

const PayForAJob = async (req, res) => {
  try {
    const { Job, Contract, Profile } = req.app.get("models");
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
    const payment = paymentProcess(profile, contractor, jobToPay);
    const transactionId = await req.app.get("sequelize").transaction(payment);

    res.json({ message: "job payed successfully", transactionId });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { PayForAJob };
