// Tampilan satu baris profil. Dipakai EditableField, PasswordSection, dan Email.
// input: pengganti nilai saat mode edit. below: isi di bawah kotak (tombol Simpan, dll).
function ProfileField({
  label,
  value,
  empty,
  actionLabel,
  onAction,
  input,
  below,
  message,
}) {
  return (
    <div className="pf">
      <p className="pf-label">{label}</p>
      <div className="pf-box">
        {input ?? (
          <span className={`pf-value ${empty ? "empty" : ""}`}>
            {empty ? "Belum diisi" : value}
          </span>
        )}
        {actionLabel && (
          <button type="button" className="pf-btn" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      {below && <div className="pf-below">{below}</div>}
      {message?.text && (
        <p className={`admin-message ${message.type}`}>{message.text}</p>
      )}
    </div>
  );
}

export default ProfileField;
