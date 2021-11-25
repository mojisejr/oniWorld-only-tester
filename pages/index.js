import Link from "next/link";

export default function Home() {
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
    </div>
  );
}
