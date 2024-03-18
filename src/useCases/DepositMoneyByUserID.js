/**
 * @post Deposits money into the balance of a client,
 * a client can't deposit more than 25% his total of jobs to pay.
 * (at the deposit moment)
 */

const { jobsByClientId } = require("./GetUnpaidJobs");

const integerValidation = (money) => {
  if (!Number.isInteger(money)) throw new Error("Money should be an integer");
};

const DepositMoneyByUserID = async (req, res) => {
  const { money } = req.body;
  const { profile } = req;

  try {
    integerValidation(money);

    const jobs = await jobsByClientId(profile.id);

    const total = jobs.reduce((acc, job) => acc + job.price, 0);
    const twentyFivePercent = total * 0.25;

    if (money > twentyFivePercent)
      return res.status(400).json({ message: "Can't deposit more than 25%" });

    const result = await req.app.get("sequelize").transaction(async (t) => {
      profile.balance += money;
      await profile.save({ transaction: t });

      return profile;
    });

    res.json({ message: "Deposit made", profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { DepositMoneyByUserID };
