import styles from "../../styles/oniTest.module.css";
function OniInWallet({ oni = null }) {
  return (
    <div>
      {oni ? (
        <div>
          <h2>Oni in your wallet</h2>
          <div>
            <OniListItem oni={oni.level0Oni} level={"0 (Starter)"} />
            <OniListItem oni={oni.level1Oni} level={"1 (Failure Token)"} />
            <OniListItem oni={oni.level2Oni} level={"2 (Round 1 passed)"} />
            <OniListItem oni={oni.level3Oni} level={"3 (Round 2 passed)"} />
            <OniListItem oni={oni.level4Oni} level={"4 (Roune 3 passed)"} />
          </div>
        </div>
      ) : (
        <div>loading..</div>
      )}
    </div>
  );
}

function OniListItem({ oni = [], level }) {
  return (
    <div className={styles.oniListItem}>
      <div className={styles.oniListItemTitle}>Oni Level {level}</div>
      <div>
        <span className={styles.oniListItemCount}>{oni.length} </span>
        Tokens
      </div>
    </div>
  );
}

export default OniInWallet;
