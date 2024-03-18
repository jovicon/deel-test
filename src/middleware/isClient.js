class Guard {
  constructor(profile) {
    this.profile = profile;
  }

  execute() {
    this.isClient();
  }

  isClient = () => {
    if (this.profile.type !== "client")
      throw new Error("Payment is just for clients");
  };
}

const isClient = async (req, res, next) => {
  try {
    const { Profile } = req.app.get("models");

    const profile = await Profile.findOne({
      where: { id: req.get("profile_id") || 0 },
    });

    if (!profile) return res.status(401).end();
    const guard = new Guard(profile);
    guard.execute();

    req.profile = profile;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { isClient };
