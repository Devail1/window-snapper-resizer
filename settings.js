const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const defaultSettings = require("./defaultSettings.json"); // Assuming defaultSettings.json is in the parent directory

const { reloadAutoHotkey } = require("./autohotkey");

const settingsPath = path.join(app.getPath("userData"), "settings.json");
let settingsWatcher;

async function resetSettings(event) {
  event.sender.send("load-settings-reply", { settings: defaultSettings });
  await fs.promises.writeFile(settingsPath, JSON.stringify(defaultSettings));
  reloadAutoHotkey();
}

async function loadSettings(event) {
  try {
    const settings = (await fs.existsSync(settingsPath))
      ? JSON.parse(await fs.promises.readFile(settingsPath, "utf8"))
      : defaultSettings;
    event.sender.send("load-settings-reply", { settings });
    reloadAutoHotkey();
  } catch (err) {
    console.error("Error loading settings:", err.message, err.stack);
  }
}

async function saveCenterSettings(event, data) {
  try {
    const rawSettings = await fs.promises.readFile(settingsPath, "utf8");
    const settings = JSON.parse(rawSettings);
    settings.centerWindow.keybinding = data.centerKeybind;
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    reloadAutoHotkey();
  } catch (err) {
    console.error("Error saving center settings:", err.message, err.stack);
  }
}

async function saveResizeSettings(event, data) {
  try {
    const rawSettings = await fs.promises.readFile(settingsPath, "utf8");
    const settings = JSON.parse(rawSettings);
    settings.resizeWindow = {
      keybinding: data.resizeKeybind,
      windowSizePercentages: data.windowSizePercentages,
    };
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    reloadAutoHotkey();
  } catch (err) {
    console.error("Error saving resize settings:", err.message, err.stack);
  }

  settingsWatcher = fs.watch(settingsPath, () => reloadAutoHotkey());
}

module.exports = {
  resetSettings,
  loadSettings,
  saveCenterSettings,
  saveResizeSettings,
  closeWatcher: () => settingsWatcher.close(), // Function to close watcher
};
