const { app } = require("electron");

function handleSingleInstance(mainWindow) {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", () => {
      if (mainWindow) {
        if (!mainWindow.isVisible()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
      app.relaunch();
      app.quit();
    });
  }
}

module.exports = { handleSingleInstance };
