// constants/icons.ts
import * as L from "lucide-react";
import { GoogleIcon } from "@/components/icons/google-icon";
import { FacebookIcon } from "@/components/icons/facebook-icon";

export const ICON_MAP = {
  /* Layout */
  home: L.Home,
  settings: L.Settings,
  search: L.Search,
  plus: L.Plus,
  x: L.X,
  cloud: L.Cloud,
  wifiOff: L.WifiOff,
  camera: L.Camera,
  info: L.Info,
  alertTriangle: L.AlertTriangle,
  clock: L.Clock,

  /* Socials */
  twitter: L.Twitter,
  linkedin: L.Linkedin,
  google: GoogleIcon,
  facebook: FacebookIcon,
  instagram: L.Instagram,
  youtube: L.Youtube,
  github: L.Github,
  dribbble: L.Dribbble, 
  externalLink: L.ExternalLink,

  /* Notification */
  bell: L.Bell,

  /* Theme */
  sun: L.Sun,
  moon: L.Moon,

  /* UI */
  chevronRight: L.ChevronRight,
  gripVertical: L.GripVertical,
  trash: L.Trash,
  filter: L.Filter,
  bookmark: L.Bookmark,
  helpCircle: L.HelpCircle,
  heart: L.Heart,
  arrowRight: L.ArrowRight,
  menu: L.Menu,
  phone: L.Phone,
  chevronDown: L.ChevronDown,
  chevreonRight: L.ChevronRight,
  chevronLeft: L.ChevronLeft,
  chevronUp: L.ChevronUp,
  arrowLeft: L.ArrowLeft,
  arrowUp: L.ArrowUp,
  arrowDown: L.ArrowDown,

  login: L.LogIn,
  logout: L.LogOut,
  user: L.User,
  eyeOff: L.EyeOff,
  eye: L.Eye,
  mail: L.Mail,
  shieldOff: L.ShieldOff,
  shieldCheck: L.ShieldCheck,

  partyPopper: L.PartyPopper,

  /* Programs */
  target: L.Target,
  trendingUp: L.TrendingUp,
  bookOpen: L.BookOpen,
  award: L.Award,
  globe: L.Globe,

  /* Finance */
  dollarSign: L.DollarSign,
  handshake: L.HandHeart,

  /* Volunteers & Users */
  users: L.Users,
  userCheck: L.UserCheck,

  /* Content */
  fileText: L.FileText,
  message: L.MessageSquare,

  /* Analytics */
  barChart3: L.BarChart3,
  activity: L.Activity,

  /* Integrations */
  zap: L.Zap,

  /* Brand */
  holistic: L.HeartHandshake,

  /* Security */
  shield: L.Shield,

  /* Calendar */
  calendar: L.Calendar,
} as const;

export type IconName = keyof typeof ICON_MAP;
