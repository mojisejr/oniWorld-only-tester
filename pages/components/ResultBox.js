import styles from "../../styles/oniTest.module.css";
import { ContractState } from "../hooks/OniContract";
function ResultBox({ loading, passedOni }) {
  return (
    <div className="result-box">
      {passedOni.length > 0 ? (
        <>
          <h2>Oni who passed this test</h2>
          {loading == ContractState.LOADING ? (
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
