const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
};

const adminOnly = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Admin! You have admin access.",
    user: req.user,
  });
};

const employeeOrAdmin = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome! Admin or Employee access granted.",
    user: req.user,
  });
};

module.exports = {
  getProfile,
  adminOnly,
  employeeOrAdmin,
};