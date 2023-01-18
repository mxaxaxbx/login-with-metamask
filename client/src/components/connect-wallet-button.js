import styles from '../styles/connect-wallet.module.csss';

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
                <button onclick={onPressConnect} className={styles["connect-wallet"]}>
                    Connect wallet
                </button>
            )}
        </div>
    );
}

export default ConnectWalletButton;
