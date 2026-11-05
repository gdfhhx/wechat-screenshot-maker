const { app, BrowserWindow, ipcMain, dialog, nativeImage, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 940,
    minHeight: 620,
    title: '微信聊天截图生成器',
    backgroundColor: '#e6e6e6',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 保存截图（PNG）
ipcMain.handle('save-image', async (event, payload) => {
  const { dataUrl, defaultName } = payload;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存聊天截图',
    defaultPath: defaultName || '微信聊天截图.png',
    filters: [
      { name: 'PNG 图片', extensions: ['png'] },
      { name: 'JPEG 图片', extensions: ['jpg', 'jpeg'] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return { ok: false, canceled: true };
  }

  try {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(base64, 'base64');

    // 如果用户选择了 jpg/jpeg 扩展名，则转为 jpeg
    if (/\.jpe?g$/i.test(result.filePath)) {
      const img = nativeImage.createFromBuffer(buf);
      const jpeg = img.toJPEG(90);
      fs.writeFileSync(result.filePath, jpeg);
    } else {
      fs.writeFileSync(result.filePath, buf);
    }
    return { ok: true, filePath: result.filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// 复制图片到剪贴板
ipcMain.handle('copy-image', async (event, dataUrl) => {
  try {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(base64, 'base64');
    const img = nativeImage.createFromBuffer(buf);
    clipboard.writeImage(img);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
