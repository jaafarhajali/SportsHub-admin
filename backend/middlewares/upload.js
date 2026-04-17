const { createImageUploader } = require("./uploadFactory");

module.exports = createImageUploader({ subDir: "user", filePrefix: "user" });
