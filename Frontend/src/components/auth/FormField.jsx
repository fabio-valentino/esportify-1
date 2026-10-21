import Icon from "../icon";

// Satu kolom input: label, ikon kiri, ikon/tombol kanan (opsional), pesan error
// Props lain (name, type, value, onChange, placeholder, dll) diteruskan ke <input>
function FormField({ label, icon, hint, right, error, ...inputProps }) {
  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={inputProps.name}>{label}</label>
        {hint && <span className="field-hint">{hint}</span>}
      </div>

      <div className={`field-box ${error ? "has-error" : ""}`}>
        <Icon name={icon} size={16} />
        <input id={inputProps.name} {...inputProps} />
        {right && <span className="field-right">{right}</span>}
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default FormField;
