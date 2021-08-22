import { app, BrowserWindow, globalShortcut } from 'electron'
import { overlayWindow } from '../'

// https://github.com/electron/electron/issues/25153
app.disableHardwareAcceleration()

let window: BrowserWindow

function createWindow() {
  window = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    },
    ...overlayWindow.WINDOW_OPTS
  })

  window.loadURL(`data:text/html;charset=utf-8,
  <head>
  <title>overlay-demo</title>
  <style>
  </style>
</head>
<body style="padding: 0; margin: 0;">
<div style="position: absolute; width: 100%; height: 100%; background: rgba(0,0,0,0.2); box-sizing: border-box; pointer-events: none;"></div>
  <div style="padding-top: 10vh; padding-left: 0vh; text-align: top; font-family: sans-serif; color: Violet">
    <div style="padding: 16px; background: rgba(0,0,0,0.8); border: 0px solid black; display: inline-block;">
      <span id="text1">AAAAAAAAAAAAAAAAA</span>
    </div>
  </div>
  </div>
  <script>
    const electron = require('electron');
    electron.ipcRenderer.on('message', (e, msg) => {
      document.getElementById('text1').textContent = msg
    });
    </script>
</body>
`)

  // NOTE: if you close Dev Tools overlay window will lose transparency 
  window.webContents.openDevTools({ mode: 'detach', activate: true })
  window.setIgnoreMouseEvents(true)
  window.on("close", () => { 
     overlayWindow.stop(); 
  });
  makeDemoInteractive()
  //overlayWindow.attachTo(window, 'Sem título - Bloco de Notas')
  overlayWindow.start(window, 'Sem título - Bloco de Notas')
}

function makeDemoInteractive () {
  let isInteractable = false

  function toggleOverlayState () {
    if (isInteractable) {
      window.setIgnoreMouseEvents(true)
      isInteractable = false
      overlayWindow.focusTarget()
      window.webContents.send('focus-change', false)
    } else {
      window.setIgnoreMouseEvents(false)
      isInteractable = true
      overlayWindow.activateOverlay()
      window.webContents.send('focus-change', true)
    }
  }

  globalShortcut.register('CmdOrCtrl + Q', toggleOverlayState)
  globalShortcut.register('CmdOrCtrl + H', () => { window.webContents.send('visibility-change', false) })
  globalShortcut.register('CmdOrCtrl + I', () => { console.log("Close"); window.close() })
  globalShortcut.register('CmdOrCtrl + U', () => { console.log("Stop"); overlayWindow.stop() })
  globalShortcut.register('CmdOrCtrl + K', () => { console.log("Start"); overlayWindow.start(window, 'Sem título - Bloco de Notas') })
}

app.on('ready', () => {
  setTimeout(
    createWindow,
    process.platform === 'linux' ? 1000 : 0 // https://github.com/electron/electron/issues/16809
  )
})
