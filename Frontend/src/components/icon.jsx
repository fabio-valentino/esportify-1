import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Gamepad2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";

const icons = {
  "arrow-right": ArrowRight,
  "badge-check": BadgeCheck,
  check: Check,
  "check-check": CheckCheck,
  "external-link": ExternalLink,
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
