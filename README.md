<h1 align="center">
  <img src="https://github.com/Team-Hycon/hycon-gui/blob/e7ecaec870f78e7c01c9ea6acef32987a512275b/hummingbird-desktop/build/icon.png" alt="Hycon Wallet" width="200">
</h1>
<h4 align="center">Hycon Wallet - Desktop app</h4>

[![Github All Releases](https://img.shields.io/github/downloads/Team-Hycon/hycon-gui/total.svg)](http://www.somsubhra.com/github-release-stats/?username=Team-Hycon&repository=hycon-gui)
[![Build Status](https://travis-ci.org/Team-Hycon/hycon-gui.svg?branch=master)](https://travis-ci.org/Team-Hycon/hycon-gui)

## Key Features

* Create and recover wallets
* Check wallet balance
* Supports [Ledger Nano S](https://www.ledgerwallet.com/products/ledger-nano-s), [Ledger Blue](https://www.ledgerwallet.com/products/ledger-blue) and [Digital BitBox](https://shiftcrypto.ch) hardware wallets - *only for 64-bit operating systems* 
* Supports Hierarchical Deterministic key creation and transfer protocol
* 2 Factor Authentication
* 8 languages support (English, Korean, Chinese, French, Vietnamese, Japanese, Mongolian and Russian)

## Download

You can [download](https://github.com/Team-Hycon/hycon-gui/releases/tag/v1.1.0) latest installable version of Hycon Wallet for Windows, macOS and Linux.

## Future Features

* Support for [Trezor](https://trezor.io) hardware wallet
* Automatic updates
* More remote node choices
* UI/UX changes

## FAQ

- ***Can I use my old wallet?***

Yes, you can. Because all of our wallets (full node, chrome extension and desktop) use same mnemonic words.

- ***How long should I wait until I can use this application to make transfers?***

Right away. It doesn't need to sync since it connects to a fully synced remote nodes automatically.

- ***Does it support hardware wallets?***

Yes. Currently it supports [Ledger Nano S](https://www.ledgerwallet.com/products/ledger-nano-s), [Ledger Blue](https://www.ledgerwallet.com/products/ledger-blue) and [Digital BitBox](https://shiftcrypto.ch) and will add other hardware wallet supports later.

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
$ npm build

# Run the app (from `hummingbird-desktop` directory)
$ npm start
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
