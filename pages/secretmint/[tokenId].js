import { useRouter } from "next/router";
import { useEffect, useReducer } from "react";
import { useWallet, WalletState } from "../../hooks/WalletConnect";
import { useContract, ContractState } from "../../hooks/OniContract";
import WalletConnectHeader from "../components/WalletConnectHeader";
import styles from "../../styles/oniTest.module.css";

function SecretMint() {
  const MINT_STATUS = {
    WAIT: "WAIT",
    MINTING: "MINTING",
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
  };
  const SECRET_ACTION = {
    updateTokenOwner: "update_inviter",
    updateMinter: "update_invited",
    updateTokenId: "update_tokenId",
    updateMintStatus: "update_mint_status",
  };
  const SecretMintInitialState = {
    tokenOwner: null,
    minter: null,
    tokenId: null,
    mintStatus: MINT_STATUS.WAIT,
  };

  const [state, dispatch] = useReducer(reducer, SecretMintInitialState);
  const router = useRouter();

  function reducer(state, action) {
    switch (action.type) {
      case SECRET_ACTION.updateTokenOwner: {
        return { ...state, tokenOwner: action.tokenOwner };
      }
      case SECRET_ACTION.updateMinter: {
        return { ...state, minter: action.minter };
      }
      case SECRET_ACTION.updateTokenId: {
        return { ...state, tokenId: action.tokenId };
      }
      case SECRET_ACTION.updateMintStatus: {
        return { ...state, mintStatus: action.mintStatus };
      }
    }
  }

  const { web3, account, connect, checkProvider, walletState } = useWallet();
  //smart contract
  const { init, contractState, ownerOf, mintBigTeam, mintSmallTeam, getPrice } =
    useContract();

  function updateMinter(minterAddress) {
    dispatch({ type: SECRET_ACTION.updateMinter, minter: minterAddress });
  }

  async function updateTokenOwner(tokenId) {
    //check if token has owner ?
    const ownerAddress = await ownerOf(tokenId);
    if (!ownerAddress) {
      alert("error this token id has no owner yet!");
    }
    dispatch({
      type: SECRET_ACTION.updateTokenOwner,
      tokenOwner: ownerAddress,
    });
    dispatch({
      type: SECRET_ACTION.updateTokenId,
      tokenId: tokenId,
    });
  }

  function updateMintStatus(status) {
    if (!status) {
      throw new Error("Status updating error");
    }
    dispatch({ type: SECRET_ACTION.updateMintStatus, mintStatus: status });
  }

  async function updateTokenOwnerScore() {
    const result = await fetch(`/api/csvReferral`, {
      method: "POST",
      body: JSON.stringify({
        tokenOwner: state.tokenOwner,
        minter: state.minter,
        tokenId: state.tokenId,
        score: 1,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return result;
  }

  // async function checkMinted(account) {
  //   const { result } = await fetch("/api/referral", {
  //     method: "GET",
  //   });
  //   console.log(result);
  // }

  async function initialize() {
    const tokenId = router.query.tokenId;
    updateMinter(account);
    updateTokenOwner(tokenId);
    // await checkMinted(account);
  }

  //check connection, config web3 and init smart contract object.
  useEffect(() => {
    checkProvider();
    walletState == WalletState.READY ? init(web3) : null;
  }, [walletState]);

  useEffect(() => {
    if (contractState == ContractState.READY) {
      if (walletState == WalletState.OK) {
        initialize();
      }
    }
  }, [walletState, contractState]);

  async function buyBigPrice() {
    try {
      if (router.query.tokenId !== undefined) {
        updateMintStatus(MINT_STATUS.MINTING);
        const result = await mintBigTeam(account);
        if (result === true) {
          const { result } = await updateTokenOwnerScore();
          if (result === true) {
            updateMintStatus(MINT_STATUS.SUCCESS);
          } else {
            updateMintStatus(MINT_STATUS.FAILURE);
          }
        } else {
          updateMintStatus(MINT_STATUS.FAILURE);
        }
      }
    } catch (e) {
      updateMintStatus(MINT_STATUS.FAILURE);
    }
  }

  async function buySmallPrice() {
    try {
      if (router.query.tokenId !== undefined) {
        updateMintStatus(MINT_STATUS.MINTING);
        const result = await mintSmallTeam(account);
        if (result === true) {
          const { result } = await updateTokenOwnerScore();
          if (result === true) {
            updateMintStatus(MINT_STATUS.SUCCESS);
          } else {
            updateMintStatus(MINT_STATUS.FAILURE);
          }
        } else {
          updateMintStatus(MINT_STATUS.FAILURE);
        }
      }
    } catch (e) {
      updateMintStatus(MINT_STATUS.FAILURE);
    }
  }

  return (
    <div className={styles.container}>
      <WalletConnectHeader connect={connect} account={account} />
      <div
        style={{
          marginTop: "30px",
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid gray",
          borderRadius: "10px",
        }}
      >
        <h1>Referral Program</h1>
        <h3>minter: {state.minter}</h3>
        <h3>tokenOwner: {state.tokenOwner}</h3>
        <h3>tokenId: {state.tokenId}</h3>
        <h3>minting status: {state.mintStatus}</h3>
      </div>

      {walletState === WalletState.OK ? (
        <div>
          {state.mintStatus === MINT_STATUS.MINTING ? (
            <h1>Minting...</h1>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <button
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
                onClick={buyBigPrice}
              >
                bigTeam
              </button>
              <button
                style={{ marginBottom: "10px", padding: "10px" }}
                onClick={buySmallPrice}
              >
                smallTeam
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SecretMint;
