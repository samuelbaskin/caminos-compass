let app;
let initError;

try {
  app = require("../server/index");
} catch (err) {
  initError = err;
  console.error("Failed to initialize server:", err);
}

module.exports = (req, res) => {
  if (initError) {
    res.status(500).json({
      error: "Server failed to initialize",
      message: initError.message,
      stack: initError.stack,
    });
    return;
  }
  return app(req, res);
};
