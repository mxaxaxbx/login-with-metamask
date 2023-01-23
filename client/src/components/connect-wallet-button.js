import styles from '../styles/connect-wallet.module.css';

const ConnectWalletButton = ({
    onPressLogout,
    onPressConnect,
    loading,
    address
}) => {
    return (
        <div>
            {address && !loading ? (
                <button onClick={onPressLogout} className={styles['connect-wallet']}>
                    Disconnect
                </button>
            ) : loading ? (
                <button
                    className={`${styles["connect-wallet"]} ${styles["connect-button-loading"]}`}
                    disabled
                >
                    <div> Loading... </div>
                </button>
            ) : (
                <button onClick={onPressConnect} className={styles["connect-wallet"]}>
                    Connect wallet
                </button>
            )}
        </div>
    );
}

export default ConnectWalletButton;
