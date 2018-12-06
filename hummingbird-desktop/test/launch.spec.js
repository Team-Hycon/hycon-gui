const Application = require('spectron').Application
const electronPath = require('electron')
const path = require('path')

describe('Application launch', () => {
    let app

    beforeEach( async () => {
        app = new Application({
            path: electronPath,
            args: [path.join(__dirname, '..')]
        })

        await app.start()
        await app.client.waitUntilWindowLoaded()
    })

    afterEach(function () {
        if (app && app.isRunning()) {
            return app.stop()
        }
    })

    it('shows an initial window', async () => {
        expect(await app.client.getWindowCount()).toBe(1)
        expect(await app.browserWindow.isVisible()).toBe(true)
        expect(await app.browserWindow.isMinimized()).toBe(false)

        const { width, height } = await app.browserWindow.getBounds()
        expect(width).toBeGreaterThan(0)
        expect(height).toBeGreaterThan(0)
    })

})
