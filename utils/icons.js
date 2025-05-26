import {
  Twitter,
  MessageCircle,
  Youtube,
  Instagram,
  Users,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

// Map of icon names to Lucide React components
const iconMap = {
  Twitter: Twitter,
  Telegram: MessageCircle,
  Youtube: Youtube,
  Instagram: Instagram,
  Users: Users,
  ExternalLink: ExternalLink,
  Globe: Globe,
  Mail: Mail,
  Phone: Phone,
  MapPin: MapPin,
}

// Function to get social media icon component
export function getSocialIcon(iconName, className = "w-5 h-5") {
  if (!iconName) return null

  const IconComponent = iconMap[iconName]
  if (!IconComponent) return null

  return <IconComponent className={className} />
}

// Export individual icons for direct use
export { Twitter, MessageCircle as Telegram, Youtube, Instagram, Users, ExternalLink, Globe, Mail, Phone, MapPin }
