import styles from "../../styles/oniTest.module.css";
import Link from "next/link";

function WalletConnectHeader({ connect, account }) {
  return (
    <div className={styles.Header}>
      <button onClick={connect} className={styles.btnConnect}>
        {account ? `Connected to : ${account}` : "Connect Wallet"}
      </button>
      <Link href="/">
        <span className={styles.btnConnect}>Back</span>
      </Link>
    </div>
  );
}

export default WalletConnectHeader;
