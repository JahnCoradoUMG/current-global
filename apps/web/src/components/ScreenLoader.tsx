import styles from "./ScreenLoader.module.css";

export function ScreenLoader() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label="Cargando">
      <div className={styles.ring} />
    </div>
  );
}
