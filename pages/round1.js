import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect, useState } from "react";
import { abi, address } from "./smartcontract/oni";
import styles from "../styles/oniTest.module.css";

function OniTestRound1() {
  //round state
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const [web3, setWeb3] = useState();
  const [canTestOni, setCanTestOni] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, isLoading] = useState(false);
  const [token1, setToken1] = useState();
  const [token2, setToken2] = useState();
  const [result, setResult] = useState(false);

  useEffect(() => {
    if (!account || !contract || !web3) {
      const web3 = new Web3(ethereum);
      const contract = new web3.eth.Contract(abi, address);
      setConnected(false);
      setWeb3(web3);
      setContract(contract);
      console.log("Please Connect wallet.");
    } else {
      setConnected(true);
    }
    if (connected) {
      fetchAllOni();
    }
  }, [connected]);

  async function connect() {
    try {
      const ethereum = await detectEthereumProvider();
      if (!ethereum) {
        return;
      }
      ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
        }
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  async function isTestOpen() {
    return await contract.methods.is_test_open().call();
  }

  async function fetchAllOni() {
    isLoading(true);
    const oniInWallet = await contract.methods.balanceOf(account).call();
    let fetchedOni = [];
    //fetch tokenIds from wallet
    for (let i = 0; i < +oniInWallet; i++) {
      fetchedOni.push(
        +(await contract.methods.tokenOfOwnerByIndex(account, i).call())
      );
    }
    await getAvailableOni(fetchedOni);
    isLoading(false);
  }

  async function getAvailableOni(oni) {
    let validOni = [];
    if (!oni) {
      throw new Error("getAvailableOni: cannot provide 0 oni");
    }
    for (let i = 0; i < oni.length; i++) {
      const oniLevel = await contract.methods.oni(i).call();
      if (+oniLevel == 0) {
        validOni.push(oni[i]);
      }
    }
    setCanTestOni(validOni);
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

  async function enterMultiTesting() {
    const tokenArray = [token1, token2];
    if (!(await isTestOpen())) {
      alert("Testing is closed");
    } else {
      await Test(tokenArray);
    }
  }

  async function enterSingleTesting() {
    if (!(await isTestOpen())) {
      alert("Testing is closed");
    } else {
      await Test(tokenArray);
    }
  }

  function twoTokenProvider() {
    if (canTestOni.length > 0) {
      return (
        <div>
          <select
            className="token-1"
            onChange={(e) => setToken1(e.target.value)}
          >
            <option>select first token</option>
            {canTestOni
              .filter((oni) => oni != token2)
              .map((oni) => (
                <option value={oni} key={oni}>
                  token ID: #{oni}
                </option>
              ))}
          </select>
          <select
            className="token-2"
            onChange={(e) => setToken2(e.target.value)}
          >
            <option>select second token</option>
            {canTestOni
              .filter((oni) => oni != token1)
              .map((oni) => (
                <option key={oni} value={oni}>
                  token ID: #{oni}
                </option>
              ))}
          </select>
          <button onClick={enterMultiTesting}>GO!</button>
        </div>
      );
    } else {
      return <div>no Oni in your account</div>;
    }
  }

  function singleTokenProvider() {
    if (canTestOni.length > 0) {
      return (
        <div>
          <select
            className="token-1"
            onChange={(e) => setToken1(e.target.value)}
          >
            <option>select token</option>
            {canTestOni.map((oni) => (
              <option value={oni} key={oni}>
                token ID: #{oni}
              </option>
            ))}
          </select>
          <button onClick={enterSingleTesting}>GO!</button>
        </div>
      );
    }
  }

  return (
    <div>
      <button onClick={connect}>Connect wallet</button>
      <div className={styles.tokenProvidingBox}>
        <div className="multi-token-box">
          {loading ? <div>loading..</div> : twoTokenProvider()}
        </div>
        <div className="single-token-box">
          {loading ? <div>loading..</div> : singleTokenProvider()}
        </div>
      </div>
    </div>
  );
}

export default OniTestRound1;
