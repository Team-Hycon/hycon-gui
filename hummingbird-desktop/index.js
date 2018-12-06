const { app, BrowserWindow, Menu, dialog, nativeImage } = require("electron")
const { autoUpdater } = require("electron-updater")
const { ipcMain } = require("electron")
const Transport = require("@ledgerhq/hw-transport-node-hid")
const Hycon = require("@glosfer/hw-app-hycon")
const os = require("os")
const path = require("path")
const { hid } = require("@glosfer/bitbox-nodejs")
const { BitBox } = require("@glosfer/bitbox-app-hycon")
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

/* Below is realated with bitbox hardware wallet */
function getBitbox() {
	try {
		const hidInfo = hid.getDeviceInfo()
		if (!hidInfo) { throw 20 }
		const bitbox = new BitBox(hidInfo.path)
		return bitbox
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		throw 20
	}
}

function checkBitboxPasswordSetting(bitbox = getBitbox()) {
	try {
		const response = bitbox.ping()
		if (!bitbox.initialize) {
			if (response.error && response.error.code === 113) { bitbox.close(); throw 29 }
			return { bitbox, result: false }
		}
		return { bitbox, result: true }
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		throw 34
	}
}

function createBitboxPassword(password) {
	try {
		const bitbox = getBitbox()
		const isSetted = checkBitboxPasswordSetting(bitbox)
		if (isSetted.result) { bitbox.close(); throw 24 }
		bitbox.createPassword(password)
		const result = checkBitboxPasswordSetting(bitbox)
		return { bitbox, result: result.result }
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		throw 33
	}
}

async function checkBitboxWalletSetting(password, bitbox = getBitbox()) {
	try {
		const isSetted = checkBitboxPasswordSetting(bitbox)
		if (!isSetted.result) { bitbox.close(); throw 21 }
		bitbox.setPassword(password)

		const status = await bitbox.deviceInfo().catch((e) => {
			bitbox.close()
			if (e.error.code === 101) { throw 26 }
			if (e.error.code === 113) { throw 29 }
			const remainAttemp = e.error.message.match(/\d/g).join("")
			if (remainAttemp === "0") { throw 26 }
			throw { error: 23, remain_attemp: remainAttemp }
		})
		if (status && !status.device.seeded) {
			return { bitbox, result: false }
		}
		return { bitbox, result: true }
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		if (e.remain_attemp) { throw e }
		throw 32
	}
}

async function setBitboxWallet(name, password) {
	try {
		const bitbox = getBitbox()
		const isSetted = await checkBitboxWalletSetting(password, bitbox)
		if (isSetted.result) { bitbox.close(); throw 25 }
		await bitbox.deleteAllWallets()
		await bitbox.createWallet(name)
		await bitbox.setName(name)
		const result = await checkBitboxWalletSetting(password, bitbox)
		return { bitbox, result: result.result }
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		throw 31
	}
}

async function getBitboxExtendedKey(password, startIndex, count) {
	try {
		const bitbox = getBitbox()
		const isSetted = await checkBitboxWalletSetting(password, bitbox)
		if (!isSetted.result) { bitbox.close(); throw 22 }
		const extendedPubArray = []
		for (let index = startIndex; index < startIndex + count; index++) {
			const path = `m/44'/1397'/0'/0/${index}`
			const xpub = await bitbox.getXPub(path)
			extendedPubArray.push(xpub.xpub)
		}
		return { bitbox, result: extendedPubArray }
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		if (e.remain_attemp) { throw e }
		throw 30
	}
}

async function sendTxWithBitbox(password, path, hash) {
	try {
		const bitbox = getBitbox()
		const isSetted = await checkBitboxWalletSetting(password, bitbox)
		if (!isSetted.result) { bitbox.close(); throw 22 }
		const response = await bitbox.sign(path, hash)
		if (!response.sign) { bitbox.close(); throw 28 }
		return { bitbox, result: response.sign[0] }
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		if (e.remain_attemp) { throw e }
		throw 28
	}
}

async function updateBitboxPassword(originalPwd, newPwd) {
	try {
		const bitbox = getBitbox()
		const isSetted = await checkBitboxWalletSetting(originalPwd, bitbox)
		if (!isSetted.result) { bitbox.close(); throw 22 }
		const updateResult = await bitbox.updatePassword(newPwd)
		if (updateResult.error || updateResult.password !== "success") { bitbox.close(); throw 38 }
		return { bitbox, result: true }
	} catch (e) {
		if (typeof (e) === "number") { throw e }
		if (e.remain_attemp) { throw e }
		throw 38
	}
}

if (process.env.NODE_ENV === 'development') {
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, "node_modules", ".bin", "electron")
	});
}

app.on('ready', function() {
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu)

	createWindow()
})

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


ipcMain.on("checkBitboxPasswordSetting", (event) => {
	try {
		const result = checkBitboxPasswordSetting()
		result.bitbox.close()
		event.returnValue = result.result
	} catch (e) {
		event.returnValue = { error: e }
	}
})

ipcMain.on("createBitboxPassword", (event, arg) => {
	try {
		const result = createBitboxPassword(arg.password)
		result.bitbox.close()
		event.returnValue = result.result
	} catch (e) {
		event.returnValue = { error: e }
	}
})

ipcMain.on("checkBitboxWalletSetting", async (event, arg) => {
	try {
		const result = await checkBitboxWalletSetting(arg.password)
		result.bitbox.close()
		event.returnValue = result.result
	} catch (e) {
		event.returnValue = { error: e }
	}
})

ipcMain.on("setBitboxWallet", async (event, arg) => {
	try {
		const result = await setBitboxWallet(arg.name, arg.password)
		result.bitbox.close()
		event.returnValue = result.result
	} catch (e) {
		event.returnValue = { error: e }
	}
})

ipcMain.on("getBitboxExtendedKey", async (event, arg) => {
	try {
		const result = await getBitboxExtendedKey(arg.password, arg.startIndex, arg.count)
		result.bitbox.close()
		event.returnValue = result.result
	} catch (e) {
		event.returnValue = { error: e }
	}
})

ipcMain.on("sendTxWithBitbox", async (event, arg) => {
	try {
		const result = await sendTxWithBitbox(arg.password, arg.path, arg.hash)
		result.bitbox.close()
		event.returnValue = result.result
	} catch (e) {
		event.returnValue = { error: e }
	}
})

ipcMain.on("updateBitboxPassword", async (event, arg) => {
	try {
		const result = await updateBitboxPassword(arg.originalPwd, arg.newPwd)
		result.bitbox.close()
		event.returnValue = result.result
	} catch (e) {
		event.returnValue = { error: e }
	}
})
const template = [
	{
		'label': 'Help',
		'role': 'help',
		submenu: [
			{
				label: 'About',
				click(item, focusedWindow) {
					if (focusedWindow) {
						const options = {
							buttons: ['OK'],
							message: `Hycon lite wallet`,
							detail: `${app.getVersion()}`,
							icon: nativeImage.createFromPath('./build/icon.png')
						};
						dialog.showMessageBox(focusedWindow, options, () => {});
					}
				}
			},
			{label: 'Quit', role: "quit"}
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
			{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
			{ type: "separator" },
			{ label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
			{ label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
			{ label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
			{ label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" }
		]
	},
	{
		label: 'View',
		submenu: [
			{ label: "Refresh", accelerator: "F5", role: "reload" },
			{ label: "Console", role: "toggledevtools" },
		]
	}
]