const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { handleStocks } = require('./dbHandler');
const { contextIsolated } = require('process');


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    ipcMain.on('ping', (event, data) => {
        console.log(event, data)
    });

    ipcMain.on('crud', async (event, data) => {
        const table = data.table;
        let response;
        if (table === 'stocks')
            response = await handleStocks(data.operation, data.data)
        console.log(response)
        event.sender.send('data', response)
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
})

