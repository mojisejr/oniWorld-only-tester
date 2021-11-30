async function updateTokenOwnerScore(
  tokenOwnerAddress,
  minterAddress,
  tokenId
) {
  try {
    await fetch(`/api/referral`, {
      method: "POST",
      body: JSON.stringify({
        tokenOwner: tokenOwnerAddress,
        minter: minterAddress,
        tokenId: tokenId,
        score: 1,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}
