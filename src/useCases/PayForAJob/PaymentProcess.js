const { Profile, Job } = require("../../model");

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

module.exports = { paymentProcess };
