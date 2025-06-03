const crypto = require("crypto");

exports.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  return { resetToken, hashedToken };
};
