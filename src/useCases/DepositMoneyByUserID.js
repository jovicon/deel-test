/**
 * @post Deposits money into the balance of a client,
 * a client can't deposit more than 25% his total of jobs to pay.
 * (at the deposit moment)
 */

const { jobsByClientId } = require("./GetUnpaidJobs");

const DepositMoneyByUserID = async (req, res) => {
  const { money } = req.body;
  const { profile } = req;

  const jobs = await jobsByClientId(profile.id);

  if (jobs.length === 0)
    return res.status(404).json({ message: "No unpaid jobs" });

  const total = jobs.reduce((acc, job) => acc + job.price, 0);
  const twentyFivePercent = total * 0.25;

  if (money > twentyFivePercent)
    return res.status(400).json({ message: "Can't deposit more than 25%" });

  const t = await profile.sequelize.transaction();

  try {
    profile.balance += money;
    await profile.save({ transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }

  res.json({ message: "Deposit made", profile });
};

module.exports = { DepositMoneyByUserID };
