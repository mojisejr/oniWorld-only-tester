import { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

export const WalletState = {
  IDLE: "idle",
  OK: "OK",
  READY: "READY",
  ERROR: "ERROR",
};

export function useWallet() {
  const [walletState, setWalletState] = useState(WalletState.IDLE);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [ethereum, setEthereum] = useState(null);

  async function checkProvider() {
    const provider = await detectEthereumProvider();
    if (provider) {
      if (walletState == WalletState.IDLE) {
        const ethereum = window.ethereum;
        const web3 = new Web3(ethereum);
        setWeb3(web3);
        setEthereum(ethereum);
        setWalletState(WalletState.READY);
      } else if (walletState == WalletState.OK) {
        return;
      }
    } else {
      alert("No Metamask install.");
      setWalletState(WalletState.ERROR);
    }
  }

  async function connect() {
    if (walletState == WalletState.READY) {
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setWalletState(WalletState.OK);
      } catch (e) {
        setWalletState(WalletState.ERROR);
      }
    }
  }

  return {
    web3,
    account,
    connect,
    checkProvider,
    walletState,
  };
}
