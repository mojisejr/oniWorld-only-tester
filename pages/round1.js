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
  const [testing, isTesting] = useState(false);
  const [token1, setToken1] = useState(null);
  const [token2, setToken2] = useState(null);
  const [passedOni, setPassedOni] = useState([]);

  //check connection, config web3 and init smart contract object.
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

  //connect with metamask and get connected account.
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

  //check if test is opening
  async function isTestOpen() {
    return await contract.methods.is_test_open().call();
  }

  //fetch all available Oni of current connected account
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

  //sort fetched token to two category [avaliable], [passed]
  async function getAvailableOni(oni) {
    let validOni = [];
    let passedOni = [];
    if (!oni) {
      throw new Error("getAvailableOni: cannot provide 0 oni");
    }
    for (let i = 0; i < oni.length; i++) {
      const oniLevel = await contract.methods.oni(i + 1).call();
      if (+oniLevel == 0) {
        validOni.push(oni[i]);
      } else if (+oniLevel > 1) {
        passedOni.push(oni[i]);
      }
    }

    setCanTestOni(validOni);
    setPassedOni(passedOni);
  }

  async function Test(oniArray) {
    isTesting(true);
    if (oniArray.length < 0) {
      throw new Error("cannot provide 0 oni in to the test.");
    }
    const input = Array.isArray(oniArray) ? oniArray : new Array(oniArray);
    await contract.methods.oniTest(input).send({ from: account });
    await fetchAllOni();
    isTesting(false);
  }

  //multi token provided testing function
  async function enterMultiTesting() {
    let tokenArray = [];
    if (token1 && token2) {
      tokenArray = [token1, token2];
    }
    if (!(await isTestOpen())) {
      alert("Testing is closed");
    } else {
      console.log(tokenArray.length);
      if (tokenArray.length == 2) {
        await Test(tokenArray);
      } else {
        alert("token1 or 2 is not provided");
      }
    }
  }

  //single token provided testing function
  async function enterSingleTesting() {
    if (!(await isTestOpen())) {
      alert("Testing is closed");
    } else {
      token1 ? await Test(token1) : alert("token1 is null");
    }
  }

  //twoTokenComponent
  function twoTokenProvider() {
    if (canTestOni.length > 0) {
      return (
        <div className={styles.multiTokenBox}>
          <select
            className={styles.oniSelector}
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
            className={styles.oniSelector}
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
          <button
            disabled={testing === false ? false : true}
            className={styles.btnGo}
            onClick={enterMultiTesting}
          >
            {testing === false ? "GO!" : "Testing.."}
          </button>
        </div>
      );
    } else {
      return <div>No Oni in your account</div>;
    }
  }

  //single token component
  function singleTokenProvider() {
    if (canTestOni.length > 0) {
      return (
        <div className={styles.singleTokenBox}>
          <select
            className={styles.oniSelector}
            onChange={(e) => setToken1(e.target.value)}
          >
            <option>select token</option>
            {canTestOni.map((oni) => (
              <option value={oni} key={oni}>
                token ID: #{oni}
              </option>
            ))}
          </select>
          <button
            disabled={testing === false ? false : true}
            className={styles.btnGo}
            onClick={enterSingleTesting}
          >
            {testing === false ? "GO!" : "Testing..."}
          </button>
        </div>
      );
    } else {
      return <div>No Oni in your account</div>;
    }
  }

  //main
  return (
    <div className={styles.container}>
      <button onClick={connect} className={styles.btnConnect}>
        Connect wallet
      </button>
      <div className={styles.testBox}>
        <div className={styles.tokenProvidingBox}>
          <div className="multi-token-box">
            <h1>Multi-Oni</h1>
            {loading ? (
              <h3 className={styles.loading}>loading..</h3>
            ) : (
              twoTokenProvider()
            )}
          </div>
        </div>
        <div className={styles.tokenProvidingBox}>
          <div className="single-token-box">
            <h1>Single-Oni</h1>
            {loading ? (
              <h3 className={styles.loading}>loading..</h3>
            ) : (
              singleTokenProvider()
            )}
          </div>
        </div>
      </div>
      <div className="result-box">
        <h2>Oni who passed this test</h2>
        {loading ? (
          <div className={styles.loading}>Loading..</div>
        ) : (
          <ul>
            {passedOni.map((oni) => (
              <li key={oni}>Token #{oni}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default OniTestRound1;
