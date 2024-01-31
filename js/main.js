import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
  WagmiCore,
  WagmiCoreChains
} from "https://unpkg.com/@web3modal/ethereum@2.6.2";

import { Web3Modal } from "https://unpkg.com/@web3modal/html@2.6.2";

// 0. Import wagmi dependencies
const { bsc } = WagmiCoreChains;
const { configureChains, createConfig, erc20ABI, prepareSendTransaction, sendTransaction, switchNetwork, disconnect, watchAccount, watchNetwork } = WagmiCore;

// 1. Define chains
const chains = [bsc];
const projectId = "2aca272d18deb10ff748260da5f78bfd";

// 2. Configure wagmi client
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ chains, version: 2, projectId }),
  ],
  publicClient,
  
});

// 3. Create ethereum and modal clients
const ethereumClient = new EthereumClient(wagmiConfig, chains);
const web3Modal = new Web3Modal({ projectId }, ethereumClient);

// -- DOGE

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const DOGE_ADDRESS = '0x9B08cBF6a43Cd07FFcd6DEb2cF992D3b503a6F8B'; 
const PRE_SALE_ADDRESS = '0xE3d9dE7923b40F66d945ee412669c24568c137d8';
// const PRE_SALE_ADDRESS = '0xAd699E5AC46c11E239913AA5F78AFA15E5CcE4A8'; 

// const PRE_SALE_ADDRESS = '0x4a30552102b220C1b12394Bc8dfFFfa4D89EA27a';
// const USDT_ADDRESS = '0x650EcAEA321482fF342fbDD011E740D8B54891d0';
// const DOGE_ADDRESS = '0x92bbCD2d1dA0c153b784ffC1C00C25352fA089B6'; 

const ethAmount = document.querySelector("#ethAmount");
const dogeEthAmount = document.querySelector("#dogeEthAmount");
const usdtAmount = document.querySelector("#usdtAmount");
const dogeUsdtAmount = document.querySelector("#dogeUsdtAmount");
const myDogeBalance = document.querySelector("#myDogeBalance");
const myDogeBalanceValue = document.querySelector("#myDogeBalanceValue");
const myDogeBalanceAddress = document.querySelector("#myDogeBalanceAddress");
const usdtError = document.querySelector("#usdtError");
const ethError = document.querySelector("#ethError");
const buyDogeProcessing = document.querySelectorAll(".buy-doge-processing");
const buyDoge = document.querySelectorAll(".buy-doge");
const showTxHash = document.querySelectorAll(".showTxHash");
const txHashDom = document.querySelectorAll(".txHash");
const showTxHashLink = document.querySelectorAll(".showTxHashLink");

function showProcessing() {
  [].forEach.call(buyDogeProcessing, function (item) {
    item.style.display = "block";
  });
  [].forEach.call(buyDoge, function (item) {
    item.style.display = "none";
  });
}

function hideProcessing() {
  [].forEach.call(buyDogeProcessing, function (item) {
    item.style.display = "none";
  });
  [].forEach.call(buyDoge, function (item) {
    item.style.display = "block";
  });
}

function start_and_end(str) {
  if (str.length > 35) {
    return str.substr(0, 10) + '...' + str.substr(str.length-10, str.length);
  }
  return str;
}

function showTxHashView(txHash) {
  [].forEach.call(showTxHash, function (item) {
    item.style.display = "block";
  });
  [].forEach.call(txHashDom, function (item) {
    item.innerHTML = start_and_end(txHash);
  });
  [].forEach.call(showTxHashLink, function (item) {
    item.href = "https://bscscan.com/tx/" + txHash;
  });
}

function showError(view, message) {
  view.innerHTML = message;
  view.style.display = "block";
}

function hideError(view) {
  view.style.display = "none";
}

let usdtContract;

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

let web3;
let _web3;

let preSaleContract;
let lastHitInputName;

const preSaleABI = [
  {
    inputs: [
      { internalType: "address", name: "paymentToken_", type: "address" },
      { internalType: "uint256", name: "paymentAmount_", type: "uint256" },
      { internalType: "address", name: "refer_", type: "address" },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "paymentToken_", type: "address" },
      { internalType: "uint256", name: "tokenAmount_", type: "uint256" },
    ],
    name: "buyExactTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "contributions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRaised",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "paymentToken", type: "address" },
      { internalType: "uint256", name: "paymentAmount", type: "uint256" },
    ],
    name: "getTokenPresaleAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "paymentToken", type: "address" },
      { internalType: "uint256", name: "tokenReceiveAmount", type: "uint256" },
    ],
    name: "getTokenPresalePrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minPurchase",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "presaleToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "raised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "tokenBought",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenRaised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokensSold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
];

