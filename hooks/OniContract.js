import { useState } from "react";
import { abi, address } from "../smartcontract/oni";

export const ContractState = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  IDLE: "idle",
  READY: "ready",
};

export function useContract() {
  const [contract, setContract] = useState();
  const [contractState, setContractState] = useState(ContractState.IDLE);
  const [web3, setWeb3] = useState(null);

  async function init(web3) {
    const contract = new web3.eth.Contract(abi, address);
    setWeb3(web3);
    setContract(contract);
    setContractState(ContractState.READY);
  }

  async function getPrice() {
    const smallPrice = await contract.methods.NFT_small_price().call();
    const bigPrice = await contract.methods.NFT_big_price().call();

    return {
      smallPrice,
      bigPrice,
    };
  }

  async function mintBigTeam(minter) {
    const { bigPrice } = await getPrice();
    const tx = await contract.methods.bigTeam().send({
      from: minter,
      value: web3.utils.toWei(bigPrice.toString(), "wei"),
    });
    return tx.status;
  }

  async function mintSmallTeam(minter) {
    const { smallPrice } = await getPrice();
    const tx = await contract.methods.smallTeam().send({
      from: minter,
      value: web3.utils.toWei(smallPrice.toString(), "wei"),
    });
    return tx.status;
  }

  async function isTestOpen() {
    return await contract.methods.is_test_open().call();
  }

  async function getCurrentRound() {
    return await contract.methods.currentRound().call();
  }

  async function balanceOf(account) {
    return await contract.methods.balanceOf(account).call();
  }

  async function tokenOfOwnerByIndex(account, i) {
    return await contract.methods.tokenOfOwnerByIndex(account, i).call();
  }

  async function fetchAllOniOf(account) {
    const oniInWallet = await balanceOf(account);
    let fetchedOni = [];
    //fetch tokenIds from wallet
    for (let i = 0; i < +oniInWallet; i++) {
      fetchedOni.push(+(await tokenOfOwnerByIndex(account, i)));
    }
    return fetchedOni;
  }

  async function ownerOf(tokenId) {
    return await contract.methods.ownerOf(tokenId).call();
  }

  async function getAllOniByLevel(oni) {
    let level0Oni = [];
    let level1Oni = [];
    let level2Oni = [];
    let level3Oni = [];
    let level4Oni = [];

    if (!oni) {
      throw new Error("getAvailableOni: cannot provide 0 oni");
    }
    for (let i = 0; i < oni.length; i++) {
      const oniLevel = +(await contract.methods.oni(oni[i]).call());
      switch (oniLevel) {
        case 0:
          level0Oni.push(oni[i]);
          break;
        case 1:
          level1Oni.push(oni[i]);
          break;
        case 2:
          level2Oni.push(oni[i]);
          break;
        case 3:
          level3Oni.push(oni[i]);
          break;
        case 4:
          level4Oni.push(oni[i]);
          break;
        default:
          break;
      }
    }
    return {
      level0Oni,
      level1Oni,
      level2Oni,
      level3Oni,
      level4Oni,
    };
  }

  async function onTest(account, input) {
    await contract.methods.oniTest(input).send({ from: account });
  }

  async function Test(oniArray, account) {
    if (oniArray.length < 0) {
      throw new Error("Test: cannot provide 0 oni in to the test.");
    }
    const input = Array.isArray(oniArray) ? oniArray : new Array(oniArray);
    try {
      await onTest(account, input);
    } catch (e) {
      alert("Testing Function Error: ", e.message);
      setContractState(ContractState.ERROR);
    }
  }

  return {
    init,
    getPrice,
    isTestOpen,
    getCurrentRound,
    balanceOf,
    getAllOniByLevel,
    fetchAllOniOf,
    onTest,
    Test,
    contractState,
    setContractState,
    ownerOf,
    mintBigTeam,
    mintSmallTeam,
  };
}
