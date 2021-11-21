import styles from "../../styles/oniTest.module.css";
function ResultBox({ loading, passedOni }) {
  return (
    <div className="result-box">
      {passedOni.length > 0 ? (
        <>
          <h2>Oni who passed this test</h2>
          {loading ? (
            <div className={styles.loading}>Loading..</div>
          ) : (
            <ul>
              {passedOni.map((oni) => (
                <li key={oni}>Token #{oni}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ResultBox;
