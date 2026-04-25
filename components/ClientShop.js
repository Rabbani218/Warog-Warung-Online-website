"use client";
// Antigravity Fixed: Added session handling and profile button

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, ShoppingBag, Info, MapPin, Clock, Users, ArrowRight, User as UserIcon } from "lucide-react";
import PromoCarousel from "@/components/PromoCarousel";
import FloatingCart from "@/components/FloatingCart";
import ClientAuthModal from "@/components/ClientAuthModal";
import ReviewSection from "@/components/ReviewSection";
import SafeImage from "@/components/SafeImage";

import { useCart } from "@/lib/CartContext";

export default function ClientShop({ store, menus, banners, tableNumber, paymentSettings, employees, reviews = [] }) {
  const { cart, setCart, addToCart: globalAddToCart } = useCart();
  const [query, setQuery] = useState("");
  const [addedItem, setAddedItem] = useState(null);
  const { data: session, status } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return menus;
    return menus.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [menus, query]);

  function addToCart(menu) {
    setAddedItem(menu.id);
    setTimeout(() => setAddedItem(null), 600);
    globalAddToCart(menu);
  }


  const mapAddress = String(store.address || "").trim();
  const mapEmbedUrl = mapAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`
    : "";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Premium Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-[#FF6B6B]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl" />
        
        <div className="absolute top-8 right-8 z-20">
          {status === "loading" ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl animate-pulse shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100" />
              <div className="w-16 h-3 bg-slate-100 rounded-full" />
            </div>
          ) : (
            <Link 
              href={status === "authenticated" ? "/profile" : "#"} 
              onClick={(e) => {
                if (status !== "authenticated") {
                  e.preventDefault();
                  setShowAuth(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#FF6B6B]/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#FF6B6B] transition-colors overflow-hidden">
                {session?.user?.avatar ? (
                  <Image src={session?.user?.avatar} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                {status === "authenticated" ? (session?.user?.name?.split(" ")[0] || "Profil") : "Masuk"}
              </span>
            </Link>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B6B]/5 border border-[#FF6B6B]/10 text-[#FF6B6B] text-sm font-bold tracking-tight"
          >
            <ShoppingBag size={14} />
            <span>{store.name || "Warteg Digital Experience"}</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Menu Lezat, <span className="text-gradient">Cepat Sampai</span> di Meja Anda.
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            {store.bio || store.description || "Rasakan pengalaman makan di warteg dengan sentuhan teknologi modern. Pilih menu, checkout, dan biarkan kami melayani Anda."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-sm font-medium">
            {store.operationalHours && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <Clock size={16} />
                <span>Buka: {store.operationalHours}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100">
              <Users size={16} />
              <span>{menus.length} Pilihan Menu</span>
            </div>
            {tableNumber && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                <Info size={16} />
                <span>Meja {tableNumber}</span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Main Shop Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          {/* Promo & Search */}
          <div className="space-y-6">
            <PromoCarousel banners={banners} />
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6B6B] transition-colors">
                <Search size={20} />
              </div>
              <input
                className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-4 pl-12 pr-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all shadow-sm shadow-slate-100"
                placeholder="Cari makanan favoritmu hari ini..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Menu Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filtered.length > 0 ? (
              filtered.map((menu) => (
                <motion.article
                  key={menu.id}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                >
                  <Link href={`/product/${menu.slug}`} className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100 block">
                    <Image
                      src={menu.imageUrl || "/placeholder-image.png"}
                      alt={menu.name || "Menu Warung"}
                      fill
                      className="object-contain object-center w-full h-full transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-[#FF6B6B] shadow-sm uppercase tracking-wider">
                      {menu.category}
                    </div>
                  </Link>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <Link href={`/product/${menu.slug}`}>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#FF6B6B] transition-colors leading-tight">
                          {menu.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 line-clamp-2 h-10 leading-relaxed">
                        {menu.description || "Kelezatan warteg modern dalam satu sajian istimewa."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Harga</span>
                        <strong className="text-xl text-slate-900 tracking-tight">
                          Rp {Number(menu.price).toLocaleString("id-ID")}
                        </strong>
                      </div>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(menu)}
                        aria-label="Tambah pesanan"
                        className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                          addedItem === menu.id 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                            : "bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/20 hover:bg-[#ff5252]"
                        }`}
                      >
                        {addedItem === menu.id ? "Berhasil!" : "Pesan"}
                        <ArrowRight size={14} className={addedItem === menu.id ? "hidden" : "block"} />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Menu Tidak Ditemukan</h3>
                <p className="text-slate-500">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Cart */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-8">
            <FloatingCart cart={cart} setCart={setCart} paymentSettings={paymentSettings} />
          </div>
        </aside>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Map Section */}
        {mapAddress && (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Lokasi Kami</h3>
                  <p className="text-sm text-slate-500">{mapAddress}</p>
                </div>
              </div>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(mapAddress)}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-[#FF6B6B] hover:underline"
              >
                Lihat Google Maps
              </a>
            </div>
            
            <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner">
              <iframe
                title="Lokasi Warung"
                src={mapEmbedUrl}
                className="w-full h-64 grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />
            </div>
          </motion.section>
        )}

        {/* Team Section */}
        {Array.isArray(employees) && employees.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B6B]/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold">Tim Hebat Kami</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employees.map((employee) => (
                <div key={employee.id} className="p-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FF6B6B] rounded-xl flex items-center justify-center font-bold text-lg">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{employee.name}</h4>
                    <p className="text-xs text-slate-400">{employee.role || "Crew"}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <ReviewSection reviews={reviews} />
      <ClientAuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
}
