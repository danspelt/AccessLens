import {
  BookOpen,
  Camera,
  CheckCircle,
  Compass,
  Film,
  Heart,
  Hospital,
  Landmark,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Train,
  Trees,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

/**
 * Central registry mapping string keys (stored in MongoDB) to Lucide icon components.
 * When seed data references an icon by name, we resolve it here.
 */
export const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Camera,
  CheckCircle,
  Compass,
  Film,
  Heart,
  Hospital,
  Landmark,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Train,
  Trees,
  Users,
  UtensilsCrossed,
};

export function resolveIcon(name: string, fallback: LucideIcon = MapPin): LucideIcon {
  return ICONS[name] ?? fallback;
}
