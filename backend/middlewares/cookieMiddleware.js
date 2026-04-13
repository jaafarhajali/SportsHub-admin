const cookieMiddleware = (req, res, next) => {
  try {
    // Check if token exists in cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided in cookies.",
      });
    }

    // If token exists, attach it to the request object
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error processing cookie token",
      error: error.message,
    });
  }
};

module.exports = cookieMiddleware;
