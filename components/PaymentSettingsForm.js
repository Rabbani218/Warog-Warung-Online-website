"use client";

import { memo, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Landmark, Loader2, QrCode, Upload, Wallet } from "lucide-react";
import { savePaymentSettingsAction } from "@/app/(admin)/admin/settings/actions";

const PaymentMethodCard = memo(function PaymentMethodCard({ icon: Icon, title, subtitle }) {
  return (
    <motion.div
      layout
      className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
          <Icon size={18} />
        </span>
        <div>
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
});

export default function PaymentSettingsForm({ initialSettings }) {
  const [ewalletNumber, setEwalletNumber] = useState(initialSettings?.ewalletNumber || "");
  const [bankAccount, setBankAccount] = useState(initialSettings?.bankAccount || "");
  const [qrisImageUrl, setQrisImageUrl] = useState(initialSettings?.qrisImageUrl || "");
  const [status, setStatus] = useState("");
  const fileInputRef = useRef(null);
  const [isPending, startTransition] = useTransition();

  async function onQrisFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setStatus("Ukuran file QRIS maksimal 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrisImageUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function save(event) {
    event.preventDefault();
    setStatus("Menyimpan data pembayaran...");

    startTransition(async () => {
      try {
        const result = await savePaymentSettingsAction({
          ewalletNumber,
          bankAccount,
          qrisImageUrl
        });

        setEwalletNumber(result.ewalletNumber || "");
        setBankAccount(result.bankAccount || "");
        setQrisImageUrl(result.qrisImageUrl || "");
        setStatus("Pengaturan pembayaran berhasil disimpan.");
      } catch (error) {
        setStatus("Gagal menyimpan pengaturan pembayaran.");
      }
    });
  }

  return (
    <motion.div layout className="grid grid-cols-1 gap-6 lg:grid-cols-2" transition={{ duration: 0.25 }}>
      <motion.section layout className="rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-xl backdrop-blur-md">
        <h3 className="retro-title mb-6 text-xl text-slate-900">Pengaturan Pembayaran Nyata</h3>
        <form className="flex flex-col gap-5" onSubmit={save}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-600">Nomor E-Wallet Tujuan</span>
            <input
              className="input"
              value={ewalletNumber}
              onChange={(e) => setEwalletNumber(e.target.value)}
              placeholder="Contoh: 081234567890"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-600">Nomor Rekening Transfer</span>
            <input
              className="input"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Contoh: BCA 1234567890 a.n Wareb"
            />
          </label>

          <div className="grid gap-3">
            <span className="text-sm font-medium text-slate-600">Upload QRIS Lokal</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onQrisFileChange} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn btn-ghost inline-flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} /> Upload Gambar QRIS
              </button>
              {qrisImageUrl ? (
                <button type="button" className="btn btn-ghost" onClick={() => setQrisImageUrl("")}>
                  Hapus QRIS
                </button>
              ) : null}
            </div>

            {qrisImageUrl ? (
              <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <Image src={qrisImageUrl} alt="QRIS lokal" fill sizes="176px" className="object-contain p-2" />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Belum ada gambar QRIS yang diunggah.</p>
            )}
          </div>

          <button className="btn inline-flex w-full items-center justify-center gap-2 sm:w-auto" type="submit" disabled={isPending}>
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </form>

        {status && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
            <CheckCircle2 size={16} /> {status}
          </div>
        )}
      </motion.section>

      <motion.section layout className="rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-xl backdrop-blur-md">
        <h3 className="retro-title mb-3 text-xl text-slate-900">Kanal Pembayaran Tersedia</h3>
        <p className="mb-6 text-sm text-slate-500">
          Nilai yang Anda simpan di panel kiri akan langsung dipakai oleh portal pelanggan saat checkout.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PaymentMethodCard icon={QrCode} title="QRIS Lokal" subtitle="Tampilkan gambar QR statis milik warung" />
          <PaymentMethodCard icon={Landmark} title="Transfer Bank" subtitle="Nomor rekening khusus transfer pelanggan" />
          <PaymentMethodCard icon={Wallet} title="E-Wallet" subtitle="Nomor tujuan untuk GoPay, OVO, DANA" />
        </div>
      </motion.section>
    </motion.div>
  );
}
