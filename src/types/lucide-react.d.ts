declare module 'lucide-react' {
  import * as React from 'react';

  export type Icon = React.ComponentType<{
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    className?: string;
    [key: string]: any;
  }>;

  // Common icons used in the project
  export const AlertTriangle: Icon;
  export const User: Icon;
  export const UserCircle: Icon;
  export const ShoppingBag: Icon;
  export const Shield: Icon;
  export const LogOut: Icon;
  export const Check: Icon;
  export const X: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const Menu: Icon;
  export const Search: Icon;
  export const Settings: Icon;
  export const Home: Icon;
  export const Mail: Icon;
  export const Phone: Icon;
  export const Calendar: Icon;
  export const Clock: Icon;
  export const Heart: Icon;
  export const Star: Icon;
  export const Info: Icon;
  export const HelpCircle: Icon;
  export const ExternalLink: Icon;
  export const Trash: Icon;
  export const Edit: Icon;
  export const Copy: Icon;
  export const Download: Icon;
  export const Upload: Icon;
  export const File: Icon;
  export const Folder: Icon;
  export const Image: Icon;
  export const Video: Icon;
  export const Music: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const ArrowUp: Icon;
  export const ArrowDown: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const PlusCircle: Icon;
  export const MinusCircle: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Lock: Icon;
  export const Unlock: Icon;
  export const Key: Icon;
  export const RefreshCw: Icon;
  export const RotateCw: Icon;
  export const RotateCcw: Icon;
  export const Save: Icon;
  export const Loader: Icon;
  export const Sun: Icon;
  export const Moon: Icon;
  
  // Additional icons needed by the project
  export const CreditCard: Icon;
  export const ShieldCheck: Icon;
  export const EyeIcon: Icon;
  export const EyeOffIcon: Icon;
  export const ShieldAlert: Icon;
  export const ClipboardList: Icon;
  export const PackageCheck: Icon;
  export const Database: Icon;
  export const AlertCircle: Icon;
  export const CheckCircle: Icon;
  export const Smartphone: Icon;
  export const PauseCircle: Icon;
  export const PlayCircle: Icon;
  export const Edit2: Icon;
  export const XCircle: Icon;
  export const MapPin: Icon;
  export const MoreHorizontal: Icon;
  export const Filter: Icon;
  export const Trash2: Icon; // Alias for Trash
  export const RefreshCcw: Icon; // Alias for RefreshCw
  export const Loader2: Icon; // Alias for Loader
} 