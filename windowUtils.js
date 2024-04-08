const { BrowserWindow, screen } = require("electron");

let currentSizeIndex = 1; // Initialize before first call
function resizeWindow(windowSizePercentages) {
  currentSizeIndex = (currentSizeIndex + 1) % windowSizePercentages.length;
  const sizePercentage = windowSizePercentages[currentSizeIndex];
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    const currentScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const { width, height } = currentScreen.workAreaSize;
    const newWidth = Math.floor(width * sizePercentage.width);
    const newHeight = Math.floor(height * sizePercentage.height);
    focusedWindow.setSize(newWidth, newHeight);
  }
  return currentSizeIndex;
}

function centerWindow() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    const currentScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const { width, height } = focusedWindow.getBounds();
    const { width: screenWidth, height: screenHeight } = currentScreen.workAreaSize;
    const x = Math.max(0, Math.floor((screenWidth - width) / 2));
    const y = Math.max(0, Math.floor((screenHeight - height) / 2));
    focusedWindow.setPosition(x, y);
  }
}

module.exports = {
  resizeWindowAction: resizeWindow,
  centerWindowAction: centerWindow,
};
