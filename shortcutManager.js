const { globalShortcut } = require("electron");
const { resizeWindowAction, centerWindowAction } = require("./windowUtils"); // Assuming centering is included

function registerShortcuts(data) {
  try {
    const { centerWindow, resizeWindow } = JSON.parse(data);
    // Register center window shortcut (optional, might be handled in resizeWindowAction)
    globalShortcut.register(centerWindow.keybinding, () => {
      centerWindowAction();
    });

    // Register resize window shortcut with centering (assuming resizeWindowAction centers)
    globalShortcut.register(resizeWindow.keybinding, () => {
      resizeWindowAction(resizeWindow.windowSizePercentages);
      centerWindowAction();
    });
  } catch (err) {
    console.error("Error parsing shortcut data:", err);
    // Handle errors gracefully (e.g., display a message or disable shortcuts)
  }
}

function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = {
  registerShortcuts,
  unregisterShortcuts,
};
