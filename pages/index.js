import OniTestRound1 from "./round1";
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
      <Link href="/round1">Round1</Link>
      <Link href="/round2">Round2</Link>
      <Link href="/round3">Round3</Link>
    </div>
  );
}
