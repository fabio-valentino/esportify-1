// Satu kartu isian: judul, isi, dan pesan error
function FormSection({ title, error, children }) {
  return (
    <section className={`t-form-section ${error ? "has-error" : ""}`}>
      <h2>{title}</h2>
      {children}
      {error && <p className="t-field-error">{error}</p>}
    </section>
  );
}

export default FormSection;
