import {
  FileText,
  Building2,
  Users,
  FileStack,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const staffNavItems: NavItem[] = [
  {
    title: "Surat Keluar",
    href: "/surat",
    icon: FileText,
  },
  {
    title: "Lembaga",
    href: "/lembaga",
    icon: Building2,
  },
  {
    title: "SPP",
    href: "/spp",
    icon: Wallet,
  },
];

export const adminNavItems: NavItem[] = [
  {
    title: "Surat Keluar",
    href: "/surat",
    icon: FileText,
  },
  {
    title: "SPP",
    href: "/spp",
    icon: Wallet,
  },
];

export const adminManageItems: NavItem[] = [
  {
    title: "Template Surat",
    href: "/admin/templates",
    icon: FileStack,
    adminOnly: true,
  },
  {
    title: "Lembaga",
    href: "/admin/lembaga",
    icon: Building2,
    adminOnly: true,
  },
  {
    title: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
    adminOnly: true,
  },
];

export function getNavItems(isAdmin: boolean): NavSection[] {
  if (isAdmin) {
    return [
      {
        title: "Menu Utama",
        items: adminNavItems,
      },
      {
        title: "Administrasi",
        items: adminManageItems,
      },
    ];
  }

  return [
    {
      items: staffNavItems,
    },
  ];
}

export function getAllNavItems(isAdmin: boolean): NavItem[] {
  if (isAdmin) {
    return [...adminNavItems, ...adminManageItems];
  }
  return staffNavItems;
}