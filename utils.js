const { nativeTheme } = require("electron");
const path = require("path");

function getIconPath(iconName) {
  const theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
  return path.join(__dirname, "resources", "icons", theme, `${iconName}.png`);
}

module.exports = {
  getIconPath,
};
