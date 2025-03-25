const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL('https://super-app-1872b.web.app/'); // Заменить на локальный или онлайн-URL
}

app.whenReady().then(createWindow);
