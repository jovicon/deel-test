const isAdmin = async (req, res, next) => {
  try {
    const adminFlag = req.get("admin");
    if (adminFlag !== "true") throw new Error("Admin only");
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { isAdmin };
