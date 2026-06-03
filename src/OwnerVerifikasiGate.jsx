import React, { useState } from "react";
import {
  Building,
  Upload,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  FileText,
  LogOut,
  Send,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const API = "http://localhost:8080";

// Upload satu file ke backend
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Upload gagal");
  return data.url;
}

/**
 * Halaman penjaga akses Owner.
 * Ditampilkan ketika owner login tapi verifikasi belum DISETUJUI.
 *
 * Props:
 *  - currentUser: { id, name, email, ownerVerifikasiStatus, ownerPengajuanId, ownerKomentar }
 *  - onLogout: () => void
 */
export default function OwnerVerifikasiGate({ currentUser, onLogout }) {
  const status = currentUser.ownerVerifikasiStatus || "BELUM";

  // Form pengajuan berkas
  const [form, setForm] = useState({
    namaLengkap: currentUser.name || "",
    email: currentUser.email || "",
    namaKost: "",
    alamatKost: "",
    daerah: "",
  });
  const [files, setFiles] = useState({ ktp: null, surat: null, foto: null });
  const [previews, setPreviews] = useState({
    ktp: null,
    surat: null,
    foto: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  // Track status lokal setelah submit berhasil
  const [localStatus, setLocalStatus] = useState(status);

  const handleFile = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFiles((f) => ({ ...f, [key]: file }));
    setPreviews((p) => ({ ...p, [key]: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.ktp || !files.surat || !files.foto) {
      setMsg({
        type: "error",
        text: "Harap upload semua berkas (KTP, Surat Izin, Foto Kost).",
      });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      const [ktpUrl, suratUrl, fotoUrl] = await Promise.all([
        uploadFile(files.ktp),
        uploadFile(files.surat),
        uploadFile(files.foto),
      ]);

      const payload = {
        userId: Number(currentUser.id),
        namaLengkap: form.namaLengkap,
        email: form.email,
        namaKost: form.namaKost,
        alamatKost: form.alamatKost,
        daerah: form.daerah,
        ktpUrl,
        suratKepemilikanUrl: suratUrl,
        fotoKostUrl: fotoUrl,
      };

      const res = await fetch(`${API}/api/pengajuan-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setLocalStatus("PENDING");
        setMsg({
          type: "success",
          text: "Pengajuan berhasil dikirim! Tunggu verifikasi Admin.",
        });
        // Simpan ke localStorage agar refresh tidak balik ke form
        const updatedUser = {
          ...currentUser,
          ownerVerifikasiStatus: "PENDING",
        };
        localStorage.setItem("papikost_user", JSON.stringify(updatedUser));
      } else {
        throw new Error(data.error || "Gagal mengirim pengajuan.");
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const komentar = currentUser.ownerKomentar || {};

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header */}
      <div className="bg-emerald-950 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-800 rounded-lg text-emerald-300">
            <Layers className="h-5 w-5" />
          </span>
          <h1 className="font-bold text-lg">PapiKost Medan</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-300">
            Halo, {currentUser.name}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700/80 hover:bg-red-800 text-white text-xs font-bold rounded-lg transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* ── STATUS: BELUM — tampilkan form pengajuan ── */}
            {localStatus === "BELUM" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-6">
                  <Building className="h-12 w-12 text-emerald-700 mx-auto mb-2" />
                  <h2 className="text-xl font-black text-neutral-900">
                    Ajukan Verifikasi Owner
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    Lengkapi berkas berikut agar Admin bisa memverifikasi Anda
                    sebagai pemilik kost.
                  </p>
                </div>

                {msg && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      msg.type === "error"
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    }`}
                  >
                    {msg.type === "error" ? (
                      <XCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    )}
                    {msg.text}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4"
                >
                  <h3 className="text-sm font-bold text-neutral-800 border-b pb-3">
                    Data Diri & Kost
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Nama Lengkap", key: "namaLengkap" },
                      { label: "Email", key: "email" },
                      { label: "Nama Kost", key: "namaKost" },
                      { label: "Daerah / Kec.", key: "daerah" },
                    ].map((f) => (
                      <div
                        key={f.key}
                        className={
                          f.key === "namaKost" || f.key === "daerah" ? "" : ""
                        }
                      >
                        <label className="block text-xs font-bold text-neutral-600 mb-1">
                          {f.label}
                        </label>
                        <input
                          type="text"
                          required
                          value={form[f.key]}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, [f.key]: e.target.value }))
                          }
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">
                      Alamat Kost Lengkap
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.alamatKost}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, alamatKost: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-neutral-800 border-b pb-3 mt-2">
                    Upload Berkas
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "ktp", label: "KTP Pemilik" },
                      { key: "surat", label: "Surat Izin / Kepemilikan" },
                      { key: "foto", label: "Foto Kost" },
                    ].map((f) => (
                      <div
                        key={f.key}
                        className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center gap-2 transition cursor-pointer ${
                          files[f.key]
                            ? "border-emerald-400 bg-emerald-50/30"
                            : "border-neutral-200 hover:border-emerald-400"
                        }`}
                      >
                        <Upload
                          className={`h-5 w-5 ${files[f.key] ? "text-emerald-500" : "text-neutral-400"}`}
                        />
                        <p className="text-[10px] font-bold text-neutral-600 text-center">
                          {f.label}
                        </p>
                        {previews[f.key] && (
                          <img
                            src={previews[f.key]}
                            alt=""
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        )}
                        <label className="w-full cursor-pointer">
                          <div className="w-full py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-center transition">
                            {files[f.key] ? "Ganti" : "Pilih File"}
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) => handleFile(e, f.key)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    <Send className="h-4 w-4" />
                    {submitting
                      ? "Mengunggah & Mengirim..."
                      : "Kirim Pengajuan ke Admin"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STATUS: PENDING ── */}
            {localStatus === "PENDING" && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-amber-200 rounded-2xl p-8 text-center"
              >
                <Clock className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <h2 className="text-lg font-black text-neutral-900">
                  Pengajuan Sedang Ditinjau
                </h2>
                <p className="text-sm text-neutral-500 mt-2">
                  Berkas Anda sudah diterima dan sedang diverifikasi oleh Admin.
                  Anda akan mendapatkan akses ke Dashboard Owner setelah semua
                  berkas disetujui.
                </p>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-bold">
                    Proses verifikasi biasanya berlangsung 1–2 hari kerja.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STATUS: DITOLAK ── */}
            {localStatus === "DITOLAK" && (
              <motion.div
                key="ditolak"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-white border border-red-200 rounded-2xl p-6 mb-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-8 w-8 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-base font-black text-neutral-900">
                        Pengajuan Ditolak
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1">
                        Satu atau lebih berkas Anda ditolak oleh Admin. Silakan
                        perbaiki berdasarkan instruksi di bawah, lalu ajukan
                        ulang.
                      </p>
                    </div>
                  </div>

                  {/* Komentar per berkas */}
                  <div className="mt-4 flex flex-col gap-2">
                    {[
                      { key: "ktp", label: "KTP" },
                      { key: "suratKepemilikan", label: "Surat Kepemilikan" },
                      { key: "fotoKost", label: "Foto Kost" },
                    ]
                      .filter((b) => komentar[b.key])
                      .map((b) => (
                        <div
                          key={b.key}
                          className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                        >
                          <p className="text-[10px] font-bold text-red-700 uppercase">
                            {b.label}
                          </p>
                          <p className="text-xs text-red-800 mt-0.5">
                            {komentar[b.key]}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Form pengajuan ulang */}
                <p className="text-xs text-neutral-500 text-center mb-3 font-bold">
                  Ajukan ulang dengan berkas yang sudah diperbaiki:
                </p>
                {msg && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      msg.type === "error"
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    }`}
                  >
                    {msg.type === "error" ? (
                      <XCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    )}
                    {msg.text}
                  </div>
                )}
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "ktp", label: "KTP Pemilik" },
                      { key: "surat", label: "Surat Izin" },
                      { key: "foto", label: "Foto Kost" },
                    ].map((f) => (
                      <div
                        key={f.key}
                        className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center gap-2 transition ${
                          files[f.key]
                            ? "border-emerald-400 bg-emerald-50/30"
                            : "border-red-200 bg-red-50/20 hover:border-emerald-400"
                        }`}
                      >
                        <FileText
                          className={`h-5 w-5 ${files[f.key] ? "text-emerald-500" : "text-red-400"}`}
                        />
                        <p className="text-[10px] font-bold text-neutral-600 text-center">
                          {f.label}
                        </p>
                        {previews[f.key] && (
                          <img
                            src={previews[f.key]}
                            alt=""
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        )}
                        <label className="w-full cursor-pointer">
                          <div className="w-full py-1 text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-center">
                            {files[f.key] ? "Ganti" : "Upload Ulang"}
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) => handleFile(e, f.key)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Mengirim..." : "Kirim Ulang Pengajuan"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
