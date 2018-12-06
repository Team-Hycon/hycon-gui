<h4 align="center">Hycon Wallet - Desktop app </h4>

## Key Features

* Create and recover wallets
* Check wallet balance
* Supports <a href="https://www.ledgerwallet.com/products/ledger-nano-s" target="_blank">Ledger Nano S</a> hardware wallet - *only for 64-bit operating systems*

## Download

You can [download](https://github.com/Team-Hycon/hycon-gui/releases/tag/v1.0.0-beta.0) latest installable version of Hycon Wallet for Windows, macOS and Linux.

## Future Features

* Support for <a href="https://trezor.io" target="_blank">Trezor</a> hardware wallet

## FAQ

- ***Can I use my old wallet?***

Yes, you can. Because all of our wallets (full node, chrome extension and desktop) use same mnemonic words.

- ***How long should I wait until I can use this application to make transfers?***

Right away. It doesn't need to sync since it connects to a fully synced remote nodes automatically.

- ***Does it support hardware wallets?***

Yes. Currently it supports <a href="https://www.ledgerwallet.com/products/ledger-nano-s" target="_blank">Ledger Nano S</a> and will add other hardware wallet supports later.

- ***Why doesn't it show the button to interact with my hardware wallet?***

Hardware wallets are not supported in 32-bit systems due to security concerns.

<h4 align="center">For developers</h4>

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/Team-Hycon/hycon-gui

# Go into the repository
$ cd hycon-gui

# Install common dependencies
$ npm install

# Go into desktop app directory
$ cd hummingbird-desktop

# Install electron dependencies
$ npm install

# Compile and pack typescript codes (from `hummingbird-desktop` directory)
$ npm run build

# Run the app (from `hummingbird-desktop` directory)
$ npm run start
```

## Packaging installation files

```bash
npm dist
```

### Testing

Test files are located at `test` directory.

```bash
npm test
```

## Issues & Pull Requests

If you have an issue, feel free to add it to the [Issues](https://github.com/Team-Hycon/hycon-gui/issues) tab.
If you'd like to help us out, the [Pull Request](https://github.com/Team-Hycon/hycon-gui/pulls) tab is a great place to start.

**If you have found a security bug, please contact us at [security@glosfer.com](security@glosfer.com).**
