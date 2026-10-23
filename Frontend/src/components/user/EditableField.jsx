import { useState } from "react";
import ProfileField from "./ProfileField";

// options: kalau ada, tampil sebagai dropdown. errorKey: nama field error dari backend.
// onSave(value) melempar error kalau gagal. onSaved(value) dipanggil setelah berhasil.
function EditableField({
  label,
  value,
  options,
  errorKey,
  validate,
  onSave,
  onSaved,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const toggle = () => {
    if (!editing) setDraft(value ?? "");
    setMsg({ text: "", type: "" });
    setEditing(!editing);
  };

  const submit = async () => {
    const v = draft.trim();
    const problem = validate?.(v);
    if (problem) {
      setMsg({ text: problem, type: "error" });
      return;
    }
    if (v === (value ?? "")) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(v);
      await onSaved(v);
      setEditing(false);
      setMsg({ text: `${label} berhasil diubah.`, type: "success" });
    } catch (err) {
      const fe = err.fields?.[errorKey];
      setMsg({
        text:
          (Array.isArray(fe) ? fe[0] : fe) ||
          err.message ||
          `Gagal mengubah ${label}.`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const choices =
    options && value && !options.includes(value)
      ? [value, ...options]
      : options;

  const input = !editing ? null : choices ? (
    <select
      className="pf-input"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
    >
      <option value="">Pilih...</option>
      {choices.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  ) : (
    <input
      className="pf-input"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        setMsg({ text: "", type: "" });
      }}
      onKeyDown={(e) => e.key === "Enter" && submit()}
      autoFocus
    />
  );

  return (
    <ProfileField
      label={label}
      value={value}
      empty={!editing && !value}
      actionLabel={editing ? "Cancel" : "Edit"}
      onAction={toggle}
      input={input}
      below={
        editing && (
          <button
            type="button"
            className="pf-save"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        )
      }
      message={msg}
    />
  );
}

export default EditableField;