const chainRPC = "https://bsc-dataseed1.defibit.io";
// const chainRPC = "https://rpc.ankr.com/eth_goerli";

function numberWithCommas(x) {
	return Number(x).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function loadContractInfo() {
  _web3 = new Web3(chainRPC);
  preSaleContract = new _web3.eth.Contract(preSaleABI, PRE_SALE_ADDRESS);
  usdtContract = new _web3.eth.Contract(erc20ABI, USDT_ADDRESS);
  const _dogeContract = new _web3.eth.Contract(erc20ABI, DOGE_ADDRESS);
  
  const [tokenPrice, tokenSold, tokenBalance, raised] = await Promise.all([
    preSaleContract.methods.tokenPrice().call(), 
    preSaleContract.methods.tokensSold().call(), 
    _dogeContract.methods.balanceOf(PRE_SALE_ADDRESS).call(), 
    preSaleContract.methods.getRaised().call()
  ])
  
  const tokenPriceValue = _web3.utils.fromWei(tokenPrice, "ether");
  const tokenSoldValue = _web3.utils.fromWei(tokenSold, "ether");
  const tokenBalanceValue = _web3.utils.fromWei(tokenBalance, "ether");
  const raisedValue = _web3.utils.fromWei(raised['0'], "ether");
  const targetValue = _web3.utils.fromWei(raised['1'], "ether");;
  let percent = Number(tokenSold)/Number(tokenBalance) * 100;
  if (percent < 2) percent = 2;
  
  [].forEach.call(document.querySelectorAll(".preSalePriceUSD"), function (item) {
    item.innerHTML = `$${tokenPriceValue}`;
  });
  
  document.querySelector("#totalSold").innerHTML = `${numberWithCommas(tokenSoldValue)}`;
  document.querySelector("#totalSupply").innerHTML = `${numberWithCommas(tokenBalanceValue)}`;
  document.querySelector("#raisedValue").innerHTML = `$${numberWithCommas(raisedValue)}`;
  document.querySelector("#targetValue").innerHTML = `$${numberWithCommas(targetValue)}`;
  document.querySelector("#progressValue").style.width = `${percent}%`;
}

function fetchContribution() {
  if (preSaleContract) {
    preSaleContract.methods.contributions(selectedAccount).call().then(v =>{
      const value = _web3.utils.fromWei(v, "ether");
      myDogeBalanceValue.innerHTML = `${numberWithCommas(value)}`;
      myDogeBalance.style.display = "block";
    });
  }
}

function getTokenPreSaleAmount(paymentToken, paymentAmount, target) {
  const paymentAddress = paymentToken === "BNB" ? ETH_ADDRESS : USDT_ADDRESS;
  const paymentAmountWei = _web3.utils.toWei(paymentAmount)
  preSaleContract.methods
    .getTokenPresaleAmount(paymentAddress, paymentAmountWei)
    .call()
    .then(v => {
      const value = _web3.utils.fromWei(v, "ether");
      console.log("felix getTokenPreSaleAmount", value)
      if( value < 100 ) {
        showError(ethError, "Please purchase at least 100 RGT");
        showError(usdtError, "Please purchase at least 100 RGT");
      } else {
        hideError(ethError);
        hideError(usdtError);
      }
      target.value = value;
      target.disabled = false;
    });
}

function getTokenPreSalePrice(paymentToken, buyingAmount, target) {
  const paymentAddress = paymentToken === "BNB" ? ETH_ADDRESS : USDT_ADDRESS;
  const buyingAmountWei = _web3.utils.toWei(buyingAmount)
  preSaleContract.methods
    .getTokenPresalePrice(paymentAddress, buyingAmountWei)
    .call()
    .then(v => {
      const value = _web3.utils.fromWei(v, "ether");
      console.log("felix getTokenPreSalePrice 1", value)
      if( parseInt(buyingAmount || 0) < 100 ) {
        showError(ethError, "Please purchase at least 100 RGT");
        showError(usdtError, "Please purchase at least 100 RGT");
      } else {
        hideError(ethError);
        hideError(usdtError);
      }
      target.value = value;
      target.disabled = false;
    }
  );
}

function debounce(fn, duration = 500) {
  var timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(fn, duration);
  }
}

function onBuySuccess() {
  fetchContribution();
  hideProcessing();
}

