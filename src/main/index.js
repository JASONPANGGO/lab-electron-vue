'use strict'

import {
  exec
} from 'child_process'
import electron from 'electron'
import { unzip } from '../utils'

const {
  ipcMain,
  app,
  shell,
  dialog
} = electron
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const path = require('path')
const fs = require('fs')

app.setName('mhtw')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow () {
  Menu.setApplicationMenu(null)

  const windowHeight = 479
  const windowWidth = 680
  mainWindow = new BrowserWindow({
    maxHeight: windowHeight,
    minHeight: windowHeight,
    width: windowWidth,
    height: windowHeight,
    useContentSize: false,
    maxWidth: windowWidth,
    minWidth: windowWidth,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    backgroundColor: '#333',
    frame: false
  })

  mainWindow.loadURL(winURL)

  // Open dev tools initially when in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.on('did-frame-finish-load', () => {
      mainWindow.webContents.once('devtools-opened', () => {
        mainWindow.focus()
      })
      mainWindow.webContents.openDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('write-file', (event, {
  filename,
  data
}) => {
  let result
  try {
    const filePath = path.join(process.cwd(), filename)
    console.log('write-file: ', filePath)
    fs.writeFileSync(filePath, data)
    result = filePath
  } catch (error) {
    console.error(error)
    result = JSON.stringify(error)
  }
  event.sender.send('write-file-result', result)
})

ipcMain.on('launch-exe', (event, {
  name,
  params
}) => {
  const exePath = path.join(process.cwd(), name)
  exec(exePath + params)
  event.sender.send('launch-exe-result', exePath)
})

ipcMain.on('window-minimize', () => {
  mainWindow.minimize()
})

ipcMain.on('quit', () => {
  app.quit()
})

ipcMain.on('open-link', (event, url) => {
  event.preventDefault()
  shell.openExternal(url)
})

ipcMain.on('launch-game', (event, {
  params
}) => {
  const exePath = path.join(process.cwd(), 'InphaseNXD.EXE')
  const command = `@start ${exePath} /USE_SERVER 1 /ADDR 210582139 /PORT 52000 ${params} exit`
  console.log('launch-game:', command)
  exec(command)
})

ipcMain.on('search-process', (event, params) => {
  exec('tasklist | findstr Code')
})

ipcMain.on('suicide', () => {
  dialog.showErrorBox(
    'Error',
    '检测到您开启了非法程序，游戏自动关闭，请关闭非法程序后重新启动游戏。'
  )
  app.quit()
})

ipcMain.on('alert', (event, {
  title,
  content
}) => {
  dialog.showErrorBox(title || 'Error', content || '运行错误')
})

ipcMain.on('unzip-patch', (event, { zipPath, latestTime }) => {
  unzip(zipPath).finally(() => {
    fs.unlinkSync(zipPath)
    event.sender.send('unzipped-patch')
  })
})
