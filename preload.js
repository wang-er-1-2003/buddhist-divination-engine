// SPDX-License-Identifier: MIT
// Copyright (c) 2026 wang-er-1-2003
// 佛教占卜引擎子件 - preload
'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('fozhan', {
  data: () => ipcRenderer.invoke('fozhan-data'),
});
