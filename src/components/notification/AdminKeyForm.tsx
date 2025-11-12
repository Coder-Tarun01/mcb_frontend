{showKeyInput ? (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Admin Access</h2>
          <form onSubmit={handleAdminKeySubmit} className={styles.form}>
            <input
              type="text"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              placeholder="Enter Admin Key"
              className={styles.textInput}
              autoFocus
            />
            <button type="submit" className={styles.button}>
              Access Dashboard
            </button>
          </form>
          {errorMessage && (
            <div className={styles.messageError}>
              {errorMessage}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Rest of your dashboard content */}
          <div className={styles.actionsRow}>
            <button onClick={handleClearAdminKey} className={styles.buttonMuted}>
              Reset Admin Key
            </button>
          </div>
          {/* Your existing dashboard sections */}
        </>
      )}