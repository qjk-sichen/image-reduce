import { app, BrowserWindow, Menu, Tray, nativeTheme } from 'electron'
import db from '../datastore'

// 主进程中运行的脚本通过创建web页面来展示用户界面
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

// 应用图标
let tray = null

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', (event) => {
    mainWindow = null
  })
  mainWindow.on('close', (event) => {
    app.quit()
  })
  const menubarPic = process.platform === 'darwin' ? `${__static}/upload.png` : `${__static}/upload.png`
  tray = new Tray(menubarPic)
  const contextMenu = Menu.buildFromTemplate([
    { label: '退出', click: () => {
      mainWindow.destroy()
      tray.destroy()
    }},
  ])
  tray.setToolTip('one piece')
  tray.setContextMenu(contextMenu)

  tray.on('click',function(){
    mainWindow.show();
  })
  mainWindow.on('close',(e) => {  
    app.quit()
    //回收BrowserWindow对象
    // if(mainWindow.isMinimized()){
    //   mainWindow = null;
    // } else {
    //   e.preventDefault();
    //   mainWindow.minimize();
    // } 
  })

  tray.on('drop-files', async (event, files) => {
    console.warn('files', files);
    
    mainWindow.webContents.send('insert-success', files);
  })
}



app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { // 当操作系统不是darwin（macOS）的话
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
