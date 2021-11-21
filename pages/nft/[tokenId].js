import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { abi, address } from "../smartcontract/oni";
import Web3 from "web3";

function OniProfile() {
  const { query } = useRouter();
  const [contract, setContract] = useState();
  const [tokenURI, setTokenURI] = useState();

  async function initialize() {
    const { ethereum } = window;
    const web3 = new Web3(ethereum);
    setContract(new web3.eth.Contract(abi, address));
  }

  async function getTokenURI() {
    //tokenURI from smart contract doesn't work, using mocked to test.
    const jsonURL = await contract.methods.tokenURI(query.tokenId).call();
    const response = await fetch(
      `https://ipfs.io/ipfs/QmYrfA72SNSGFjva5UxmNMhF2qHx9kFbcCBgcJMsi1354s/${query.tokenId}.json`
    );
    const { image } = await response.json();
    setTokenURI(image);
  }

  useEffect(() => {
    if (query.tokenId) {
      initialize();
    }
  }, [query]);

  useEffect(() => {
    if (contract) {
      getTokenURI();
    }
  }, [contract]);
  return (
    <div>
      <h1>Oni #{query.tokenId}</h1>

      {tokenURI ? (
        <div>
          <img
            src={tokenURI}
            alt={query.tokenId}
            width={350}
            height={350}
          ></img>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default OniProfile;
