// main.js
const { app, BrowserWindow, Tray, ipcMain, Notification } = require("electron");
const path = require("path");
const settings = require("./settings");
const autohotkey = require("./autohotkey");
const { createWindow, createTrayMenu } = require("./window");

app.whenReady().then(() => {
  const mainWindow = createWindow();
  const tray = new Tray(path.join(__dirname, "resources", "icons", "icon.png"));
  createTrayMenu(tray, mainWindow);

  // Optionally show a notification on startup (replace with your notification logic)
  const notification = new Notification({
    title: "Window Snapper",
    body: "App is running in the tray.",
  });
  notification.show();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