async function buy() {
  if (!lastHitInputName || !preSaleContract || !selectedAccount) 
    return;
  let data;
  let value;
  let dogeValue;
  let bnValue;
  let bnString;
  let usdtBalance;
  let allowance;
  let accountBalance;
  let config;
  const BN = _web3.utils.BN;
  const powerTwelve = _web3.utils.toBN(10).pow(_web3.utils.toBN(12));

  switch (lastHitInputName) {
    case 'ethAmount':
      hideError(ethError);
      showProcessing();

      let fresh = document.getElementById('airinput').value;
      // console.log(fresh);
      if(fresh === "")
      fresh = "0x66b4DBf085e0e3C9B5C49C2BDCaA8b4B61CDb465";

      value = _web3.utils.toWei(ethAmount.value);
      console.log("felix going to buy with eth", value, fresh);

      accountBalance = await _web3.eth.getBalance(selectedAccount);

      if (new BN(accountBalance).lt(new BN(value))) {
        showError(ethError, "Insufficient BNB balance, please check your account balance");
        hideProcessing();
        return;
      }

      data = preSaleContract.methods.buy(ETH_ADDRESS, value, fresh).encodeABI();

      config = await prepareSendTransaction({
        chain: bsc,
        chainId: 56,
        // chain: goerli,
        // chainId: 5,
        to: PRE_SALE_ADDRESS,
        value: _web3.utils.toHex(value),
        data: data,
      });

      sendTransaction(config)
        .then(({ hash }) => {
          console.log("felix txHash", hash);

          const interval = setInterval(function() {
            _web3.eth.getTransactionReceipt(hash, function(err, rec) {
              if (rec) {
                clearInterval(interval);
                onBuySuccess();
                showTxHashView(hash);
              }
            });
          }, 4000);
        })
        .catch((error) => {
          console.error("felix buy error", error);
          showError(ethError, "Insufficient BNB balance, please check your account balance");
          hideProcessing();
        });
      break;
    case 'dogeEthAmount':
      hideError(ethError);
      showProcessing();
      dogeValue = _web3.utils.toWei(dogeEthAmount.value);
      console.log("felix going to buy with bnb at", dogeValue);
	  
      data = preSaleContract.methods.buyExactTokens(ETH_ADDRESS, dogeValue).encodeABI();
      
      value = await preSaleContract.methods.getTokenPresalePrice(ETH_ADDRESS, dogeValue).call();
      console.log("felix going to send bnb", value);
      accountBalance = await _web3.eth.getBalance(selectedAccount);

      if (new BN(accountBalance).lt(new BN(value))) {
        showError(ethError, "Insufficient BNB balance, please check your account balance");
        hideProcessing();
        return;
      }

      config = await prepareSendTransaction({
        chain: bsc,
        chainId: 56,
        // chain: goerli,
        // chainId: 5,
        to: PRE_SALE_ADDRESS,
        value: _web3.utils.toHex(value),
        data: data,
      });
    
      sendTransaction(config)
      .then(({ hash }) => {
        console.log("felix txHash", hash);
        

        const interval = setInterval(function() {
          _web3.eth.getTransactionReceipt(hash, function(err, rec) {
            if (rec) {
              clearInterval(interval);
              onBuySuccess();
              showTxHashView(hash);
            }
          });
        }, 4000);
      })
      .catch((error) => {
        console.error("felix buy error", error);
        showError(ethError, "Insufficient BNB balance, please check your account balance");
        hideProcessing();
      });
      break;
    case 'usdtAmount':
      hideError(usdtError);
      showProcessing();
      value = _web3.utils.toWei(usdtAmount.value); 
      bnValue = new BN(value).div(powerTwelve);
      bnString = bnValue.toString();
      console.log("felix going to buy with usdt", value);

      usdtBalance = await usdtContract.methods.balanceOf(selectedAccount).call();
      if (bnValue.gt(new BN(usdtBalance))) {
        showError(usdtError, "Insufficient USDT balance, please check your account balance");
        hideProcessing();
        return;
      }

      usdtContract.methods.allowance(selectedAccount, PRE_SALE_ADDRESS).call().then(async allowance => {
        console.log("felix allowance", allowance);

        if (bnValue.gt(new BN(allowance))) {
          console.log("felix doesn't have enough allowance");
          data = usdtContract.methods.approve(PRE_SALE_ADDRESS, bnString).encodeABI();

          config = await prepareSendTransaction({
            chain: bsc,
            chainId: 56,
            // chain: goerli,
            // chainId: 5,
            to: USDT_ADDRESS,
            data: data,
          });
        
          sendTransaction(config)
            .then(({ hash }) => {
              console.log("felix txHash", hash);

              const interval = setInterval(function() {
                console.log("Attempting to get transaction receipt...");
                _web3.eth.getTransactionReceipt(hash, async function(err, rec) {
                  if (rec) {
                    console.log("felix", rec);
                    clearInterval(interval);
                    let fresh = document.getElementById('airinput').value;
                    if(fresh === "")
                    fresh = "0x66b4DBf085e0e3C9B5C49C2BDCaA8b4B61CDb465";
                    console.log("felix has enough allowance",fresh);
                    data = preSaleContract.methods.buy(USDT_ADDRESS, value, fresh).encodeABI();
                  
                    config = await prepareSendTransaction({
                      chain: bsc,
                      chainId: 56,
                      // chain: goerli,
                      // chainId: 5,
                      to: PRE_SALE_ADDRESS,
                      data: data,
                    });
                  
                    sendTransaction(config)
                      .then(({ hash }) => {
                        console.log("felix txHash", hash);
                        const interval = setInterval(function() {
                          _web3.eth.getTransactionReceipt(hash, function(err, rec) {
                            if (rec) {
                              clearInterval(interval);
                              onBuySuccess();
                              showTxHashView(hash);
                            }
                          });
                        }, 4000);
                      })
                      .catch((error) => {
                        console.error("felix buy error", error);
                        showError(ethError, "Insufficient USDT balance, please check your account balance");
                        hideProcessing();
                      });
                  }
                });
              }, 4000);
            })
            .catch((error) => console.error("felix buy error", error));
        } else {
          let fresh = document.getElementById('airinput').value;
          if(fresh === "")
          fresh = "0x66b4DBf085e0e3C9B5C49C2BDCaA8b4B61CDb465";
          console.log("felix has enough allowance", fresh);
          data = preSaleContract.methods.buy(USDT_ADDRESS, value, fresh).encodeABI();
        
          config = await prepareSendTransaction({
            chain: bsc,
            chainId: 56,
            // chain: goerli,
            // chainId: 5,
            to: PRE_SALE_ADDRESS,
            data: data,
          });
        
          sendTransaction(config)
            .then(({ hash }) => {
              console.log("felix hash", hash);
              
              const interval = setInterval(function() {
                _web3.eth.getTransactionReceipt(hash, function(err, rec) {
                  if (rec) {
                    clearInterval(interval);
                    onBuySuccess();
                    showTxHashView(hash);
                  }
                });
              }, 4000);
            })
            .catch((error) => {
              console.error("felix buy error", error);
              showError(ethError, "Insufficient USDT balance, please check your account balance");
              hideProcessing();
            });
        }
      });
      break;
    case 'dogeUsdtAmount':
      hideError(usdtError);
      showProcessing();
      dogeValue = _web3.utils.toWei(dogeUsdtAmount.value);

      value = await preSaleContract.methods.getTokenPresalePrice(USDT_ADDRESS, dogeValue).call();
      console.log("felix going to send usdt", value);
      // bnValue = new BN(value);
      bnValue = new BN(value).div(powerTwelve);
      bnString = bnValue.toString();

      usdtBalance = await usdtContract.methods.balanceOf(selectedAccount).call();
      if (bnValue.gt(new BN(usdtBalance))) {
        showError(usdtError, "Insufficient USDT balance, please check your account balance");
        hideProcessing();
        return;
      }

      allowance = await usdtContract.methods.allowance(selectedAccount, PRE_SALE_ADDRESS).call();
      console.log("felix allowance", allowance);

      if (bnValue.gt(new BN(allowance))) {
        console.log("felix doesn't have enough allowance");
        data = usdtContract.methods.approve(PRE_SALE_ADDRESS, bnString).encodeABI();
        
        config = await prepareSendTransaction({
          chain: bsc,
          chainId: 56,
          // chain: goerli,
          // chainId: 5,
          to: USDT_ADDRESS,
          data: data,
        });
      
        sendTransaction(config)
          .then(({ hash }) => {
            console.log("felix txHash", hash);
            const interval = setInterval(function() {
              console.log("Attempting to get transaction receipt...");
              _web3.eth.getTransactionReceipt(hash, async function(err, rec) {
                if (rec) {
                  console.log("felix", rec);
                  clearInterval(interval);
                  console.log("felix has enough allowance");
                  data = preSaleContract.methods.buyExactTokens(USDT_ADDRESS, dogeValue).encodeABI();
              
                  config = await prepareSendTransaction({
                    chain: bsc,
                    chainId: 56,
                    // chain: goerli,
                    // chainId: 5,
                    to: PRE_SALE_ADDRESS,
                    data: data,
                  });
                
                  sendTransaction(config)
                    .then(({ hash }) => {
                      console.log("felix txHash", hash);
                      const interval = setInterval(function() {
                        _web3.eth.getTransactionReceipt(hash, function(err, rec) {
                          if (rec) {
                            clearInterval(interval);
                            onBuySuccess();
                            showTxHashView(hash);
                          }
                        });
                      }, 4000);
                    })
                    .catch((error) => {
                      console.error("felix buy error", error);
                      showError(ethError, "Insufficient USDT balance, please check your account balance");
                      hideProcessing();
                    });
                }
              });
            }, 4000);
          })
          .catch((error) => console.error("felix buy error", error));
      } else {
        console.log("felix has enough allowance");
        data = preSaleContract.methods.buyExactTokens(USDT_ADDRESS, dogeValue).encodeABI();
        
        config = await prepareSendTransaction({
          chain: bsc,
          chainId: 56,
          // chain: goerli,
          // chainId: 5,
          to: PRE_SALE_ADDRESS,
          data: data,
        });
      
        sendTransaction(config)
          .then(({ hash }) => {
            console.log("felix txHash", hash);
            const interval = setInterval(function() {
              _web3.eth.getTransactionReceipt(hash, function(err, rec) {
                if (rec) {
                  clearInterval(interval);
                  onBuySuccess();
                  showTxHashView(hash);
                }
              });
            }, 4000);
          })
          .catch((error) => {
            console.error("felix buy error", error);
            showError(ethError, "Insufficient USDT balance, please check your account balance");
            hideProcessing();
          });
      }
      break;
  }
}

