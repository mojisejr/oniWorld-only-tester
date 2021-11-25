import styles from "../../styles/oniTest.module.css";
import { ContractState } from "../../hooks/OniContract";
function TestingInputBox({ children, title, loading }) {
  return (
    <div className={styles.tokenProvidingBox}>
      <div className="multi-token-box">
        <h1>{title}</h1>
        {loading == ContractState.LOADING ? (
          <h3 className={styles.loading}>loading..</h3>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default TestingInputBox;
