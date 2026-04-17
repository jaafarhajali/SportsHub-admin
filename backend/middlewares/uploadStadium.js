const { createImageUploader } = require("./uploadFactory");

module.exports = createImageUploader({ subDir: "stadiumsImages", filePrefix: "stadium" });
