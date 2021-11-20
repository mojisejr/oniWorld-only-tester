import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect, useState } from "react";
import { abi, address } from "./smartcontract/oni";

function OniTestRound1() {
  //round state
  const maxLevel1Count = 2;
  const [ethereum, setEthereum] = useState();
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const [canTestOni, setCanTestOni] = useState();

  async function connect() {
    const provider = detectEthereumProvider();
    if (provider) {
      const web3 = new Web3(provider);
      const contract = new web3.eth.Contract(abi, address);
      setContract(contract);
      setEthereum(provider);
    }
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    if (!(await isTestOpen())) {
      alert("Testing is not open yet. please wait.");
    }
  }

  async function isTestOpen() {
    return await contract.methods.is_test_open().call();
  }

  async function fetchAllOni() {
    const oniInWallet = await contract.methods.balanceOf(account).call();
    let fetchedOni = [];
    //fetch tokenIds from wallet
    for (let i = 0; i < +oniInWallet; i++) {
      fetchOni.push(
        +(await contract.methods.tokenOfOwnerByIndex(account, i).call())
      );
    }
    await getAvailableOni(fetchedOni);
  }

  async function getAvailableOni(oni) {
    let validOni = [];
    if (!oni) {
      throw new Error("getAvailableOni: cannot provide 0 oni");
    }
    for (let i = 0; i < oni.length; i++) {
      const oniLevel = await contract.methods.oni(i).call();
      if (+oniLevel != 0) {
        validOni.push(oni[i]);
      }
    }
    setCanTestOni(oni);
  }

  async function Test(oniArray) {
    if (oniArray.length < 0) {
      throw new Error("cannot provide 0 oni in to the test.");
    }
    await contract.methods
      .oniTest(oniArray)
      .send({ from: account })
      .catch(() => {
        alert("cannot enter the test, something went wrong");
      });
  }

  return (
    <div>
      <button onClick={connect}>Connect wallet</button>
      <button onClick={isTestOpen}>IsTestOpen</button>
      <button onClick={fetchAllOni}>Fetch Oni</button>
      <button onClick={Test}>Test</button>
    </div>
  );
}

export default OniTestRound1;
