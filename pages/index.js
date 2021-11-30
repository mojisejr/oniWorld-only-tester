import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  //ตรงนี้จะใช้สำหรับดึงเอาข้อมูลจาก url ของเรามาครับ
  const router = useRouter();
  //ตัวอย่างเช่น ถ้าเราจะให้ url = oniworld.fun/?refToken=1
  //จะได้ว่า
  const refToken = router.query.refToken;
  //ตรงนี้ refToken จะ = 1

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
