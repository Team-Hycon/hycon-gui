const { app, BrowserWindow } = require("electron")
const { autoUpdater } = require("electron-updater")
const { ipcMain } = require("electron")
const Transport = require("@ledgerhq/hw-transport-node-hid")
const Hycon = require("@glosfer/hw-app-hycon")
const os = require("os")
const path = require("path")

let mainWindow

async function getAddresses(start, count) {
	const transport = await Transport.default.create(5000, 10000)
	const hycon = new Hycon.default(transport)
	const addresses = []
	const startIndex = Number(start)
	for (let index = startIndex; index < startIndex + count; index++) {
		addresses.push(await _getAddress(hycon, index))
	}
	await transport.close()
	return addresses
}

async function _getAddress(hycon, index = 0) {
	try {
		const result = await hycon.getAddress(`44'/1397'/0'/0/${index}`)
		return result.stringAddress
	} catch (e) {
		console.log(`Fail to getAddress from Hycon App : ${e}`)
		throw e
	}
}

async function sign(rawTxHex, index = 0) {
	try {
		const transport = await Transport.default.create(5000, 10000)
		const hycon = new Hycon.default(transport)
		const signTransaction = await hycon.signTransaction(`44'/1397'/0'/0/${index}`, rawTxHex)
		await transport.close()
		return signTransaction
	} catch (e) {
		console.log(`Fail to sign with Ledger : ${e}`)
		throw e
	}
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600
	})

	// and load the index.html of the app.
	mainWindow.loadFile('index.html')
	autoUpdater.checkForUpdatesAndNotify()

	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

if (process.env.NODE_ENV === 'development') {
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, "node_modules", ".bin", "electron")
	});
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
})

ipcMain.on("getAddress", async (event, arg) => {
	try {
		const count = 10
		const addresses = await getAddresses(arg, count)
		event.returnValue = addresses
	} catch (e) {
		event.returnValue = e
	}
})

ipcMain.on("sign", async (event, arg) => {
	try {
		const signedInfo = await sign(arg.rawTxHex, arg.index)
		event.returnValue = signedInfo
	} catch (e) {
		event.returnValue = e
	}
})

ipcMain.on("getUserPath", async (event, arg) => {
	event.returnValue = app.getPath('userData');
})

ipcMain.on("getOSArch", async (event, arg) => {
	event.returnValue = os.arch();
})
