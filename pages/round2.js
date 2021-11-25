import { useEffect, useState, useReducer } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/oniTest.module.css";
import NoOni from "./components/NoOni";
import RoundClosed from "./components/RoundClosed";
import ResultBox from "./components/ResultBox";
import TestingInputBox from "./components/TestingInputBox";
import { useWallet, WalletState } from "../hooks/WalletConnect";
import { useContract, ContractState } from "../hooks/OniContract";

function OniTestRound2() {
  //wallet
  const { web3, account, connect, checkProvider, walletState } = useWallet();
  //smart contract
  const {
    init,
    isTestOpen,
    getCurrentRound,
    getAllOniByLevel,
    fetchAllOniOf,
    Test,
    contractState,
    setContractState,
  } = useContract();
  //round state
  const round = 2;
  const [enabled, setEnabled] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [level0Oni, setLevel0Oni] = useState([]);
  const [level2Oni, setLevel2Oni] = useState([]);
  const [state, dispatch] = useReducer(oniSelectionReducer, {
    token1: null,
    token2: null,
    token3: null,
    token4: null,
  });

  const [passedOni, setPassedOni] = useState([]);

  //check connection, config web3 and init smart contract object.
  useEffect(() => {
    checkProvider();
    if (walletState == WalletState.READY) {
      init(web3);
    }
  }, [walletState]);

  useEffect(() => {
    if (contractState == ContractState.READY) {
      isRound2();
      if (walletState == WalletState.OK) {
        getAvailableOni();
      }
    }
  }, [walletState, contractState]);

  //check round
  async function isRound2() {
    const result = await getCurrentRound();
    if (result == round) {
      setCurrentRound(result);
      setEnabled(true);
    } else {
      setCurrentRound(result);
      setEnabled(false);
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

  //fetch all available Oni of current connected account
  async function getAvailableOni() {
    setContractState(ContractState.LOADING);
    const allOni = await fetchAllOniOf(account);
    const oni = await getAllOniByLevel(allOni);
    setLevel0Oni(oni.level0Oni);
    setLevel2Oni(oni.level2Oni);
    setPassedOni(oni.level3Oni);
    setContractState(ContractState.SUCCESS);
  }

  //multi token provided testing function
  async function enterMultiTesting() {
    let tokenArray = [];
    tokenArray = Object.values(state).filter((oni) => oni != null);
    if (!(await isTestOpen())) {
      alert("MultiTesting: Testing is closed");
    } else {
      if (tokenArray.length > 0) {
        await Test(tokenArray, account);
        await getAvaliableOni();
      } else {
        alert("MultiTesting: Please provide all available tokens.");
      }
    }
  }

  //single token provided testing function
  async function enterSingleTesting() {
    if (!(await isTestOpen())) {
      alert("SingleTesting: Testing is closed");
    } else {
      state.token1
        ? await Test(state.token1, account)
        : alert("SingleTesting: Token1 is null");
      await getAvailableOni();
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
              dispatch({ type: "token3", updateToken: e.target.value })
            }
          >
            <option>select third token (level 0)</option>
            {level0Oni
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
              dispatch({ type: "token4", updateToken: e.target.value })
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
            disabled={contractState == ContractState.SUCCESS ? false : true}
            className={styles.btnGo}
            onClick={enterMultiTesting}
          >
            {contractState == ContractState.SUCCESS ? "GO!" : "Testing.."}
          </button>
        </div>
      );
    } else {
      return <NoOni />;
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
            disabled={contractState == ContractState.SUCCESS ? false : true}
            className={styles.btnGo}
            onClick={enterMultiTesting}
          >
            {contractState == ContractState.SUCCESS ? "GO!" : "Testing.."}
          </button>
        </div>
      );
    } else {
      return <NoOni />;
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
            onChange={(e) =>
              dispatch({ type: "token1", updateToken: e.target.value })
            }
          >
            <option>select token (level: {level})</option>
            {canTestOni.map((oni) => (
              <option value={oni} key={oni}>
                token ID: #{oni}
              </option>
            ))}
          </select>
          <button
            disabled={contractState == ContractState.SUCCESS ? false : true}
            className={styles.btnGo}
            onClick={enterSingleTesting}
          >
            {contractState == ContractState.SUCCESS ? "GO!" : "Testing.."}
          </button>
        </div>
      );
    } else {
      return <NoOni />;
    }
  }

  //main component
  function TestingMainComponent() {
    return (
      <div className={styles.container}>
        <Head>
          <title>Round {round}</title>
        </Head>
        <div className={styles.Header}>
          <button onClick={connect} className={styles.btnConnect}>
            {account ? `connected to : ${account}` : "Connect Wallet"}
          </button>
          <Link href="/">
            <span className={styles.btnConnect}>Back</span>
          </Link>
        </div>
        <div className={styles.testBox}>
          <TestingInputBox title="Multi-Oni : Level 2" loading={contractState}>
            {twoTokenProvider()}
          </TestingInputBox>
          <TestingInputBox title="Single-Oni : Level 2" loading={contractState}>
            {singleTokenProvider(2)}
          </TestingInputBox>
        </div>
        <div className={styles.testBox}>
          <TestingInputBox title="Multi-Oni : Level 0" loading={contractState}>
            {fourTokenProvider()}
          </TestingInputBox>
          <TestingInputBox title="Single-Oni : Level 0" loading={contractState}>
            {singleTokenProvider(0)}
          </TestingInputBox>
        </div>
        <ResultBox loading={contractState} passedOni={passedOni} />
      </div>
    );
  }

  //page renderer can be used if round is open.
  return (
    <div>
      {enabled ? (
        TestingMainComponent()
      ) : (
        <RoundClosed round={round} currentRound={currentRound} />
      )}
    </div>
  );
}

export default OniTestRound2;
