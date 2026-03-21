const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 620,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
 
}

app.whenReady().then(createWindow);

