import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contract_addr } from "./constants.js";

const connectButton = document.getElementById("connect_button");
const fundButton = document.getElementById("fund_button");
const balanceButton = document.getElementById("balance_button");
const withButton = document.getElementById("withdraw_button");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    connectButton.innerHTML = "Connected!!";
  } else {
    connectButton.innerHTML = "please install metamask extension";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmt").value;

  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contract_addr, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    fundButton.innerHTML = "Modda Gudu";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contract_addr);
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
// withdraw function
async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contract_addr, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error);
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask";
  }
}
