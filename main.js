const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const child = require("child_process");
const path = require("path");
const fs = require("fs");
const defaultSettings = require("./defaultSettings.json");

let mainWindow;
let tray;
let autohotkeyProcess;

const resourcesPath = path.join(process.cwd(), "/resources/autohotkey");
const autohotkeyPath = path.join(resourcesPath, "/AutoHotkey32.exe");
const scriptPath = path.join(resourcesPath, "/center-window-resize.ahk");
const settingsPath = path.join(app.getPath("userData"), "/settings.json");

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 680,
    icon: "resources/icons/icon.png",
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
  tray = new Tray(path.join(process.cwd(), "resources/icons/icon.png"));
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

function reloadChildProcess() {
  if (autohotkeyProcess) {
    try {
      autohotkeyProcess.kill();
    } catch (error) {
      console.error("Error killing child process:", error);
    }
  }

  try {
    autohotkeyProcess = child.spawn(autohotkeyPath, [scriptPath]);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Error spawning AutoHotkey:", error.message);
      // Optionally display a user notification about missing AutoHotkey
    } else {
      console.error("Unexpected error spawning AutoHotkey:", error);
    }
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  reloadChildProcess();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

async function resetSettings(event) {
  event.sender.send("load-settings-reply", {
    settings: defaultSettings,
  });
  fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings));
  reloadChildProcess(); // Reload after saving
}

ipcMain.on("reset-settings", (event) => {
  resetSettings(event);
});

ipcMain.on("load-settings", (event) => {
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
  }
});

const watcher = () => {
  !fs.existsSync(settingsPath) && resetSettings();
  return fs.watch(settingsPath, () => {
    reloadChildProcess();
  });
};

ipcMain.on("save-center-settings", async (event, data) => {
  try {
    const rawSettings = await fs.promises.readFile(settingsPath, "utf8");
    const settings = JSON.parse(rawSettings);

    settings.centerWindow.keybinding = data.centerKeybind;

    await fs.promises.writeFile(settingsPath, JSON.stringify(settings)); // Indent for readability
    reloadChildProcess(); // Reload after saving
  } catch (err) {
    console.error("Error saving settings:", err.message, err.stack);
    // Optionally notify user of error (e.g., using a dialog)
  }
});

ipcMain.on("save-resize-settings", async (event, data) => {
  try {
    const rawSettings = fs.readFileSync(settingsPath, "utf8");
    const settings = JSON.parse(rawSettings); // Parse only once

    // Update resize settings based on data
    settings.resizeWindow = {
      keybinding: data.resizeKeybind,
      windowSizePercentages: data.windowSizePercentages,
    };

    await fs.promises.writeFile(settingsPath, JSON.stringify(settings)); // Indent for readability
    reloadChildProcess(); // Reload after saving
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
  watcher().close();
  if (autohotkeyProcess) {
    autohotkeyProcess.kill();
  }
});
