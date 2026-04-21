"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Boxes, ChefHat, CreditCard, UserRound } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products & Ads", icon: Boxes },
  { href: "/admin/settings", label: "Settings", icon: CreditCard },
  { href: "/admin/kds", label: "KDS", icon: ChefHat },
  { href: "/admin/profile", label: "Profile", icon: UserRound }
];

export default function AdminTopNav({ currentPath = "" }) {
  return (
    <nav style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {links.map((item) => {
        const Icon = item.icon;
        const active = currentPath.startsWith(item.href);

        return (
          <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link className={active ? "btn" : "btn btn-ghost"} href={item.href}>
              <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
                <Icon size={15} />
                {item.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
