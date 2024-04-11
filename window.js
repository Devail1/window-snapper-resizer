const { BrowserWindow, Menu, app } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
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

function createTrayMenu(tray, mainWindow) {
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
}

module.exports = {
  createWindow,
  createTrayMenu,
};
