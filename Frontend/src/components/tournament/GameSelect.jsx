import { useState } from "react";
import Icon from "../icon";

// Kotak "Cari atau pilih game". value = id game terpilih, onChange(id).
function GameSelect({ games, value, onChange }) {
  const selected = games.find((g) => g.id === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const keyword = query.trim().toLowerCase();
  const options = games.filter((g) => g.name.toLowerCase().includes(keyword));

  const pick = (game) => {
    onChange(game.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="t-select">
      <div className="t-select-box">
        <Icon name="search" size={16} />
        <input
          type="text"
          placeholder="Cari atau pilih game"
          value={open ? query : (selected?.name ?? "")}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        <Icon name="chevron-down" size={18} />
      </div>

      {open && (
        <ul className="t-select-list">
          {options.map((g) => (
            // onMouseDown supaya terpilih sebelum input kehilangan fokus
            <li
              key={g.id}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(g);
              }}
            >
              {g.name}
            </li>
          ))}
          {options.length === 0 && (
            <li className="empty">Game tidak ditemukan</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default GameSelect;
