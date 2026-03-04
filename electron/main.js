import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "SecuPatrol",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // 隐藏默认的菜单栏
  win.setMenuBarVisibility(false);

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  
  ipcMain.handle('open-device', async (event, data) => {
    const { url, browser, mode, username, password } = data;
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) targetUrl = 'http://' + targetUrl;

    if (browser === 'builtin') {
      const child = new BrowserWindow({ width: 1024, height: 768, title: "Device Login" });
      child.setMenuBarVisibility(false);
      child.loadURL(targetUrl);
      
      if (mode === 'auto') {
        child.webContents.on('did-finish-load', () => {
          child.webContents.executeJavaScript(`
            setTimeout(() => {
              const inputs = document.querySelectorAll('input');
              let userField, passField;
              for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].type === 'password') {
                  passField = inputs[i];
                  for (let j = i - 1; j >= 0; j--) {
                    if (inputs[j].type === 'text' || inputs[j].type === 'email') {
                      userField = inputs[j];
                      break;
                    }
                  }
                  break;
                }
              }
              if (userField && passField) {
                userField.value = '${username}';
                passField.value = '${password}';
                userField.dispatchEvent(new Event('input', { bubbles: true }));
                passField.dispatchEvent(new Event('input', { bubbles: true }));
                userField.dispatchEvent(new Event('change', { bubbles: true }));
                passField.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }, 1000);
          `);
        });
      }
      return { success: true, message: 'Opened in built-in browser' };
    } else {
      const isWin = process.platform === 'win32';
      let command = '';
      
      if (isWin) {
        if (browser === 'chrome') command = `start chrome "${targetUrl}"`;
        else if (browser === 'firefox') command = `start firefox "${targetUrl}"`;
        else if (browser === 'edge') command = `start msedge "${targetUrl}"`;
        else command = `start "" "${targetUrl}"`;
      } else {
        command = `open "${targetUrl}"`;
      }

      exec(command, (error) => {
        if (error) console.error('Failed to open browser:', error);
      });

      if (mode === 'auto') {
        clipboard.writeText(password || '');
        return { success: true, message: '已在外部浏览器打开。由于外部浏览器安全限制无法直接注入，密码已自动复制到剪贴板，请直接粘贴 (Ctrl+V)。' };
      }
      
      return { success: true, message: 'Opened in external browser' };
    }
  });
});

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
