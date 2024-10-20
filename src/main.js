const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("node:path");
const fs = require("fs");

let mainWindow;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",

          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openFile"],
                filters: [{ name: "Text Files", extensions: ["txt"] }],
              })
              .then((result) => {
                if (!result.canceled) {
                  fs.readFile(result.filePaths[0], "utf8", (err, data) => {
                    if (err) {
                      console.log(err);
                    } else {
                      mainWindow.webContents.executeJavaScript(
                        `document.getElementById('main').innerHTML = \`${data}\``
                      );
                    }
                  });
                }
              })
              .catch((err) => {
                console.log(err); // Logs any errors that occur during execution
              });
          },
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            let mainContent;
            mainWindow.webContents
              .executeJavaScript("document.getElementById('main').innerText")
              .then((content) => {
                // Replace non-breaking spaces with regular spaces before saving
                mainContent = content.replace(/\u00A0/g, " ");

                dialog
                  .showSaveDialog({
                    filters: [
                      { name: "Text Files", extensions: ["txt"] },
                      { name: "Python files", extensions: ["py"] },
                    ],
                  })
                  .then((result) => {
                    if (!result.canceled) {
                      fs.writeFile(result.filePath, mainContent, (err) => {
                        if (err) {
                          console.log(err);
                        }
                      });
                    }
                  })
                  .catch((err) => {
                    console.log(err); // Logs any errors that occur during execution
                  });
              })
              .catch((err) => {
                console.log(err); // Logs any errors that occur during execution
              });
          },
        },
      ],
    },
    {
      label: "Edit",
      role: "editMenu",
    },
    {
      label: "Settings",
      submenu: [
        {
          label: "Prefrences",
          submenu: [
            {
              label: "Dark Mode",
              type: "checkbox",
              click: () => {
                mainWindow.webContents.send("Theme-Change");
              },
            },
          ],
        },
        {
          label: "DevTools",
          role: "toggleDevTools",
        },
      ],
    },
    {
      label: "View",
      role: "viewMenu",
    },
    {
      label: "Window",
      role: "windowMenu",
    },
  ]);

  Menu.setApplicationMenu(menu);

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put t
