const { app, BrowserWindow, ipcMain, Notification, protocol } = require('electron')
const path = require('path')
const isDev = !app.isPackaged
const fetch = require('node-fetch')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// IPC handler for notifications
ipcMain.handle('show-notification', (_event, { title, body }) => {
  new Notification({ title, body, silent: true }).show();
});

// Register 'fitlife' as a custom protocol for OAuth
if (app.setAsDefaultProtocolClient) {
  app.setAsDefaultProtocolClient('fitlife');
}

const gotTheLock = app.requestSingleInstanceLock();
let deeplinkingUrl = null;

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv) => {
    // Windows: protocol URL will be in argv
    const url = argv.find(arg => arg.startsWith('fitlife://'));
    if (url) {
      deeplinkingUrl = url;
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('oauth-callback-url', url);
        mainWindow.focus();
      }
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    deeplinkingUrl = url;
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('oauth-callback-url', url);
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    // If the app was launched with a protocol URL
    if (deeplinkingUrl) {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('oauth-callback-url', deeplinkingUrl);
      }
    }
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });
}

ipcMain.handle('fitbit-exchange-token', async (_event, { code, clientId, codeVerifier, redirectUri }) => {
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('code_verifier', codeVerifier);
  params.append('redirect_uri', redirectUri);

  // For client-based authentication, do NOT send Authorization header
  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to exchange code for token');
  }
  return data;
});

ipcMain.handle('fitbit-api-fetch', async (_event, { url, accessToken }) => {
  try {
    console.log('Making Fitbit API request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fitbit API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.errors?.[0]?.message || `Failed to fetch Fitbit API data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fitbit-api-fetch:', error);
    throw error;
  }
}); 