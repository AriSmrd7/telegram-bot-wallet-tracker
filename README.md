# Wallet Tracker

Track a list of crypto wallets to get notified when a new transaction is being processed.

## Installation

```
npm install
```

## Usage

- Copy `.env.sample` and rename to `.env`.

- Customize `.env` preferences and replace GetBlock.io API Key with yours (default is a limited one only for development).

- Copy `.wallets.sample` and rename to `.wallets`.

- Edit `.wallets` and add all the wallets to watch line-by-line like in the example below:

```
0x6660e0aac73c495d49ded3934132c405c4615e01
0xf60d6c152e89edf22a70de490f3be1fa309ca779
```

- Start tracking with `npm start`