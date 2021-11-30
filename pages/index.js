import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { ref } = router.query;
  async function updateTokenOwnerScore(tokenOwnerAddr, minterAddr, tokenId) {
    const result = await fetch(`/api/csvReferral`, {
      method: "POST",
      body: JSON.stringify({
        tokenOwner: tokenOwnerAddr,
        minter: minterAddr,
        tokenId: tokenId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return result;
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
      }}
    >
      <h1>Oni Test</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        <Link href="/round1">
          <a style={{ padding: "3px" }}>Round1</a>
        </Link>
        <Link href="/round2">
          <a style={{ padding: "3px" }}>Round2</a>
        </Link>
        <Link href="/round3">
          <a style={{ padding: "3px" }}>Round3</a>
        </Link>
      </div>

      <button>Mint test button</button>
    </div>
  );
}
