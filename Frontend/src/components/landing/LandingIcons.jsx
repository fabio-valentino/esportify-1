// Ikon inline khusus landing (tidak bergantung pada daftar nama di components/icon)
const PATHS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  external:
    "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  calendar:
    "M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  users:
    "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.2a3.5 3.5 0 0 1 0 6.6",
  trophy:
    "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  network:
    "M12 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 9v3M12 12l-6 3M12 12l6 3",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  close: "M6 6l12 12M18 6L6 18",
  gamepad:
    "M6 12h4M8 10v4M15 13h.01M18 11h.01M17.3 5H6.7a4 4 0 0 0-3.9 3.1l-1.6 7A3 3 0 0 0 4.1 19c.9 0 1.7-.5 2.1-1.3L7 16h10l.8 1.7c.4.8 1.2 1.3 2.1 1.3a3 3 0 0 0 2.9-3.9l-1.6-7A4 4 0 0 0 17.3 5z",
};

function LdIcon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export default LdIcon;
