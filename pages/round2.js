import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect, useState, useReducer } from "react";
import { abi, address } from "./smartcontract/oni";
import Link from "next/link";
import styles from "../styles/oniTest.module.css";

function OniTestRound2() {
  //round state
  const round = 2;
  const [enabled, setEnabled] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const [web3, setWeb3] = useState();
  const [level0Oni, setLevel1Oni] = useState([]);
  const [level2Oni, setLevel2Oni] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, isLoading] = useState(false);
  const [testing, isTesting] = useState(false);
  const [state, dispatch] = useReducer(oniSelectionReducer, {
    token1: null,
    token2: null,
    token3: null,
    token4: null,
  });

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

  //check round
  useEffect(() => {
    if (contract) {
      isRound2();
    }
  }, [contract]);

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

  //token selecting state reducer
  function oniSelectionReducer(state, action) {
    switch (action.type) {
      case "token1":
        return { ...state, token1: action.updateToken };
      case "token2":
        return { ...state, token2: action.updateToken };
      case "token3":
        return { ...state, token3: action.updateToken };
      case "token4":
        return { ...state, token4: action.updateToken };
      default:
        return { ...state };
    }
  }

  //check if test is opening
  async function isTestOpen() {
    return await contract.methods.is_test_open().call();
  }

  //check currentRound
  async function isRound2() {
    const result = await contract.methods.currentRound().call();
    if (result == round) {
      setCurrentRound(result);
      setEnabled(true);
    } else {
      setCurrentRound(result);
      setEnabled(false);
    }
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
    let level0Oni = [];
    let level2Oni = [];
    let passedOni = [];
    if (!oni) {
      throw new Error("getAvailableOni: cannot provide 0 oni");
    }
    for (let i = 0; i < oni.length; i++) {
      const oniLevel = await contract.methods.oni(i + 1).call();
      if (+oniLevel === 0) {
        level0Oni.push(oni[i]);
      } else if (+oniLevel === 2) {
        level2Oni.push(oni[i]);
      } else if (+oniLevel === 3) {
        passedOni.push(oni[i]);
      } else {
        continue;
      }
    }
    setLevel1Oni(level0Oni);
    setLevel2Oni(level2Oni);
    setPassedOni(passedOni);
  }

  //testing function that interact with smart contract
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
    tokenArray = Object.values(state).filter((oni) => oni != null);
    if (!(await isTestOpen())) {
      alert("Testing is closed");
    } else {
      if (tokenArray.length > 0) {
        await Test(tokenArray);
      } else {
        alert("please provide all available tokens.");
      }
    }
  }

  //single token provided testing function
  async function enterSingleTesting() {
    if (!(await isTestOpen())) {
      alert("Testing is closed");
    } else {
      state.token1 ? await Test(state.token1) : alert("token1 is null");
    }
  }

  //fourTokenComponent
  function fourTokenProvider() {
    if (level0Oni.length > 0) {
      return (
        <div className={styles.multiTokenBox}>
          <select
            className={styles.oniSelector}
            onChange={(e) =>
              dispatch({ type: "token1", updateToken: e.target.value })
            }
          >
            <option>select first token (level 0)</option>
            {level0Oni
              .filter(
                (oni) => oni != (state.token2 || state.token3 || state.token4)
              )
              .map((oni) => (
                <option value={oni} key={oni}>
                  token ID: #{oni}
                </option>
              ))}
          </select>
          <select
            className={styles.oniSelector}
            onChange={(e) =>
              dispatch({ type: "token2", updateToken: e.target.value })
            }
          >
            <option>select second token (level 0)</option>
            {level0Oni
              .filter(
                (oni) => oni != (state.token1 || state.token3 || state.token4)
              )
              .map((oni) => (
                <option key={oni} value={oni}>
                  token ID: #{oni}
                </option>
              ))}
          </select>
          <select
            className={styles.oniSelector}
            onChange={(e) =>
              dispatch({ type: "update", updateToken: e.target.value })
            }
          >
            <option>select third token (level 0)</option>
            {level2Oni
              .filter(
                (oni) => oni != (state.token1 || state.token2 || state.token4)
              )
              .map((oni) => (
                <option key={oni} value={oni}>
                  token ID: #{oni}
                </option>
              ))}
          </select>
          <select
            className={styles.oniSelector}
            onChange={(e) =>
              dispatch({ type: "update", updateToken: e.target.value })
            }
          >
            <option>select fourth token (level 0)</option>
            {level0Oni
              .filter(
                (oni) => oni != (state.token1 || state.token2 || state.token3)
              )
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

  //twoTokenComponent
  function twoTokenProvider() {
    if (level2Oni.length > 0) {
      return (
        <div className={styles.multiTokenBox}>
          <select
            className={styles.oniSelector}
            onChange={(e) =>
              dispatch({ type: "token1", updateToken: e.target.value })
            }
          >
            <option>select first token (level 2)</option>
            {level2Oni
              .filter((oni) => oni != state.token2)
              .map((oni) => (
                <option key={oni} value={oni}>
                  token ID: #{oni}
                </option>
              ))}
          </select>
          <select
            className={styles.oniSelector}
            onChange={(e) =>
              dispatch({ type: "token2", updateToken: e.target.value })
            }
          >
            <option>select second token (level 2)</option>
            {level2Oni
              .filter((oni) => oni != state.token1)
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
  function singleTokenProvider(level) {
    let canTestOni = level === 0 ? level0Oni : level2Oni;
    if (canTestOni.length > 0) {
      return (
        <div className={styles.singleTokenBox}>
          <select
            className={styles.oniSelector}
            onChange={(e) => setSelectedOni({ token1: e.target.value })}
          >
            <option>select token (level: {level})</option>
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
  function TestingMainComponent() {
    return (
      <div className={styles.container}>
        <button onClick={connect} className={styles.btnConnect}>
          {account ? `connected to : ${account}` : "Connect Wallet"}
        </button>
        <div className={styles.testBox}>
          <div className={styles.tokenProvidingBox}>
            <div className="multi-token-box">
              <h1>Multi-Oni Level: 2</h1>
              {loading ? (
                <h3 className={styles.loading}>loading..</h3>
              ) : (
                twoTokenProvider()
              )}
            </div>
          </div>
          <div className={styles.tokenProvidingBox}>
            <div className="single-token-box">
              <h1>Single-Oni : Level 2</h1>
              {loading ? (
                <h3 className={styles.loading}>loading..</h3>
              ) : (
                singleTokenProvider(2)
              )}
            </div>
          </div>
        </div>
        <div className={styles.testBox}>
          <div className={styles.tokenProvidingBox}>
            <div className="multi-token-box">
              <h1>Multi-Oni Level: 0</h1>
              {loading ? (
                <h3 className={styles.loading}>loading..</h3>
              ) : (
                fourTokenProvider()
              )}
            </div>
          </div>
          <div className={styles.tokenProvidingBox}>
            <div className="single-token-box">
              <h1>Single-Oni : Level 0</h1>
              {loading ? (
                <h3 className={styles.loading}>loading..</h3>
              ) : (
                singleTokenProvider(0)
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
  return (
    <div>
      {enabled ? (
        TestingMainComponent()
      ) : (
        <div className={styles.notOpenContainer}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1>
              Round {currentRound} is opening, Round {round} will be open very
              soon.
            </h1>
            <Link href="/">
              <span className={styles.btnConnect}>Go Back</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default OniTestRound2;
