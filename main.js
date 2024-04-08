const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const { unregisterShortcuts, registerShortcuts } = require("./shortcutManager");
const path = require("path");
const fs = require("fs");
const defaultSettings = require("./defaultSettings.json");
let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 680,
    height: 620,
    icon: "assets/icons/icon.png",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("close", (event) => {
    if (app.hide || mainWindow.isVisible()) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, "assets/icons/icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Window Snapper");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => mainWindow.show());
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function resetSettings(event) {
  unregisterShortcuts();
  const settingsPath = path.join(app.getPath("userData"), "settings.json");
  console.log("settingsPath", settingsPath);
  fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings));

  event.sender.send("load-settings-reply", {
    settings: defaultSettings,
  });
  registerShortcuts(JSON.stringify(defaultSettings));
}

ipcMain.on("reset-settings", (event) => {
  resetSettings(event);
});

ipcMain.on("load-settings", (event) => {
  const settingsPath = path.join(app.getPath("userData"), "settings.json");

  if (!fs.existsSync(settingsPath)) {
    resetSettings(event);
  } else {
    // Read existing settings
    const settings = fs.readFileSync(settingsPath, "utf8");

    if (settings) {
      event.sender.send("load-settings-reply", {
        settings: JSON.parse(settings),
      });
    }
    registerShortcuts(settings);
  }
});

ipcMain.on("save-center-settings", async (event, data) => {
  unregisterShortcuts();
  try {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    const rawSettings = await fs.promises.readFile(settingsPath, "utf8");
    const settings = JSON.parse(rawSettings);

    settings.centerWindow.keybinding = data.centerKeybind;

    await fs.promises.writeFile(settingsPath, JSON.stringify(settings)); // Indent for readability

    registerShortcuts(JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving settings:", err.message, err.stack);
    // Optionally notify user of error (e.g., using a dialog)
  }
});

ipcMain.on("save-resize-settings", (event, data) => {
  unregisterShortcuts();

  try {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    const rawSettings = fs.readFileSync(settingsPath, "utf8");
    const settings = JSON.parse(rawSettings); // Parse only once

    // Update resize settings based on data
    settings.resizeWindow = {
      keybinding: data.resizeKeybind,
      windowSizePercentages: data.windowSizePercentages,
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings));
    registerShortcuts(JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving settings:", err.message, err.stack); // Include stack trace
    console.error("Settings object:", settings);
  }
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    // Create tray context menu
    const contextMenu = Menu.buildFromTemplate([
      { label: "Open Window", click: () => createWindow() },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]);

    // Set tray icon context menu
    trayIcon.setContextMenu(contextMenu);

    // Keep the app running
    app.on("activate", function () {
      createWindow();
    });
  }
});

app.on("will-quit", () => {
  unregisterShortcuts();
});