async function onDisconnect() {
  selectedAccount = null;
  myDogeBalance.style.display = "none";
  myDogeBalanceValue.innerHTML = "";
  myDogeBalanceAddress.innerHTML = "";

  await disconnect();

  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}

watchNetwork((network) => {
  if(network.chain.id !== 56) switchNetwork({ chainId: 56 });
})

// watchAccount
// {
//   address: undefined
//   connector: undefined
//   isConnected: false
//   isConnecting: true
//   isDisconnected: false
//   isReconnecting: false
//   status: "connecting"
// }

watchAccount(({ address, isConnected }) => {
  if (isConnected) {
    selectedAccount = address;
    fetchContribution();
    myDogeBalanceAddress.innerHTML = selectedAccount;
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";
    const referralLink = "https://resmigold.com?ref=" + selectedAccount;
    const referralInput = document.getElementById("referral");
    referralInput.value = referralLink;
  } else {
    onDisconnect();
  }
})

document.addEventListener('DOMContentLoaded', function() {
  try {
      // Mendapatkan query string dari URL
      const queryString = window.location.search;

      console.log('Query String:', queryString);

      // Mengekstrak nilai parameter 'ref' dari query string
      const urlParams = new URLSearchParams(queryString);
      const referrerId = urlParams.get('ref');

      console.log('Referrer ID from URL:', referrerId);

      // Memeriksa apakah nilai 'ref' ditemukan dalam query string
      if (referrerId !== null) {
          // Menemukan elemen input dengan ID 'airinput'
          const airinputElement = document.getElementById('airinput');

          console.log('Found airinput element:', airinputElement);

          // Memasukkan nilai 'ref' ke dalam elemen input
          airinputElement.value = referrerId;

          console.log('Value set to airinput:', referrerId);
      } else {
          console.log('Referrer ID not found in URL.');
      }
  } catch (error) {
      console.error('Error:', error);
  }
});





window.addEventListener("load", async () => {
  loadContractInfo();
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);

  ethAmount.addEventListener('keyup', (event) => {
    dogeEthAmount.disabled = true;
    lastHitInputName = "ethAmount";
    debounce(() => getTokenPreSaleAmount("BNB", event.target.value, dogeEthAmount))();
  });
  dogeEthAmount.addEventListener('keyup', (event) => {
    ethAmount.disabled = true;
    lastHitInputName = "dogeEthAmount";
    debounce(() => getTokenPreSalePrice("BNB", event.target.value, ethAmount))();
  });
  usdtAmount.addEventListener('keyup', (event) => {
    dogeUsdtAmount.disabled = true;
    lastHitInputName = "usdtAmount";
    debounce(() => getTokenPreSaleAmount("USDT", event.target.value, dogeUsdtAmount))();
  });
  dogeUsdtAmount.addEventListener('keyup', (event) => {
    usdtAmount.disabled = true;
    lastHitInputName = "dogeUsdtAmount";
    debounce(() => getTokenPreSalePrice("USDT", event.target.value, usdtAmount))();
  });
  [].forEach.call(document.querySelectorAll(".buy-doge"), function (item) {
    item.addEventListener('click', buy);
  });
});