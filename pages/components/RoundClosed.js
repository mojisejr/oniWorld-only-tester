import styles from "../../styles/oniTest.module.css";
import Link from "next/link";
function RoundClosed({ currentRound, round }) {
  return (
    <div className={styles.notOpenContainer}>
      <div className={styles.notOpenContent}>
        <h1>
          Round {currentRound} is opening, You are currently in round {round}{" "}
          page.
        </h1>
        <Link href="/">
          <span className={styles.btnConnect}>Go Back</span>
        </Link>
      </div>
    </div>
  );
}

export default RoundClosed;
