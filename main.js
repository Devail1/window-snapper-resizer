const { app, BrowserWindow, Tray, ipcMain } = require("electron");
const path = require("path");
const settings = require("./settings"); // Import settings module
const autohotkey = require("./autohotkey"); // Import autohotkey module
const window = require("./window"); // Import window module

app.whenReady().then(() => {
  window.createWindow();
  const tray = new Tray(path.join(__dirname, "resources", "icons", "icon.png"));
  window.createTrayMenu(tray); // Pass tray to window module

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) window.createWindow();
  });

  app.on("will-quit", () => {
    settings.closeWatcher();
    if (autohotkey.autohotkeyProcess) {
      autohotkey.autohotkeyProcess.kill();
    }
  });
});

ipcMain.on("reset-settings", settings.resetSettings);
ipcMain.on("load-settings", settings.loadSettings);
ipcMain.on("save-center-settings", settings.saveCenterSettings);
ipcMain.on("save-resize-settings", settings.saveResizeSettings);
