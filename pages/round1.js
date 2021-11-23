import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/oniTest.module.css";
import NoOni from "./components/NoOni";
import RoundClosed from "./components/RoundClosed";
import ResultBox from "./components/ResultBox";
import TestingInputBox from "./components/TestingInputBox";
import { useWallet, WalletState } from "./hooks/WalletConnect";
import { useContract, ContractState } from "./hooks/OniContract";

function OniTestRound1() {
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
  const round = 1;
  const [enabled, setEnabled] = useState(false);
  const [currentRound, setCurrentRound] = useState();
  const [token1, setToken1] = useState(null);
  const [token2, setToken2] = useState(null);
  const [level0Oni, setLevel0Oni] = useState([]);
  const [passedOni, setPassedOni] = useState([]);

  //check connection, config web3 and init smart contract object.
  useEffect(() => {
    checkProvider();
    walletState == WalletState.READY ? init(web3) : null;
  }, [walletState]);

  useEffect(() => {
    if (contractState == ContractState.READY) {
      isRound1();
      if (walletState == WalletState.OK) {
        getAvailableOni();
      }
    }
  }, [walletState, contractState]);

  //check currentRound
  async function isRound1() {
    const result = await getCurrentRound();
    if (result == round) {
      setCurrentRound(result);
      setEnabled(true);
    } else {
      setCurrentRound(result);
      setEnabled(false);
    }
  }

  //fetch all available Oni of current connected account
  async function getAvailableOni() {
    setContractState(ContractState.LOADING);
    const allOni = await fetchAllOniOf(wallet.account);
    const oni = await getAllOniByLevel(allOni);
    setLevel0Oni(oni.level0Oni);
    setPassedOni(oni.level2Oni);
    setContractState(ContractState.SUCCESS);
  }

  //multi token provided testing function
  async function enterMultiTesting() {
    let tokenArray = [];
    if (token1 && token2) {
      tokenArray = [token1, token2];
    }
    if (!(await isTestOpen())) {
      alert("MultiTesting: Testing is closed");
    } else {
      if (tokenArray.length == 2) {
        await Test(tokenArray, account);
        await getAvailableOni();
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
      token1
        ? await Test(token1, account)
        : alert("SingleTesting: Token1 is null");
      await getAvailableOni();
    }
  }

  //twoTokenComponent
  function twoTokenProvider() {
    if (level0Oni.length > 0) {
      return (
        <div className={styles.multiTokenBox}>
          <select
            className={styles.oniSelector}
            onChange={(e) => setToken1(e.target.value)}
          >
            <option>select first token</option>
            {level0Oni
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
            {level0Oni
              .filter((oni) => oni != token1)
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
    let canTestOni = level === 0 ? level0Oni : [];
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

  //main
  function TestingMainComponent() {
    return (
      <div className={styles.container}>
        <div className={styles.Header}>
          <button onClick={connect} className={styles.btnConnect}>
            {account ? `Connected to : ${account}` : "Connect Wallet"}
          </button>
          <Link href="/">
            <span className={styles.btnConnect}>Back</span>
          </Link>
        </div>
        <div className={styles.testBox}>
          <TestingInputBox title="Multi-Oni" loading={contractState}>
            {twoTokenProvider()}
          </TestingInputBox>
          <TestingInputBox title="Single-Oni" loading={contractState}>
            {singleTokenProvider(0)}
          </TestingInputBox>
        </div>
        <ResultBox loading={contractState} passedOni={passedOni} />
      </div>
    );
  }

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

export default OniTestRound1;
