const { BrowserWindow, Menu, app, Notification } = require("electron");
const path = require("path");
const { getSettings } = require("./settings");

let mainWindow; // Global variable to store the mainWindow reference

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 580,
    height: 760,
    icon: path.join(__dirname, "resources", "icons", "icon.png"),
    autoHideMenuBar: true,
    show: false, // Prevent initial window creation
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

  return mainWindow;
}

async function showNotification() {
  const settings = await getSettings();
  if (settings) {
    const { centerWindow, resizeWindow } = settings;

    const notification = new Notification({
      title: "Window Snapper",
      body: `Press ${centerWindow.keybinding} to center the window. \nPress ${resizeWindow.keybinding} to resize the window.`,
      silent: true,
    });

    notification.on("click", () => {
      mainWindow.show();
    });

    notification.show();
  }
}

function createTrayMenu(tray) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => mainWindow.show(),
    },
    {
      label: "Quit",
      click: () => app.quit(),
    },
  ]);
  tray.setToolTip("Window Snapper");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => mainWindow.show());

  showNotification();
}

module.exports = {
  createWindow,
  createTrayMenu,
};
