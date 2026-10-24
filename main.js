// SPDX-License-Identifier: MIT
// Copyright (c) 2026 wang-er-1-2003
// 佛教占卜引擎子件 - 主进程（Electron）
'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function loadJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'engine', 'data', name), 'utf-8'));
  } catch (e) {
    console.error(name + ' load failed:', e.message);
    return null;
  }
}

const GUANYIN_100 = loadJson('guanyin_100.json');           // 观音灵签100签
const LIUSHIJIAZI = loadJson('liushijiazi_63.json');       // 六十甲子签（妈祖）
const DIZANG_60   = loadJson('dizang_60.json');             // 地藏王殿60签（荃湾）
const FUZU_51     = loadJson('fuzu_51.json');               // 佛祖灵签51签（玄武山）
const GUANYIN_LIU = loadJson('guanyin_mingjinglun_6.json'); // 观音明镜论6卦
const TIANMU      = loadJson('jixiang_tianmu.json');        // 吉祥天母骰子卜
const GUANYIN_32  = loadJson('guanyin_32ke.json');          // 观音32感应灵课（五钱卜）
const WENZHU_36   = loadJson('wenzhu_mo_36.json');          // 文殊占筮法Mo 36卦
const DIZANG_189  = loadJson('dizang_189.json');             // 地藏占察木轮189相

function createWindow() {
  const win = new BrowserWindow({
    width: 1420, height: 940,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile('index.html');
}

ipcMain.handle('fozhan-data', () => {
  return {
    ok: true,
    guanyin100: GUANYIN_100,
    liushijiazi: LIUSHIJIAZI,
    dizang60: DIZANG_60,
    fuzu51: FUZU_51,
    guanyinLiu: GUANYIN_LIU,
    tianmu: TIANMU,
    guanyin32: GUANYIN_32,
    wenzhu36: WENZHU_36,
    dizang189: DIZANG_189,
  };
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
