import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  Gamepad2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Search,
  Trash2,
  User,
  Users,
  Plus,
  X,
  Pencil,
  KeyRound,
} from "lucide-react";

// Untuk menambah ikon: import di atas, lalu tambah satu baris di objek icons.
// Daftar ikon: https://lucide.dev/icons
const icons = {
  "arrow-right": ArrowRight,
  "badge-check": BadgeCheck,
  bell: Bell,
  check: Check,

  "check-check": CheckCheck,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "external-link": ExternalLink,
  eye: Eye,
  "eye-off": EyeOff,
  gamepad: Gamepad2,
  lock: Lock,
  login: LogIn,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  search: Search,
  trash: Trash2,
  user: User,
  users: Users,
  plus: Plus,
  x: X,
  edit: Pencil,
  key: KeyRound,
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
