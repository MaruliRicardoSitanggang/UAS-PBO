import React, { useState } from "react";
import {
  Bed, ClipboardList, Wrench, Building, PlusCircle, Edit3, Trash2,
  CheckCircle, XCircle, Clock, Eye, Users, Home, MapPin, Phone,
  Wifi, Wind, Bath, BookOpen, Car, Coffee, Shirt, Monitor,
  ChevronDown, ChevronUp, Upload, X, User, Briefcase, Calendar,
  AlertCircle, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const fmt = (n) => n?.toLocaleString("id-ID");

const FASILITAS_LIST = [
  { key: "wifi", label: "WiFi Cepat", icon: "📶" },
  { key: "ac", label: "AC", icon: "❄️" },
  { key: "kamarMandi", label: "Kamar Mandi Dalam", icon: "🚿" },
  { key: "springbed", label: "Kasur Springbed", icon: "🛏️" },
  { key: "mejaBelajar", label: "Meja Belajar", icon: "📚" },
  { key: "lemari", label: "Lemari Pakaian", icon: "🗄️" },
  { key: "dapur", label: "Dapur Bersama", icon: "🍳" },
  { key: "parkir", label: "Parkir Motor", icon: "🏍️" },
  { key: "laundry", label: "Laundry", icon: "👕" },
  { key: "smartLock", label: "Smart Lock", icon: "🔐" },
];

// ── Add/Edit Kamar Modal ────────────────────────────────────────────────────
function KamarFormModal({ isEdit, form, setForm, onSubmit, onClose, previewImages, onImageChange }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-900">{isEdit ? "Edit Kamar" : "Tambah Kamar Baru"}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition">
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 flex flex-col gap-4">
          {/* Tipe kamar */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-2">Tipe Kamar</label>
            <div className="grid grid-cols-2 gap-2">
              {["1 Orang", "2 Orang"].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipe: t }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${
                    form.tipe === t ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}>
                  {t === "1 Orang" ? "👤 1 Orang" : "👥 2 Orang"}
                </button>
              ))}
            </div>
          </div>
          {/* Nomor & harga */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Nomor Kamar</label>
              <input type="text" placeholder="Kamar 07" required value={form.nomor}
                onChange={e => setForm(f => ({ ...f, nomor: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Harga / Bulan</label>
              <input type="number" placeholder="1500000" required min={500000} value={form.harga}
                onChange={e => setForm(f => ({ ...f, harga: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
          </div>
          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">Deskripsi Kamar</label>
            <textarea rows={2} placeholder="Deskripsikan kamar..." value={form.deskripsi}
              onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none" />
          </div>
          {/* Fasilitas */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-2">Fasilitas</label>
            <div className="grid grid-cols-2 gap-1.5">
              {FASILITAS_LIST.map(f => (
                <label key={f.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                  form.fasilitas?.includes(f.key) ? "border-emerald-400 bg-emerald-50" : "border-neutral-200 hover:border-neutral-300"}`}>
                  <input type="checkbox" checked={form.fasilitas?.includes(f.key) || false}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      fasilitas: e.target.checked
                        ? [...(prev.fasilitas || []), f.key]
                        : (prev.fasilitas || []).filter(k => k !== f.key)
                    }))} className="rounded accent-emerald-600" />
                  <span className="text-xs font-medium text-neutral-700">{f.icon} {f.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Foto kamar */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-2">Foto Kamar (maks. 3 foto)</label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <label key={i} className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-emerald-400 transition cursor-pointer overflow-hidden relative group">
                  {previewImages[i] ? (
                    <>
                      <img src={previewImages[i]} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">Ganti</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <Upload className="h-5 w-5 text-neutral-300" />
                      <span className="text-[9px] text-neutral-400">Foto {i + 1}</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => onImageChange(e, i)} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition">
              {isEdit ? "Simpan Perubahan" : "Tambah Kamar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Pengajuan Sewa Card ──────────────────────────────────────────────────────
function PengajuanCard({ app, onDecision, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`bg-white border rounded-2xl shadow-xs overflow-hidden ${
      app.status === "PENDING" || app.status === "MENUNGGU" ? "border-amber-200"
      : app.status === "DITERIMA" || app.status === "DISETUJUI" ? "border-emerald-200" : "border-red-200"}`}>
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                (app.status === "PENDING" || app.status === "MENUNGGU") ? "bg-amber-100 text-amber-700 border-amber-200"
                : (app.status === "DITERIMA" || app.status === "DISETUJUI") ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-red-100 text-red-700 border-red-200"}`}>
                {app.status || "MENUNGGU"}
              </span>
              {app.tipeSewa === "patungan" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Patungan</span>
              )}
            </div>
            <h4 className="text-sm font-bold text-neutral-900">{app.namaLengkap || `User #${app.userId}`}</h4>
            <p className="text-xs text-neutral-500 mt-0.5">{app.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { l: "Durasi", v: `${app.durasiBulan} Bulan` },
                { l: "Total", v: `Rp ${fmt(app.totalTagihan)}` },
                { l: "Tipe", v: app.tipeSewa || "solo" },
              ].map(d => (
                <div key={d.l} className="bg-neutral-50 rounded-lg px-2.5 py-1.5 text-xs">
                  <span className="text-neutral-400">{d.l}: </span>
                  <span className="font-bold text-neutral-800">{d.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button onClick={() => setExpanded(e => !e)}
              className="px-3 py-1.5 text-[10px] font-bold text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition flex items-center gap-1">
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />} Biodata
            </button>
            {(app.status === "PENDING" || app.status === "MENUNGGU") && (
              <>
                <button onClick={() => onDecision(app.id, "DITOLAK")}
                  className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 text-xs font-bold transition border border-neutral-200">
                  Tolak
                </button>
                <button onClick={() => onDecision(app.id, "DITERIMA")}
                  className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow">
                  Terima
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && app.dataPenyewa && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-neutral-100">
            <div className="p-5">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Data Penyewa (Terverifikasi Admin)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {[
                  { l: "Nama", v: app.dataPenyewa.namaLengkap },
                  { l: "No. HP", v: app.dataPenyewa.noHp },
                  { l: "Pekerjaan", v: app.dataPenyewa.pekerjaan },
                  { l: "Jenis Kelamin", v: app.dataPenyewa.jenisKelamin },
                  { l: "Email", v: app.dataPenyewa.email },
                  { l: "Alamat", v: app.dataPenyewa.alamat },
                ].map(d => (
                  <div key={d.l} className="bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100">
                    <p className="text-[9px] text-neutral-400 font-bold uppercase">{d.l}</p>
                    <p className="text-xs font-bold text-neutral-800 mt-0.5 truncate">{d.v || "-"}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[{ l: "KTP", v: app.dataPenyewa.ktpUrl }, { l: "KK", v: app.dataPenyewa.kkUrl }, { l: "Foto", v: app.dataPenyewa.fotoUrl }].map(doc => (
                  doc.v ? (
                    <button key={doc.l} onClick={() => onPreview(doc.v)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition">
                      <Eye className="h-3 w-3" /> {doc.l}
                    </button>
                  ) : (
                    <span key={doc.l} className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-neutral-100 text-neutral-400 border-neutral-200 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> {doc.l}: Tidak ada
                    </span>
                  )
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main OwnerDashboard ──────────────────────────────────────────────────────
export default function OwnerDashboard({
  currentUser, laporanList, setLaporanList,
  pengajuanSewaKosList, handleDecisionPengajuanSewaKos,
}) {
  const [ownerPage, setOwnerPage] = useState("manajemen-kamar");
  const [previewUrl, setPreviewUrl] = useState(null);

  // ── Kamar state ──
  const EMPTY_FORM = { nomor: "", tipe: "1 Orang", harga: 1500000, deskripsi: "", fasilitas: [], foto: [null, null, null] };
  const [kamarList, setKamarList] = useState([
    { id: 1, nomor: "Kamar 01", tipe: "1 Orang", harga: 1800000, status: "Terisi", penyewa: "Andreas Pegri", masukSejak: "01/10/2025", kontrakHingga: "01/04/2026", fasilitas: ["wifi", "ac", "kamarMandi"], deskripsi: "Kamar nyaman lantai 1", foto: [] },
    { id: 2, nomor: "Kamar 02", tipe: "2 Orang", harga: 2200000, status: "Kosong", penyewa: null, masukSejak: null, kontrakHingga: null, fasilitas: ["wifi", "springbed"], deskripsi: "Kamar luas untuk 2 orang", foto: [] },
    { id: 3, nomor: "Kamar 03", tipe: "1 Orang", harga: 1800000, status: "Maintenance", penyewa: null, masukSejak: null, kontrakHingga: null, fasilitas: ["wifi"], deskripsi: "", foto: [] },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [addPreviews, setAddPreviews] = useState([null, null, null]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [editPreviews, setEditPreviews] = useState([null, null, null]);
  const [deleteId, setDeleteId] = useState(null);

  // ── Info Kost state ──
  const [kostInfo, setKostInfo] = useState({
    namaKost: "Kost Eksklusif Setia Budi", daerah: "Setia Budi",
    alamat: "Jl. Setia Budi No. 88, Medan", kategori: "Putra",
    hargaDasar: 1800000, noWa: "6281234567890",
  });
  const [kostMsg, setKostMsg] = useState(null);

  const handleImageChange = (e, idx, isEdit) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (isEdit) {
      setEditPreviews(prev => prev.map((p, i) => i === idx ? url : p));
      setEditForm(f => { const newFoto = [...(f.foto || [null, null, null])]; newFoto[idx] = file.name; return { ...f, foto: newFoto }; });
    } else {
      setAddPreviews(prev => prev.map((p, i) => i === idx ? url : p));
      setAddForm(f => { const newFoto = [...(f.foto || [null, null, null])]; newFoto[idx] = file.name; return { ...f, foto: newFoto }; });
    }
  };

  const handleAddKamar = (e) => {
    e.preventDefault();
    const newK = { ...addForm, id: Date.now(), status: "Kosong", harga: Number(addForm.harga), penyewa: null, masukSejak: null, kontrakHingga: null, _previews: [...addPreviews] };
    setKamarList(prev => [...prev, newK]);
    setAddForm({ ...EMPTY_FORM }); setAddPreviews([null, null, null]); setShowAddModal(false);
  };

  const openEdit = (k) => {
    setEditId(k.id);
    setEditForm({ nomor: k.nomor, tipe: k.tipe || "1 Orang", harga: k.harga, deskripsi: k.deskripsi || "", fasilitas: k.fasilitas || [], foto: k.foto || [null, null, null] });
    setEditPreviews(k._previews || [null, null, null]);
  };

  const handleEditKamar = (e) => {
    e.preventDefault();
    setKamarList(prev => prev.map(k => k.id === editId
      ? { ...k, ...editForm, harga: Number(editForm.harga), _previews: [...editPreviews] }
      : k));
    setEditId(null);
  };

  const handleDeleteKamar = () => {
    setKamarList(prev => prev.filter(k => k.id !== deleteId));
    setDeleteId(null);
  };

  const setMaintenance = (id, isOn) => {
    setKamarList(prev => prev.map(k => k.id === id ? { ...k, status: isOn ? "Maintenance" : "Kosong" } : k));
  };

  const pendingPengajuan = pengajuanSewaKosList.filter(p => p.status === "PENDING" || p.status === "MENUNGGU").length;
  const activeLaporan = laporanList.filter(l => l.status !== "SELESAI").length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-60 bg-[#f2f4f6] border-r border-neutral-200 p-5 flex flex-col gap-4 shrink-0 lg:h-[calc(100vh-68px)] lg:sticky lg:top-0">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Owner Panel</h3>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{currentUser?.name}</p>
          <p className="text-[9px] text-neutral-400 mt-0.5 font-mono">ID: {currentUser?.id}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { key: "manajemen-kamar", icon: <Bed className="h-4 w-4" />, label: "Manajemen Kamar" },
            { key: "pengajuan-sewa", icon: <ClipboardList className="h-4 w-4" />, label: "Pengajuan Sewa", badge: pendingPengajuan },
            { key: "tiket-perbaikan", icon: <Wrench className="h-4 w-4" />, label: "Tiket Perbaikan", badge: activeLaporan },
            { key: "info-kost", icon: <Building className="h-4 w-4" />, label: "Info Kost" },
          ].map(item => (
            <button key={item.key} onClick={() => setOwnerPage(item.key)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition ${
                ownerPage === item.key ? "bg-emerald-700 text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-200"}`}>
              {item.icon} {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ── MANAJEMEN KAMAR ── */}
          {ownerPage === "manajemen-kamar" && (
            <motion.div key="mk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Manajemen Kamar</h2>
                  <p className="text-xs text-neutral-500">Kelola semua unit kamar kost Anda.</p>
                </div>
                <button onClick={() => { setAddForm({ ...EMPTY_FORM }); setAddPreviews([null,null,null]); setShowAddModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow">
                  <PlusCircle className="h-4 w-4" /> Tambah Kamar
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { l: "Total", v: kamarList.length, c: "text-neutral-800" },
                  { l: "Terisi", v: kamarList.filter(k => k.status === "Terisi").length, c: "text-emerald-700" },
                  { l: "Kosong", v: kamarList.filter(k => k.status === "Kosong").length, c: "text-blue-700" },
                  { l: "Maintenance", v: kamarList.filter(k => k.status === "Maintenance").length, c: "text-amber-700" },
                ].map(s => (
                  <div key={s.l} className="bg-white border border-neutral-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{s.l}</p>
                    <p className={`text-2xl font-black mt-1 ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>

              {/* Room cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kamarList.map(k => (
                  <div key={k.id} className={`bg-white border rounded-2xl overflow-hidden shadow-xs ${
                    k.status === "Terisi" ? "border-emerald-200"
                    : k.status === "Maintenance" ? "border-amber-200" : "border-blue-200"}`}>
                    {/* Foto kamar */}
                    {k._previews?.[0] ? (
                      <div className="h-32 overflow-hidden cursor-pointer" onClick={() => setPreviewUrl(k._previews[0])}>
                        <img src={k._previews[0]} alt={k.nomor} className="w-full h-full object-cover hover:scale-105 transition" />
                      </div>
                    ) : (
                      <div className="h-32 bg-neutral-100 flex items-center justify-center">
                        <Bed className="h-8 w-8 text-neutral-300" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-neutral-800">{k.nomor}</h4>
                          <p className="text-[10px] text-neutral-400">{k.tipe || "1 Orang"}</p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          k.status === "Terisi" ? "bg-emerald-100 text-emerald-700"
                          : k.status === "Maintenance" ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"}`}>{k.status}</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-700">Rp {fmt(k.harga)} / bulan</p>
                      {k.penyewa && <p className="text-xs text-neutral-600 truncate">👤 {k.penyewa}</p>}
                      {k.masukSejak && <p className="text-[10px] text-neutral-400">{k.masukSejak} → {k.kontrakHingga}</p>}
                      {k.deskripsi && <p className="text-[10px] text-neutral-500 line-clamp-2">{k.deskripsi}</p>}
                      {/* Fasilitas chips */}
                      {k.fasilitas?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {k.fasilitas.slice(0, 3).map(fk => {
                            const f = FASILITAS_LIST.find(fl => fl.key === fk);
                            return f ? <span key={fk} className="text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded-full text-neutral-600">{f.icon} {f.label}</span> : null;
                          })}
                          {k.fasilitas.length > 3 && <span className="text-[9px] text-neutral-400">+{k.fasilitas.length - 3}</span>}
                        </div>
                      )}
                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => openEdit(k)}
                          className="flex-1 py-1.5 text-[10px] font-bold bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition flex items-center justify-center gap-1">
                          <Edit3 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => setDeleteId(k.id)} disabled={k.status === "Terisi"}
                          className="flex-1 py-1.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
                          <Trash2 className="h-3 w-3" /> Hapus
                        </button>
                      </div>
                      <button
                        onClick={() => setMaintenance(k.id, k.status !== "Maintenance")}
                        disabled={k.status === "Terisi"}
                        className={`w-full py-1.5 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                          k.status === "Maintenance"
                          ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"}`}>
                        <Wrench className="h-3 w-3" />
                        {k.status === "Maintenance" ? "Selesai Maintenance" : "Set Maintenance"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── PENGAJUAN SEWA ── */}
          {ownerPage === "pengajuan-sewa" && (
            <motion.div key="ps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Pengajuan Sewa</h2>
                <p className="text-xs text-neutral-500">Daftar penyewa yang mengajukan sewa kamar kost Anda.</p>
              </header>
              {pengajuanSewaKosList.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <ClipboardList className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">Belum ada pengajuan sewa</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pengajuanSewaKosList.map(app => (
                    <PengajuanCard key={app.id} app={app}
                      onDecision={handleDecisionPengajuanSewaKos}
                      onPreview={setPreviewUrl} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── TIKET PERBAIKAN ── */}
          {ownerPage === "tiket-perbaikan" && (
            <motion.div key="tp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Tiket Perbaikan</h2>
                <p className="text-xs text-neutral-500">Laporan kerusakan dari penyewa.</p>
              </header>
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Semua Tiket</h3>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{activeLaporan} Aktif</span>
                </div>
                {laporanList.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 text-sm">Belum ada tiket perbaikan.</div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {laporanList.map(item => (
                      <div key={item.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-[10px] font-bold">{item.kategori}</span>
                            <span className="text-[10px] text-neutral-400">{item.tanggal}</span>
                          </div>
                          <h4 className="text-sm font-bold text-neutral-800">{item.kendala}</h4>
                          <p className="text-xs text-neutral-500 mt-0.5">{item.detail}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            item.status === "SELESAI" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "BARU" ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                            {item.status}
                          </span>
                          {item.status !== "SELESAI" && (
                            <button onClick={() => setLaporanList(prev => prev.map(l => l.id === item.id
                              ? { ...l, status: l.status === "BARU" ? "DIPROSES" : "SELESAI" } : l))}
                              className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded-lg transition">
                              {item.status === "BARU" ? "Proses" : "Selesaikan"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── INFO KOST ── */}
          {ownerPage === "info-kost" && (
            <motion.div key="ik" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Info Kost</h2>
                <p className="text-xs text-neutral-500">Atur informasi dan profil kost Anda.</p>
              </header>
              {kostMsg && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-medium border ${kostMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                  {kostMsg.text}
                </div>
              )}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Nama Kost", key: "namaKost", type: "text" },
                    { label: "Daerah / Kawasan", key: "daerah", type: "text" },
                    { label: "No. WhatsApp Pemilik", key: "noWa", type: "text", placeholder: "6281234567890" },
                    { label: "Harga Dasar / Bulan", key: "hargaDasar", type: "number" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">{f.label}</label>
                      <input type={f.type} value={kostInfo[f.key] || ""} placeholder={f.placeholder || ""}
                        onChange={e => setKostInfo(k => ({ ...k, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">Alamat Lengkap</label>
                  <input type="text" value={kostInfo.alamat || ""}
                    onChange={e => setKostInfo(k => ({ ...k, alamat: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-2">Kategori Kost</label>
                  <div className="flex gap-2">
                    {["Putra", "Putri", "Campur"].map(k => (
                      <button key={k} type="button" onClick={() => setKostInfo(prev => ({ ...prev, kategori: k }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition ${
                          kostInfo.kategori === k ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}>
                        {k === "Putra" ? "👨 Putra" : k === "Putri" ? "👩 Putri" : "👥 Campur"}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setKostMsg({ type: "success", text: "Informasi kost berhasil disimpan!" }); setTimeout(() => setKostMsg(null), 3000); }}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Simpan Informasi Kost
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Add Kamar Modal */}
      {showAddModal && (
        <KamarFormModal isEdit={false} form={addForm} setForm={setAddForm}
          onSubmit={handleAddKamar} onClose={() => setShowAddModal(false)}
          previewImages={addPreviews} onImageChange={(e, i) => handleImageChange(e, i, false)} />
      )}

      {/* Edit Kamar Modal */}
      {editId !== null && (
        <KamarFormModal isEdit={true} form={editForm} setForm={setEditForm}
          onSubmit={handleEditKamar} onClose={() => setEditId(null)}
          previewImages={editPreviews} onImageChange={(e, i) => handleImageChange(e, i, true)} />
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-neutral-900 mb-2">Hapus Kamar?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Yakin ingin menghapus <strong>{kamarList.find(k => k.id === deleteId)?.nomor}</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition">Batal</button>
              <button onClick={handleDeleteKamar}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)} className="absolute -top-10 right-0 text-white text-sm font-bold">✕ Tutup</button>
            <img src={previewUrl} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
