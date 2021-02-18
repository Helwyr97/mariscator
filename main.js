const {app, BrowserWindow, shell} = require('electron');
const path = require('path');

let win = null;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        icon: path.join(app.getAppPath(), 'build/icon.png'),
        webPreferences: {
            preload: path.join(app.getAppPath(),'preload.js')
        }
    });

    win.loadFile(path.join(app.getAppPath(),'src/index.html'));
    win.setMenu(null)
    //win.webContents.openDevTools();
    win.webContents.on('will-navigate', function(event, url){
        event.preventDefault();
        shell.openExternal(url);
    });
}


if(require('electron-squirrel-startup')) return app.quit();

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});