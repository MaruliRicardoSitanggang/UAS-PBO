import React, { useState, useEffect } from "react";
import {
  Search, AlertTriangle, MapPin, CreditCard, Send, History,
  Phone, Users, ArrowLeft, ArrowRight, Eye, User, Upload,
  Bell as BellIcon, CheckCircle, XCircle, Clock, Home,
  AlertCircle, DoorOpen, CalendarDays, Wrench, BarChart3, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const fmt = (n) => n?.toLocaleString("id-ID");

const INITIAL_KAMAR_KOST = [
  {
    id: 1, namaKost: "Kost Putra Padang Bulan", daerah: "Padang Bulan",
    hargaDasar: 1500000, status: "Tersedia", rating: 4.8, kategori: "Putra",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true, mejaBelajar: true, ac: false, availableRooms: 2,
    availableRoomsSolo: 2, availableRoomsPatungan: 1, noWaOwner: "6281234567890",
    description: "Kost premium minimalis dengan pencahayaan alami melimpah, cocok untuk 1 orang.",
    descriptionPatungan: "Kamar luas untuk 2 orang dengan fasilitas lengkap, cocok untuk patungan.",
    fotoSolo: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600"],
    fotoPatungan: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600"],
  },
  {
    id: 2, namaKost: "Kost Eksklusif Setia Budi", daerah: "Setia Budi",
    hargaDasar: 2200000, status: "Tersedia", rating: 4.9, kategori: "Campur",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true, ac: true, kamarMandiDalam: true, kasurSpringbed: true, mejaBelajar: true,
    availableRooms: 5, availableRoomsSolo: 3, availableRoomsPatungan: 2, noWaOwner: "6281234567891",
    description: "Kost mewah berfasilitas lengkap dekat pusat kuliner Setia Budi Medan.",
    descriptionPatungan: "Unit double room AC premium, cocok untuk 2 orang patungan.",
    fotoSolo: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600"],
    fotoPatungan: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600"],
  },
  {
    id: 3, namaKost: "Kost Putri Dr. Mansyur", daerah: "Dr. Mansyur",
    hargaDasar: 1300000, status: "Tersedia", rating: 4.7, kategori: "Putri",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true, dapurBersama: true,
    availableRooms: 1, availableRoomsSolo: 1, availableRoomsPatungan: 0, noWaOwner: "6281234567892",
    description: "Kost putri asri di Jalan Dr. Mansyur Medan, lingkungan aman.",
    descriptionPatungan: "Tidak tersedia kamar patungan saat ini.",
    fotoSolo: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600"],
    fotoPatungan: [],
  },
  {
    id: 4, namaKost: "Kost Sejahtera Helvetia", daerah: "Helvetia",
    hargaDasar: 900000, status: "Tidak Tersedia", rating: 4.3, kategori: "Putra",
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600",
    wifiCepat: false, ac: false,
    availableRooms: 0, availableRoomsSolo: 0, availableRoomsPatungan: 0, noWaOwner: "6281234567893",
    description: "Kost sederhana di kawasan Helvetia.",
    descriptionPatungan: "Tidak tersedia.",
    fotoSolo: [],
    fotoPatungan: [],
  },
];

export default function UserDashboard({ currentUser, pendingInvites }) {
  // ── Navigation ──────────────────────────────────────────────────────────────
  const [userPage, setUserPage] = useState("beranda");
  const [kamarSayaTab, setKamarSayaTab] = useState("laporan");

  // ── Kost ────────────────────────────────────────────────────────────────────
  const [activeKamarList, setActiveKamarList] = useState(INITIAL_KAMAR_KOST);
  const [selectedKamar, setSelectedKamar] = useState(null);
  const [filterLokasi, setFilterLokasi] = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");

  // ── Biodata ─────────────────────────────────────────────────────────────────
  const [biodata, setBiodata] = useState(null);
  const [biodataForm, setBiodataForm] = useState({
    namaLengkap: "", tanggalLahir: "", tempatLahir: "", jenisKelamin: "",
    noHp: "", alamat: "", pekerjaan: "", ktpUrl: "", kkUrl: "", fotoUrl: ""
  });
  const [biodataSaving, setBiodataSaving] = useState(false);
  const [biodataMsg, setBiodataMsg] = useState(null);
  const [biodataFiles, setBiodataFiles] = useState({ ktpUrl: null, kkUrl: null, fotoUrl: null });

  // ── Laporan ─────────────────────────────────────────────────────────────────
  const [laporanList, setLaporanList] = useState([]);
  const [newKategori, setNewKategori] = useState("");
  const [newKendala, setNewKendala] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [notifReport, setNotifReport] = useState(null);

  // ── Invite patungan ─────────────────────────────────────────────────────────
  const [inviteList, setInviteList] = useState([]);
  const [inviteTargetId, setInviteTargetId] = useState("");
  const [inviteMsg, setInviteMsg] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // ── Sewa ────────────────────────────────────────────────────────────────────
  const [calcTipe, setCalcTipe] = useState("solo");
  const [calcDurasi, setCalcDurasi] = useState(6);
  const [apiResult, setApiResult] = useState(null);
  const [showSewaForm, setShowSewaForm] = useState(false);
  const [sewaMsg, setSewaMsg] = useState(null);
  const [pengajuanList, setPengajuanList] = useState([]);

  // ── Notifikasi pengajuan sewa ────────────────────────────────────────────────
  const [pengajuanSewaList, setPengajuanSewaList] = useState([]);

  // ── Image preview ────────────────────────────────────────────────────────────
  const [previewUrl, setPreviewUrl] = useState(null);

  // ── Fetch data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    // Fetch biodata
    fetch(`/api/biodata/${currentUser.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setBiodata(data);
          setBiodataForm({
            namaLengkap: data.namaLengkap || "", tanggalLahir: data.tanggalLahir || "",
            tempatLahir: data.tempatLahir || "", jenisKelamin: data.jenisKelamin || "",
            noHp: data.noHp || "", alamat: data.alamat || "", pekerjaan: data.pekerjaan || "",
            ktpUrl: data.ktpUrl || "", kkUrl: data.kkUrl || "", fotoUrl: data.fotoUrl || ""
          });
        }
      }).catch(() => {});

    // Fetch invites
    fetch(`/api/invite/${currentUser.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(setInviteList).catch(() => {});

    // Fetch laporan
    fetch(`/api/laporan?userId=${currentUser.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(setLaporanList).catch(() => {});

    // Fetch pengajuan sewa user
    fetch(`/api/pengajuan/${currentUser.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(setPengajuanSewaList).catch(() => {});

    // Fetch kost list
    fetch("/api/kost/medan")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setActiveKamarList(data); })
      .catch(() => {});
  }, [currentUser]);

  // ── Kalkulasi harga ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedKamar) return;
    const harga = selectedKamar.hargaDasar;
    const total = calcTipe === "solo" ? harga * calcDurasi : (harga / 2) * calcDurasi;
    setApiResult({
      totalTagihanHasil: total,
      formulaPBO: calcTipe === "solo"
        ? `Total = Rp ${fmt(harga)} × ${calcDurasi} bln`
        : `Total = (Rp ${fmt(harga)} ÷ 2) × ${calcDurasi} bln`,
    });
  }, [calcTipe, calcDurasi, selectedKamar]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBiodataFiles(prev => ({ ...prev, [key]: { name: file.name, url } }));
    setBiodataForm(prev => ({ ...prev, [key]: file.name }));
  };

  const handleSaveBiodata = async (e) => {
    e.preventDefault();
    setBiodataSaving(true);
    try {
      const r = await fetch(`/api/biodata/${currentUser.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(biodataForm)
      });
      if (r.ok) {
        const data = await r.json();
        setBiodata(data.biodata);
        setBiodataMsg({ type: "success", text: "Data diri berhasil disimpan! Menunggu verifikasi admin." });
      } else { throw new Error(); }
    } catch {
      setBiodataMsg({ type: "error", text: "Gagal menyimpan, coba lagi." });
    } finally {
      setBiodataSaving(false);
      setTimeout(() => setBiodataMsg(null), 4000);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!newKategori || !newKendala) return;
    const newRep = {
      id: `REP-${Date.now()}`, userId: currentUser.id,
      tanggal: new Date().toLocaleDateString("id-ID"),
      kategori: newKategori === "pipa" ? "Pipa Air" : newKategori === "listrik" ? "Listrik" : newKategori === "perabot" ? "Peralatan" : "Lainnya",
      kendala: newKendala, status: "BARU", detail: newDetail || "-"
    };
    try {
      const r = await fetch("/api/laporan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kategori: newRep.kategori, kendala: newKendala, detail: newDetail, userId: currentUser.id }),
      });
      if (r.ok) { const d = await r.json(); setLaporanList(prev => [d, ...prev]); }
      else setLaporanList(prev => [newRep, ...prev]);
    } catch { setLaporanList(prev => [newRep, ...prev]); }
    setNewKategori(""); setNewKendala(""); setNewDetail("");
    setNotifReport("Laporan berhasil dikirim!");
    setTimeout(() => setNotifReport(null), 4000);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteTargetId || !selectedKamar) return;
    try {
      const r = await fetch("/api/invite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: currentUser.id, fromUserName: currentUser.name,
          toUserId: inviteTargetId, kamarId: selectedKamar.id,
          namaKost: selectedKamar.namaKost, hargaDasar: selectedKamar.hargaDasar,
          jumlahOrang: 2, durasi: calcDurasi
        })
      });
      const data = await r.json();
      if (r.ok) {
        setInviteMsg({ type: "success", text: "Undangan berhasil dikirim!" });
        setInviteTargetId(""); setShowInviteForm(false);
        setInviteList(prev => [...prev, data.data || data]);
      } else setInviteMsg({ type: "error", text: data.error || "Gagal mengirim." });
    } catch { setInviteMsg({ type: "error", text: "Gagal tersambung ke server." }); }
    setTimeout(() => setInviteMsg(null), 4000);
  };

  const handleRespondInvite = async (id, status) => {
    try {
      await fetch(`/api/invite/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch { /* offline */ }
    setInviteList(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const handleSubmitSewa = async () => {
    if (!biodata?.isVerified) {
      setSewaMsg({ type: "error", text: "Data diri Anda belum diverifikasi admin." });
      setTimeout(() => setSewaMsg(null), 5000);
      return;
    }
    try {
      const r = await fetch("/api/pengajuan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(currentUser.id), kamarId: selectedKamar.id,
          tipeSewa: calcTipe, durasiBulan: calcDurasi,
          totalTagihan: apiResult?.totalTagihanHasil,
        })
      });
      if (r.ok) {
        const data = await r.json();
        setPengajuanSewaList(prev => [...prev, data.data || data]);
        setSewaMsg({ type: "success", text: "Pengajuan berhasil dikirim! Tunggu konfirmasi owner." });
        setShowSewaForm(false);
      }
    } catch { setSewaMsg({ type: "error", text: "Gagal mengirim pengajuan." }); }
    setTimeout(() => setSewaMsg(null), 5000);
  };

  // Derived
  const pendingInviteCount = inviteList.filter(i => i.toUserId === currentUser?.id && i.status === "PENDING").length;
  const pendingSewaCount = pengajuanSewaList.filter(p => p.status === "PENDING" || p.status === "MENUNGGU").length;
  const totalNotif = pendingInviteCount + pendingSewaCount;

  const filteredKamar = INITIAL_KAMAR_KOST.filter(k => {
    if (filterLokasi !== "Semua" && k.daerah !== filterLokasi) return false;
    if (filterKategori !== "Semua" && k.kategori !== filterKategori) return false;
    return true;
  });

  // Current kamar image based on tipe
  const currentImage = selectedKamar
    ? (calcTipe === "patungan" && selectedKamar.fotoPatungan?.length
        ? selectedKamar.fotoPatungan[0]
        : selectedKamar.fotoSolo?.[0] || selectedKamar.image)
    : null;

  const currentDesc = selectedKamar
    ? (calcTipe === "patungan" ? selectedKamar.descriptionPatungan : selectedKamar.description)
    : null;

  const currentAvailable = selectedKamar
    ? (calcTipe === "solo" ? selectedKamar.availableRoomsSolo : selectedKamar.availableRoomsPatungan)
    : 0;

  return (
    <div className="flex-1 flex flex-col lg:flex-row relative">
      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-64 bg-white border-r border-neutral-200 p-5 flex flex-col gap-4 shrink-0 lg:sticky lg:top-0 h-auto lg:h-[calc(100vh-68px)]">
        {/* Profile */}
        <div className="hidden lg:flex flex-col gap-2 px-1 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-800">{currentUser.name}</h4>
              <p className="text-[9px] text-neutral-400 font-mono">ID: {currentUser.id}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${
            biodata?.verifikasiStatus === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
            biodata?.verifikasiStatus === "PENDING" ? "bg-amber-100 text-amber-700" :
            "bg-neutral-100 text-neutral-500"
          }`}>
            {biodata?.verifikasiStatus === "DISETUJUI" ? "✓ Terverifikasi" :
             biodata?.verifikasiStatus === "PENDING" ? "⏳ Menunggu Verifikasi" : "⚠ Belum Lengkap"}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {[
            { key: "beranda", icon: <Home className="h-4 w-4" />, label: "Cari Kost" },
            { key: "biodata", icon: <User className="h-4 w-4" />, label: "Data Diri" },
            { key: "kamar-saya", icon: <DoorOpen className="h-4 w-4" />, label: "Kamar Saya", hidden: !currentUser.hasKamar },
            { key: "notifikasi", icon: <BellIcon className="h-4 w-4" />, label: "Notifikasi", badge: totalNotif },
          ].filter(i => !i.hidden).map(item => (
            <button key={item.key}
              onClick={() => { setUserPage(item.key); setSelectedKamar(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${userPage === item.key ? "bg-emerald-50 text-emerald-800" : "text-neutral-600 hover:bg-neutral-50"}`}>
              {item.icon} {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ── BIODATA ── */}
          {userPage === "biodata" && (
            <motion.div key="biodata" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Data Diri</h2>
                <p className="text-xs text-neutral-500 mt-1">Lengkapi data diri. Setelah disimpan, admin akan memverifikasi sebelum kamu bisa menyewa.</p>
              </div>

              {/* Status banner */}
              {biodata?.verifikasiStatus === "DISETUJUI" && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex gap-3 items-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div><p className="text-sm font-bold text-emerald-800">Data Diri Terverifikasi ✓</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Kamu sudah bisa menyewa kamar kost.</p></div>
                </div>
              )}
              {biodata?.verifikasiStatus === "PENDING" && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex gap-3 items-center">
                  <Clock className="h-6 w-6 text-amber-600 shrink-0" />
                  <div><p className="text-sm font-bold text-amber-800">Menunggu Verifikasi Admin</p>
                  <p className="text-xs text-amber-700 mt-0.5">Data sedang ditinjau. Kamu bisa menyewa setelah disetujui.</p></div>
                </div>
              )}
              {biodata?.verifikasiStatus === "DITOLAK" && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex gap-3 items-center">
                  <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                  <div><p className="text-sm font-bold text-red-800">Verifikasi Ditolak</p>
                  <p className="text-xs text-red-700 mt-0.5">Perbaiki data dan kirim ulang.</p>
                  {biodata?.komentarAdmin && <p className="text-xs text-red-700 mt-1 font-bold">💬 Admin: {biodata.komentarAdmin}</p>}</div>
                </div>
              )}

              {biodataMsg && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${biodataMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                  {biodataMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveBiodata} className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-5">
                <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-3">Informasi Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Nama Lengkap", key: "namaLengkap", type: "text", placeholder: "Nama sesuai KTP" },
                    { label: "Tempat Lahir", key: "tempatLahir", type: "text", placeholder: "Kota kelahiran" },
                    { label: "Tanggal Lahir", key: "tanggalLahir", type: "date" },
                    { label: "No. HP / WhatsApp", key: "noHp", type: "tel", placeholder: "08xxxxxxxxxx" },
                    { label: "Pekerjaan", key: "pekerjaan", type: "text", placeholder: "Mahasiswa / Karyawan / dll" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder || ""} value={biodataForm[f.key]}
                        onChange={e => setBiodataForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition" required />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">Jenis Kelamin</label>
                    <select value={biodataForm.jenisKelamin} onChange={e => setBiodataForm(p => ({ ...p, jenisKelamin: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition" required>
                      <option value="">Pilih...</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">Alamat Lengkap</label>
                  <textarea rows={2} placeholder="Jl. Contoh No. 1, Kota" value={biodataForm.alamat}
                    onChange={e => setBiodataForm(p => ({ ...p, alamat: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition resize-none" required />
                </div>

                <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-3 mt-2">Upload Berkas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[{ label: "KTP", key: "ktpUrl" }, { label: "KK", key: "kkUrl" }, { label: "Foto Diri", key: "fotoUrl" }].map(f => (
                    <div key={f.key} className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition ${biodataFiles[f.key] ? "border-emerald-400 bg-emerald-50/40" : "border-neutral-200 hover:border-emerald-400"}`}>
                      <Upload className={`h-6 w-6 ${biodataFiles[f.key] ? "text-emerald-600" : "text-neutral-400"}`} />
                      <label className="text-xs font-bold text-neutral-600 text-center">{f.label}</label>
                      {biodataFiles[f.key] ? (
                        <div className="flex flex-col items-center gap-1 w-full">
                          {biodataFiles[f.key].url && (
                            <div className="w-full h-24 rounded-lg overflow-hidden border border-emerald-200 cursor-pointer relative group"
                              onClick={() => setPreviewUrl(biodataFiles[f.key].url)}>
                              <img src={biodataFiles[f.key].url} alt={f.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <Eye className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> {biodataFiles[f.key].name}
                          </span>
                          <div className="flex gap-2 w-full">
                            <button type="button" onClick={() => setPreviewUrl(biodataFiles[f.key].url)}
                              className="flex-1 text-[10px] text-emerald-700 font-bold border border-emerald-300 rounded-lg py-1 hover:bg-emerald-50 transition flex items-center justify-center gap-1">
                              <Eye className="h-3 w-3" /> Lihat
                            </button>
                            <label className="flex-1 cursor-pointer">
                              <div className="text-[10px] text-neutral-600 border border-neutral-200 rounded-lg py-1 hover:bg-neutral-100 transition text-center">Ganti</div>
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => handleFileChange(e, f.key)} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full cursor-pointer">
                          <div className="w-full py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[10px] font-bold rounded-lg text-center transition">Pilih File</div>
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => handleFileChange(e, f.key)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={biodataSaving}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2 disabled:opacity-50">
                  <CheckCircle className="h-4 w-4" />
                  {biodataSaving ? "Menyimpan..." : "Simpan Data Diri"}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── KAMAR SAYA ── */}
          {userPage === "kamar-saya" && (
            <motion.div key="kamar-saya" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-neutral-900">Kamar Saya</h2>
              <div className="bg-emerald-800 text-white rounded-2xl p-5 flex gap-4 items-center">
                <div className="p-3 bg-emerald-700 rounded-xl"><Home className="h-8 w-8" /></div>
                <div><p className="text-[10px] text-emerald-300 font-bold uppercase">Kamar Aktif</p>
                <h3 className="text-lg font-black">{currentUser.namaKost}</h3></div>
              </div>
              <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl">
                {[
                  { key: "laporan", label: "Laporan Kerusakan" },
                  { key: "masa-sewa", label: "Masa Sewa" },
                  { key: "fasilitas", label: "Fasilitas" },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setKamarSayaTab(tab.key)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${kamarSayaTab === tab.key ? "bg-white text-emerald-800 shadow-sm" : "text-neutral-500"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {kamarSayaTab === "laporan" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
                    <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-2.5 py-0.5 rounded-full self-start">BUAT LAPORAN</span>
                    {notifReport && <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">{notifReport}</div>}
                    <form onSubmit={handleAddReport} className="flex flex-col gap-3">
                      <select required value={newKategori} onChange={e => setNewKategori(e.target.value)}
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600">
                        <option value="">Kategori...</option>
                        <option value="pipa">Pipa Air</option><option value="listrik">Listrik</option>
                        <option value="perabot">Perabot</option><option value="lainnya">Lainnya</option>
                      </select>
                      <input type="text" required placeholder="Detail kendala..." value={newKendala}
                        onChange={e => setNewKendala(e.target.value)}
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                      <textarea rows={2} placeholder="Penjelasan (opsional)..." value={newDetail}
                        onChange={e => setNewDetail(e.target.value)}
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none" />
                      <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-1.5">
                        <Send className="h-3.5 w-3.5" /> Kirim Laporan
                      </button>
                    </form>
                  </div>
                  <div className="lg:col-span-8">
                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead><tr className="bg-neutral-50 text-[10px] uppercase text-neutral-500 border-b border-neutral-200">
                          <th className="p-3">Tgl</th><th className="p-3">Kategori</th><th className="p-3">Kendala</th><th className="p-3">Status</th>
                        </tr></thead>
                        <tbody className="text-xs divide-y divide-neutral-100">
                          {laporanList.length === 0
                            ? <tr><td colSpan={4} className="p-8 text-center text-neutral-400">Belum ada laporan</td></tr>
                            : laporanList.map(item => (
                              <tr key={item.id} className="hover:bg-neutral-50">
                                <td className="p-3 text-neutral-500">{item.tanggal}</td>
                                <td className="p-3"><span className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-[10px]">{item.kategori}</span></td>
                                <td className="p-3 font-bold">{item.kendala}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${item.status === "SELESAI" ? "bg-emerald-50 text-emerald-700" : item.status === "BARU" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {kamarSayaTab === "masa-sewa" && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <p className="text-sm font-bold text-neutral-700 mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-700" /> Riwayat Pembayaran</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { bulan: "Oktober 2025", jumlah: 1800000, status: "LUNAS" },
                      { bulan: "November 2025", jumlah: 1800000, status: "LUNAS" },
                      { bulan: "Februari 2026", jumlah: 1800000, status: "MENUNGGU" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2.5 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
                        <p className="text-xs font-bold">{item.bulan}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-bold">Rp {fmt(item.jumlah)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "LUNAS" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {kamarSayaTab === "fasilitas" && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <p className="text-sm font-bold text-neutral-800 mb-4">Fasilitas Kamar</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { nama: "WiFi Cepat", ada: true, icon: "📶" }, { nama: "AC", ada: true, icon: "❄️" },
                      { nama: "Kamar Mandi Dalam", ada: true, icon: "🚿" }, { nama: "Kasur Springbed", ada: true, icon: "🛏️" },
                      { nama: "Meja Belajar", ada: true, icon: "📚" }, { nama: "Parkir Motor", ada: true, icon: "🏍️" },
                    ].map(f => (
                      <div key={f.nama} className={`flex items-center gap-3 p-3 rounded-xl border ${f.ada ? "bg-emerald-50 border-emerald-200" : "bg-neutral-50 border-neutral-200 opacity-50"}`}>
                        <span className="text-lg">{f.icon}</span>
                        <div><p className="text-xs font-bold text-neutral-800">{f.nama}</p>
                        <p className={`text-[10px] font-bold ${f.ada ? "text-emerald-600" : "text-neutral-400"}`}>{f.ada ? "Tersedia" : "Tidak Ada"}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── NOTIFIKASI ── */}
          {userPage === "notifikasi" && (
            <motion.div key="notif" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              <div><h2 className="text-xl font-bold text-neutral-900">Notifikasi</h2>
              <p className="text-xs text-neutral-500 mt-1">Status pengajuan sewa dan undangan patungan.</p></div>

              {/* Status Pengajuan Sewa */}
              {pengajuanSewaList.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Status Pengajuan Sewa</h3>
                  <div className="flex flex-col gap-3">
                    {pengajuanSewaList.map(app => (
                      <div key={app.id} className={`bg-white border rounded-2xl p-5 ${
                        app.status === "PENDING" || app.status === "MENUNGGU" ? "border-amber-200"
                        : app.status === "DITERIMA" || app.status === "DISETUJUI" ? "border-emerald-200"
                        : "border-red-200"}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border mb-2 inline-block ${
                              (app.status === "PENDING" || app.status === "MENUNGGU") ? "bg-amber-100 text-amber-700 border-amber-200"
                              : (app.status === "DITERIMA" || app.status === "DISETUJUI") ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-red-100 text-red-700 border-red-200"}`}>
                              {app.status || "MENUNGGU"}
                            </span>
                            <p className="text-xs font-bold text-neutral-800">{app.namaKost || `Kamar #${app.kamarId}`}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Durasi: {app.durasiBulan} bulan • Tipe: {app.tipeSewa}</p>
                          </div>
                          {(app.status === "PENDING" || app.status === "MENUNGGU") && app.noWaOwner && (
                            <a href={`https://wa.me/${app.noWaOwner}?text=Halo, saya ${currentUser.name}, ingin menanyakan pengajuan sewa saya.`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold hover:bg-green-100 transition">
                              💬 Hubungi Pemilik
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Undangan Patungan */}
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Undangan Patungan (Roommate Invite)</h3>
                {inviteList.filter(i => i.toUserId === currentUser.id).length === 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center">
                    <BellIcon className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-neutral-500">Tidak ada undangan patungan</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {inviteList.filter(i => i.toUserId === currentUser.id).map(invite => (
                      <div key={invite.id} className={`bg-white border rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center ${invite.status === "PENDING" ? "border-emerald-300 shadow-sm" : "border-neutral-200"}`}>
                        <div className="flex-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block ${invite.status === "PENDING" ? "bg-blue-100 text-blue-700" : invite.status === "DITERIMA" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {invite.status}
                          </span>
                          <h4 className="text-sm font-bold text-neutral-800">Undangan dari {invite.fromUserName}</h4>
                          <p className="text-xs text-neutral-500 mt-0.5">{invite.namaKost} • 2 orang • {invite.durasi} bulan</p>
                          <p className="text-xs font-bold text-emerald-700 mt-1">Rp {fmt(Math.round(invite.hargaDasar / 2))}/bulan/orang</p>
                        </div>
                        {invite.status === "PENDING" && (
                          <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => handleRespondInvite(invite.id, "DITOLAK")}
                              className="flex-1 md:flex-none px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg transition">Tolak</button>
                            <button onClick={() => handleRespondInvite(invite.id, "DITERIMA")}
                              className="flex-1 md:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition">Terima</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── BERANDA ── */}
          {userPage === "beranda" && (
            <motion.div key="beranda" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              {!biodata?.isVerified && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex gap-3 items-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    {biodata?.verifikasiStatus === "PENDING"
                      ? <><p className="text-xs font-bold text-amber-800">⏳ Menunggu verifikasi admin</p><p className="text-xs text-amber-700">Tunggu konfirmasi admin untuk bisa menyewa.</p></>
                      : <><p className="text-xs font-bold text-amber-800">Data diri belum lengkap</p><p className="text-xs text-amber-700">Lengkapi di menu Data Diri.</p></>
                    }
                  </div>
                  {biodata?.verifikasiStatus !== "PENDING" && (
                    <button onClick={() => setUserPage("biodata")} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition shrink-0">Lengkapi</button>
                  )}
                </div>
              )}
              {sewaMsg && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${sewaMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                  {sewaMsg.text}
                </div>
              )}

              {selectedKamar ? (
                <div className="flex flex-col gap-6">
                  <button onClick={() => { setSelectedKamar(null); setShowInviteForm(false); }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kost
                  </button>

                  {/* Foto sesuai tipe */}
                  <div className="rounded-2xl overflow-hidden h-64 relative shadow-sm">
                    <img src={currentImage || selectedKamar.image} alt={selectedKamar.namaKost}
                      className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className={`absolute top-4 left-4 font-bold text-xs px-3 py-1 rounded-full shadow ${currentAvailable === 0 ? "bg-neutral-600/90 text-white" : "bg-emerald-900/90 text-white"}`}>
                      {currentAvailable === 0 ? "Tidak Tersedia" : `${currentAvailable} Kamar Tersedia`}
                    </div>
                    <span className="absolute top-4 right-4 bg-white/90 text-neutral-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {selectedKamar.kategori}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-950">{selectedKamar.namaKost}</h2>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-700" /> {selectedKamar.daerah}, Medan
                          <span className="text-neutral-300">•</span>
                          <span className="text-amber-500 font-bold">★ {selectedKamar.rating}</span>
                          <span className="text-neutral-300">•</span>
                          <span className="font-bold text-neutral-600">{selectedKamar.kategori}</span>
                        </div>
                      </div>
                      <hr className="border-neutral-200" />
                      {/* Deskripsi sesuai tipe */}
                      <p className="text-xs text-neutral-600 leading-relaxed">{currentDesc}</p>
                      {/* Fasilitas */}
                      <div className="flex flex-wrap gap-2">
                        {selectedKamar.wifiCepat && <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">📶 WiFi</span>}
                        {selectedKamar.ac && <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">❄️ AC</span>}
                        {selectedKamar.kamarMandiDalam && <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-200">🚿 KM Dalam</span>}
                        {selectedKamar.kasurSpringbed && <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-200">🛏️ Springbed</span>}
                        {selectedKamar.mejaBelajar && <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-neutral-200">📚 Meja Belajar</span>}
                        {selectedKamar.dapurBersama && <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-yellow-200">🍳 Dapur</span>}
                      </div>
                    </div>

                    <div className="lg:col-span-5">
                      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
                        <div>
                          <span className="text-[11px] text-neutral-400 uppercase tracking-widest">Mulai Dari</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <h3 className="text-2xl font-black text-emerald-800">Rp {fmt(selectedKamar.hargaDasar)}</h3>
                            <span className="text-xs text-neutral-500">/ bulan</span>
                          </div>
                        </div>
                        <hr className="border-dashed border-neutral-200" />

                        {/* Opsi sewa */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: "solo", label: "Sewa Sendiri", sub: `${fmt(selectedKamar.hargaDasar)}/bln`, avail: selectedKamar.availableRoomsSolo },
                            { key: "patungan", label: "Patungan (2 org)", sub: `${fmt(Math.round(selectedKamar.hargaDasar / 2))}/bln/org`, avail: selectedKamar.availableRoomsPatungan },
                          ].map(opt => (
                            <button key={opt.key} onClick={() => setCalcTipe(opt.key)}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all text-left ${calcTipe === opt.key ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>
                              <div className="font-bold">{opt.label}</div>
                              <div className="text-[10px] font-normal mt-0.5">Rp {opt.sub}</div>
                              <div className={`text-[9px] font-bold mt-1 ${opt.avail > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {opt.avail > 0 ? `${opt.avail} tersedia` : "Tidak tersedia"}
                              </div>
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-500 mb-1">Durasi Sewa</label>
                          <select value={calcDurasi} onChange={e => setCalcDurasi(Number(e.target.value))}
                            className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                            <option value={1}>1 Bulan</option><option value={3}>3 Bulan</option>
                            <option value={6}>6 Bulan</option><option value={12}>12 Bulan</option>
                          </select>
                        </div>

                        {apiResult && (
                          <div className="bg-emerald-950 text-emerald-100 rounded-xl p-3 text-xs font-mono">
                            <div className="flex justify-between text-emerald-400 text-[10px] border-b border-emerald-800/40 pb-1.5 mb-1.5">
                              <span>TOTAL TAGIHAN</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-emerald-300">Total</span>
                              <span className="text-emerald-300">Rp {fmt(apiResult.totalTagihanHasil)}</span>
                            </div>
                            <p className="text-[10px] text-emerald-400 mt-1">{apiResult.formulaPBO}</p>
                          </div>
                        )}

                        {/* Tombol Tanya Pemilik */}
                        {selectedKamar.noWaOwner && (
                          <a href={`https://wa.me/${selectedKamar.noWaOwner}?text=Halo, saya ${currentUser.name}, ingin menanyakan kost ${selectedKamar.namaKost}.`}
                            target="_blank" rel="noreferrer"
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2">
                            💬 Tanya Pemilik (WhatsApp)
                          </a>
                        )}

                        {/* Tombol Ajukan Sewa */}
                        {currentAvailable === 0 ? (
                          <div className="w-full py-3 bg-neutral-200 text-neutral-500 font-bold rounded-xl text-sm text-center">Tidak Tersedia</div>
                        ) : !biodata?.isVerified ? (
                          <button onClick={() => setUserPage("biodata")}
                            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {biodata?.verifikasiStatus === "PENDING" ? "Menunggu Verifikasi Admin" : "Lengkapi Data Diri Dulu"}
                          </button>
                        ) : (
                          <button onClick={() => setShowSewaForm(true)}
                            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2">
                            <Home className="h-4 w-4" /> Ajukan Sewa Kamar
                          </button>
                        )}

                        {/* Invite roommate (patungan saja) */}
                        {calcTipe === "patungan" && biodata?.isVerified && currentAvailable > 0 && (
                          <div className="border-t border-neutral-100 pt-3">
                            <button onClick={() => setShowInviteForm(f => !f)}
                              className="w-full py-2 border-2 border-dashed border-emerald-300 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                              <Users className="h-3.5 w-3.5" /> Undang Teman Patungan
                            </button>
                            {showInviteForm && (
                              <form onSubmit={handleSendInvite} className="mt-3 flex flex-col gap-2">
                                {inviteMsg && <div className={`p-2 rounded-lg text-xs font-medium ${inviteMsg.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{inviteMsg.text}</div>}
                                <label className="text-[10px] font-bold text-neutral-600">ID Akun Teman</label>
                                <input type="text" placeholder="Username atau ID teman..." value={inviteTargetId}
                                  onChange={e => setInviteTargetId(e.target.value)}
                                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600" required />
                                <button type="submit"
                                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5">
                                  <Send className="h-3 w-3" /> Kirim Undangan
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal konfirmasi sewa */}
                  {showSewaForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-neutral-900">Konfirmasi Pengajuan Sewa</h3>
                        <div className="bg-neutral-50 rounded-xl p-4 flex flex-col gap-2 text-xs">
                          <div className="flex justify-between"><span className="text-neutral-500">Kost</span><span className="font-bold">{selectedKamar.namaKost}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500">Tipe</span><span className="font-bold capitalize">{calcTipe === "solo" ? "Sewa Sendiri" : "Patungan (2 orang)"}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-500">Durasi</span><span className="font-bold">{calcDurasi} Bulan</span></div>
                          <div className="flex justify-between border-t border-neutral-200 pt-2 mt-1">
                            <span className="font-bold text-neutral-700">Total</span>
                            <span className="font-black text-emerald-800">Rp {fmt(apiResult?.totalTagihanHasil)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500">Pengajuan akan dikirim ke pemilik kost. Tunggu konfirmasi.</p>
                        <div className="flex gap-3">
                          <button onClick={() => setShowSewaForm(false)}
                            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition">Batal</button>
                          <button onClick={handleSubmitSewa}
                            className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl transition">Kirim Pengajuan</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Hero */}
                  <div className="relative rounded-2xl overflow-hidden bg-neutral-900 py-12 px-6 text-center text-white shadow">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-25"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-[10px] bg-emerald-800 text-emerald-300 px-3 py-1 rounded-full font-bold uppercase tracking-widest mb-3 border border-emerald-700/40">Sewa Patungan Termurah di Medan</span>
                      <h2 className="text-3xl font-black tracking-tight leading-tight max-w-2xl mb-2">
                        Cari Kost Nyaman di Medan, <span className="text-emerald-400">Patungan Biar Ringan</span>
                      </h2>
                    </div>
                  </div>

                  {/* Filter */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 mb-1">Daerah</label>
                      <select value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)}
                        className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                        <option value="Semua">Semua Daerah</option>
                        <option value="Padang Bulan">Padang Bulan</option>
                        <option value="Dr. Mansyur">Dr. Mansyur</option>
                        <option value="Setia Budi">Setia Budi</option>
                        <option value="Helvetia">Helvetia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 mb-1">Kategori</label>
                      <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)}
                        className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                        <option value="Semua">Semua</option>
                        <option value="Putra">Putra</option>
                        <option value="Putri">Putri</option>
                        <option value="Campur">Campur</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-end">
                      <button onClick={() => setFilterLokasi("Semua") || setFilterKategori("Semua")}
                        className="w-full bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-emerald-800 transition shadow flex items-center justify-center gap-1.5">
                        <Search className="h-4 w-4" /> Cari Kost
                      </button>
                    </div>
                  </div>

                  {/* Grid kost */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredKamar.map(kamar => {
                      const isFull = kamar.availableRooms === 0;
                      return (
                        <div key={kamar.id} onClick={() => !isFull && setSelectedKamar(kamar)}
                          className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${isFull ? "opacity-60 grayscale cursor-not-allowed border-neutral-200" : "border-neutral-200 group cursor-pointer hover:shadow-md hover:border-emerald-700/30"}`}>
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img src={kamar.image} alt={kamar.namaKost} referrerPolicy="no-referrer"
                              className={`w-full h-full object-cover transition-transform duration-300 ${!isFull && "group-hover:scale-105"}`} />
                            <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded shadow ${isFull ? "bg-neutral-600 text-white" : "bg-white/95 text-neutral-800"}`}>
                              {isFull ? "Tidak Tersedia" : "Tersedia"}
                            </span>
                            <span className="absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-700/90 text-white">
                              {kamar.kategori}
                            </span>
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className={`text-xs font-bold leading-snug truncate max-w-[80%] ${isFull ? "text-neutral-500" : "text-neutral-800 group-hover:text-emerald-800 transition"}`}>
                                {kamar.namaKost}
                              </h4>
                              <span className="text-xs font-extrabold text-amber-500 shrink-0">★ {kamar.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                              <MapPin className="h-3.5 w-3.5" /> {kamar.daerah}
                            </div>
                            {!isFull && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full self-start flex items-center gap-1">
                                <Users className="h-2.5 w-2.5" /> Bisa Patungan
                              </span>
                            )}
                            <div className="border-t border-neutral-100 pt-2 mt-1 flex justify-between items-end">
                              <div>
                                <span className="text-[10px] text-neutral-400">Mulai dari</span>
                                <p className={`text-sm font-black ${isFull ? "text-neutral-400" : "text-emerald-800"}`}>
                                  Rp {fmt(kamar.hargaDasar)}<span className="text-xs font-normal text-neutral-400">/bln</span>
                                </p>
                              </div>
                              {!isFull && <span className="text-[10px] font-bold text-emerald-700 group-hover:translate-x-1 transition flex items-center gap-0.5">Pilih <ArrowRight className="h-3 w-3" /></span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)} className="absolute -top-10 right-0 text-white text-sm font-bold flex items-center gap-1">
              <X className="h-5 w-5" /> Tutup
            </button>
            <img src={previewUrl} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
