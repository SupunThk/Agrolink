const mongoose = require("mongoose");

module.exports = function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      errors: {
        general:
          "Database unavailable. Check api/.env MONGO_URL and MongoDB network access (Atlas IP whitelist).",
      },
    });
  }

  return next();
};
