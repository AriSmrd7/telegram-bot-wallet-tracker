import dotenv from 'dotenv';
import "./addRequire.js";
import open from 'open';
const TelegramBot = require('node-telegram-bot-api');
const tg = new TelegramBot('595899524:AAFotgJVINxYkeoqwyvZw_GsBdy_t-osTfw',  {polling: true});
import {
  isPancakeSwapV2Router,
  getPancakeTokenURL,
  getPancakeInputToken,
  getPoocoinTokenURL,
  getWeb3Connection,
  getWallets,
  getBscScanTxURL,
  playSound,
  getBscScanAddressUrl,
} from './helpers.js';

dotenv.config();

const wallets = getWallets();
const web3 = getWeb3Connection();

const shouldOpenPoocoin = /^true$/i.test(process.env.OPEN_POOCOIN.toLowerCase());
const shouldOpenPancake = /^true$/i.test(process.env.OPEN_PANCAKE.toLowerCase());
const shouldPlaySound = /^true$/i.test(process.env.PLAY_SOUND.toLowerCase());
let firstTxFound = false;

const subscription = web3.eth.subscribe('pendingTransactions', (err, txHash) => {
  if (err) {
    console.log(`🔴 Error retrieving network pending transactions or bad GetBlock.io API Key`);
    tg.sendMessage(-1001708675106,`🔴 Error retrieving network pending transactions or bad GetBlock.io API Key`)
    throw (err);
  }
})
  .on('connected', (subscriptionId) => {
    console.log(`🟢 Watching`, wallets);
  })
  .on('data', (txHash) => {
    return web3.eth.getTransaction(txHash, async (err, transaction) => {
      
      if (err) {
        console.log(`🔴 ${txHash} not valid transaction`);
        throw (err);
      }
      if (transaction && (wallets.includes(transaction.from) || wallets.includes(transaction.to))) {

        const isPancakeV1 = isPancakeSwapV2Router(transaction.to);
        const tokenAddress = getPancakeInputToken(transaction.input);

        if (shouldPlaySound) playSound('notification');

        if (tokenAddress) {
          const poocoinURL = getPoocoinTokenURL(tokenAddress);
          const pancakeURL = getPancakeTokenURL(tokenAddress, isPancakeV1);
    
          const txURL = getBscScanTxURL(transaction.hash);
          const ownerAddress = wallets.includes(transaction.from) ? transaction.from : transaction.to;
          const bscAddress = getBscScanAddressUrl(ownerAddress);

          // var photo_url = "https://i.imgur.com/fOQeUcQ.png";
          // const opts = {
          //     'caption': `💥 *NEW TRANSACTION IN* \n${bscAddress}\n\n🟡 *TxnLink :* \n${txURL}\n💩 *PooCoin :* \n${poocoinURL}\n🥞 *PancakeSwap :* \n${pancakeURL}\n`,
          //     'parse_mode': 'markdown',
          // };
          tg.sendMessage(-1001708675106, `💥<b>NEW TRANSACTION IN</b>\n<a href="${bscAddress}">${ownerAddress}</a>\n\n🟡TxnLink : <a href="${txURL}">Open Link</a>\n💩PooCoin : <a href="${poocoinURL}">Open Link</a>\n🥞PancakeSwap : <a href="${pancakeURL}">Open Link</a>`,{parse_mode: 'HTML'})

          // console.log(`💥 NEW TRANSACTION IN ${ownerAddress}`);
          // console.log(`🟡 Transaction: ${txURL}`);
          // console.log(`💩 Poocoin: ${poocoinURL}`);
          // console.log(`🥞 PancakeSwap: ${pancakeURL}`);
          // console.log(`----------------------------------------------------------------------------`);

          if (!firstTxFound) {
            firstTxFound = true;
            if (shouldOpenPoocoin) await open(poocoinURL);
            if (shouldOpenPancake) await open(pancakeURL);
          }
        }
      }
    });
  })
  .on('error', console.error);

process.on('SIGINT', () => {
  subscription.unsubscribe((error, success) => { });
  process.exit();
});