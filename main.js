const { app, BrowserWindow, Tray, ipcMain } = require("electron");
const path = require("path");
const {
  resetSettings,
  loadSettings,
  saveCenterSettings,
  saveResizeSettings,
  closeWatcher,
} = require("./settings");
const { autohotkeyProcess } = require("./autohotkey");
const { createWindow, createTrayMenu } = require("./window");

app.whenReady().then(() => {
  createWindow();
  const tray = new Tray(path.join(__dirname, "resources", "icons", "icon.png"));
  createTrayMenu(tray);

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("will-quit", () => {
    closeWatcher();
    if (autohotkeyProcess) {
      autohotkeyProcess.kill();
    }
  });
});

ipcMain.on("reset-settings", resetSettings);
ipcMain.on("load-settings", loadSettings);
ipcMain.on("save-center-settings", saveCenterSettings);
ipcMain.on("save-resize-settings", saveResizeSettings);
