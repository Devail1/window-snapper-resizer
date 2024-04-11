const { app, Tray, BrowserWindow, ipcMain } = require("electron");
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
const { handleSingleInstance } = require("./singleInstance");
const { getIconPath } = require("./utils");

let mainWindow = null;

app.whenReady().then(() => {
  createWindow();
  const tray = new Tray(getIconPath("logo"));
  createTrayMenu(tray);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("will-quit", () => {
    closeWatcher();
    if (autohotkeyProcess) {
      autohotkeyProcess.kill();
    }
  });
});

handleSingleInstance(mainWindow);

ipcMain.on("reset-settings", resetSettings);
ipcMain.on("load-settings", loadSettings);
ipcMain.on("save-center-settings", saveCenterSettings);
ipcMain.on("save-resize-settings", saveResizeSettings);
