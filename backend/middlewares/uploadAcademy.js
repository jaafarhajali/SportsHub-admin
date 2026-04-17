const { createImageUploader } = require("./uploadFactory");

module.exports = createImageUploader({ subDir: "academiesImages", filePrefix: "academy" });
