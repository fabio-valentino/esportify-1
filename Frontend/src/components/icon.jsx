import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  Gamepad2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";

// Semua ikon didaftarkan di sini. Untuk menambah ikon:
// 1. import dari "lucide-react"
// 2. tambahkan satu baris di objek icons
// Daftar ikon: https://lucide.dev/icons
const icons = {
  "arrow-right": ArrowRight,
  "badge-check": BadgeCheck,
  check: Check,
  "check-check": CheckCheck,
  eye: Eye,
  "eye-off": EyeOff,
  gamepad: Gamepad2,
  lock: Lock,
  login: LogIn,
  mail: Mail,
};

function Icon({ name, size = 16 }) {
  const Component = icons[name];
  if (!Component) {
    console.warn(`Ikon "${name}" belum terdaftar di Icon.jsx`);
    return null;
  }
  return <Component size={size} className="icon" aria-hidden="true" />;
}

export default Icon;
