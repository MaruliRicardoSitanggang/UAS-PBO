import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Send,
  Home,
  Bell as BellIcon,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Upload,
  Eye,
  DoorOpen,
  Wrench,
  AlertCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  MessageCircle,
  CalendarDays,
  Users,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const fmt = (n) => n?.toLocaleString("id-ID");
const API = "http://localhost:8080";

// Upload satu file, kembalikan URL
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Upload gagal");
  return data.url;
}

// ── Kategori badge ────────────────────────────────────────────────────────────
const KATEGORI_COLOR = {
  Putra: "bg-blue-100 text-blue-700 border-blue-200",
  Putri: "bg-pink-100 text-pink-700 border-pink-200",
  Campur: "bg-purple-100 text-purple-700 border-purple-200",
};

function KategoriBadge({ kategori }) {
  if (!kategori) return null;
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${KATEGORI_COLOR[kategori] || "bg-neutral-100 text-neutral-500"}`}
    >
      {kategori === "Putra"
        ? "🧑 Putra"
        : kategori === "Putri"
          ? "👩 Putri"
          : "👫 Campur"}
    </span>
  );
}

// ── KostCard ──────────────────────────────────────────────────────────────────
function KostCard({ kost, onSelect }) {
  const tersedia = kost.status === "Tersedia";

  // Ambil foto pertama dari fotoUrls (comma-separated hasil upload owner).
  // Fallback ke kost.image (representatif dari sync), lalu placeholder.
  const fotoSrc = (() => {
    if (kost.fotoUrls) {
      const first = kost.fotoUrls.split(",")[0].trim();
      if (first)
        return first.startsWith("http")
          ? first
          : `http://localhost:8080${first}`;
    }
    if (kost.image) {
      return kost.image.startsWith("http")
        ? kost.image
        : `http://localhost:8080${kost.image}`;
    }
    return null; // tampilkan placeholder div
  })();

  return (
    <div
      className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer group"
      onClick={() => tersedia && onSelect(kost)}
    >
      {/* Foto */}
      <div className="h-40 overflow-hidden relative bg-neutral-100">
        {fotoSrc ? (
          <img
            src={fotoSrc}
            alt={kost.namaKost}
            className="w-full h-full object-cover group-hover:scale-105 transition"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🏠</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <KategoriBadge kategori={kost.kategori} />
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              tersedia
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-neutral-200 text-neutral-500 border-neutral-300"
            }`}
          >
            {tersedia ? "✓ Tersedia" : "✗ Tidak Tersedia"}
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-sm font-bold text-neutral-900 leading-snug">
          {kost.namaKost}
        </h4>
        <p className="text-xs text-neutral-500 flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {kost.daerah}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-black text-emerald-700">
            Rp {fmt(kost.hargaDasar)}
            <span className="text-[10px] font-normal text-neutral-400">
              /bln
            </span>
          </p>
          {kost.rating > 0 && (
            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{" "}
              {kost.rating}
            </span>
          )}
        </div>
        <div className="flex gap-3 text-[10px] text-neutral-500">
          {kost.availableRoomsSolo > 0 && (
            <span>👤 {kost.availableRoomsSolo} kamar solo</span>
          )}
          {kost.availableRoomsDuo > 0 && (
            <span>👥 {kost.availableRoomsDuo} kamar duo</span>
          )}
        </div>
        {!tersedia && (
          <p className="text-[10px] text-neutral-400 italic">
            Kamar penuh atau sedang maintenance
          </p>
        )}
      </div>
    </div>
  );
}

// ── DetailKamar ───────────────────────────────────────────────────────────────
function DetailKamar({
  kost,
  currentUser,
  biodata,
  onBack,
  onPengajuanSubmit,
}) {
  const [tipeSewa, setTipeSewa] = useState("SOLO");
  const [durasi, setDurasi] = useState(6);
  const [roommateId, setRoommateId] = useState("");
  const [roommateUser, setRoommateUser] = useState("");
  const [sewaMsg, setSewaMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isDuo = tipeSewa === "DUO";
  const harga = kost.hargaDasar || 0;
  const totalTagihan = isDuo ? (harga / 2) * durasi : harga * durasi;
  const available = isDuo
    ? kost.availableRoomsDuo || 0
    : kost.availableRoomsSolo || 0;

  // ── Foto dari upload owner ──
  // fotoUrls = comma-separated URL dari backend (e.g. "/uploads/a.jpg,/uploads/b.jpg")
  const fotoList = (() => {
    const raw = kost.fotoUrls || kost.image || "";
    return raw
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
      .map((u) => (u.startsWith("http") ? u : `http://localhost:8080${u}`));
  })();
  const [fotoIdx, setFotoIdx] = useState(0);
  const displayImg = fotoList[fotoIdx] || null;

  const handleSubmit = async () => {
    if (!biodata?.isVerified) {
      setSewaMsg({
        type: "error",
        text: "Data diri belum diverifikasi admin. Lengkapi Data Diri terlebih dahulu.",
      });
      setTimeout(() => setSewaMsg(null), 5000);
      return;
    }
    if (available <= 0) {
      setSewaMsg({
        type: "error",
        text: "Tidak ada kamar kosong untuk opsi ini.",
      });
      return;
    }
    if (isDuo && !roommateId.trim()) {
      setSewaMsg({
        type: "error",
        text: "Masukkan ID roommate untuk sewa 2 orang.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        userId: Number(currentUser.id),
        kamarId: kost.id, // ini infoKostId
        tipeSewa,
        durasiBulan: durasi,
        totalTagihan,
        roommateId: isDuo ? Number(roommateId) : null,
        roommateUsername: isDuo ? roommateUser : null,
      };
      const res = await fetch(`${API}/api/pengajuan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSewaMsg({
          type: "success",
          text: "Pengajuan berhasil! Tunggu konfirmasi dari owner.",
        });
        onPengajuanSubmit(data.data);
      } else throw new Error(data.error);
    } catch (err) {
      setSewaMsg({
        type: "error",
        text: err.message || "Gagal mengirim pengajuan.",
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setSewaMsg(null), 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-5"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-emerald-700 transition w-fit"
      >
        ← Kembali ke daftar kost
      </button>

      {/* Foto & info header */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {/* Foto utama */}
        <div className="h-56 overflow-hidden relative bg-neutral-100">
          {displayImg ? (
            <img
              src={displayImg}
              alt={kost.namaKost}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🏠</span>
            </div>
          )}
          {/* Panah navigasi foto */}
          {fotoList.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {fotoList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFotoIdx(i)}
                  className={`w-2 h-2 rounded-full transition ${i === fotoIdx ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Thumbnail strip jika ada > 1 foto */}
        {fotoList.length > 1 && (
          <div className="flex gap-2 p-3 bg-neutral-50 border-b border-neutral-100">
            {fotoList.map((url, i) => (
              <button
                key={i}
                onClick={() => setFotoIdx(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition ${i === fotoIdx ? "border-emerald-600" : "border-neutral-200 hover:border-neutral-300"}`}
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </button>
            ))}
          </div>
        )}
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-neutral-900">
                {kost.namaKost}
              </h2>
              <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {kost.daerah}
                {kost.alamatLengkap && ` — ${kost.alamatLengkap}`}
              </p>
            </div>
            <KategoriBadge kategori={kost.kategori} />
          </div>
          {kost.description && (
            <p className="text-xs text-neutral-600 leading-relaxed">
              {kost.description}
            </p>
          )}
          {/* Fasilitas */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {kost.wifiCepat && (
              <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">
                📶 WiFi
              </span>
            )}
            {kost.ac && (
              <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">
                ❄️ AC
              </span>
            )}
            {kost.parkir && (
              <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">
                🏍️ Parkir
              </span>
            )}
            {kost.laundry && (
              <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">
                👕 Laundry
              </span>
            )}
            {kost.dapur && (
              <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">
                🍳 Dapur
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Toggle SOLO / DUO */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-neutral-800">Opsi Sewa</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              key: "SOLO",
              label: "Sewa Sendiri",
              sub: "1 orang",
              avail: kost.availableRoomsSolo || 0,
              icon: "👤",
            },
            {
              key: "DUO",
              label: "Sewa 2 Orang",
              sub: "bagi 2",
              avail: kost.availableRoomsDuo || 0,
              icon: "👥",
            },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setTipeSewa(opt.key);
                setRoommateId("");
              }}
              className={`p-4 rounded-xl border-2 text-left transition ${
                tipeSewa === opt.key
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <p className="text-lg mb-1">{opt.icon}</p>
              <p className="text-xs font-black text-neutral-800">{opt.label}</p>
              <p className="text-[10px] text-neutral-500">{opt.sub}</p>
              <p
                className={`text-[10px] font-bold mt-1.5 ${opt.avail > 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {opt.avail > 0
                  ? `${opt.avail} kamar tersedia`
                  : "Tidak tersedia"}
              </p>
            </button>
          ))}
        </div>

        {/* Roommate input untuk DUO */}
        <AnimatePresence>
          {isDuo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                <Users className="h-3 w-3 inline mr-1" />
                ID User Roommate
              </label>
              <input
                type="number"
                placeholder="Masukkan ID user yang akan jadi roommate"
                value={roommateId}
                onChange={(e) => setRoommateId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                ID user bisa dilihat di profil masing-masing.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Durasi */}
        <div>
          <label className="block text-xs font-bold text-neutral-600 mb-2">
            Durasi Sewa
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 6, 12].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurasi(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition ${
                  durasi === d
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                }`}
              >
                {d} {d === 1 ? "Bulan" : "Bulan"}
              </button>
            ))}
          </div>
        </div>

        {/* Kalkulasi */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-700 font-bold mb-1">
            Estimasi Tagihan
          </p>
          <p className="text-2xl font-black text-emerald-800">
            Rp {fmt(totalTagihan)}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">
            {isDuo
              ? `(Rp ${fmt(harga)} ÷ 2) × ${durasi} bulan`
              : `Rp ${fmt(harga)} × ${durasi} bulan`}
          </p>
          {isDuo && (
            <p className="text-[10px] text-emerald-600">
              Per orang: Rp {fmt(totalTagihan / 2)} / bulan
            </p>
          )}
        </div>

        {/* Pesan status */}
        {sewaMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              sewaMsg.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
            }`}
          >
            {sewaMsg.type === "error" ? (
              <XCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0" />
            )}
            {sewaMsg.text}
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex flex-col gap-2">
          {/* Tanya Pemilik — WhatsApp */}
          {kost.nomorWhatsApp && (
            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://wa.me/${kost.nomorWhatsApp}?text=Halo%2C%20saya%20tertarik%20dengan%20${encodeURIComponent(kost.namaKost)}`,
                  "_blank",
                )
              }
              className="w-full py-3 bg-[#25D366] hover:bg-[#1fad54] text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Tanya Pemilik via WhatsApp
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || available <= 0}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {submitting
              ? "Mengirim..."
              : available <= 0
                ? "Kamar Penuh"
                : "Ajukan Sewa"}
          </button>
          {!biodata?.isVerified && (
            <p className="text-[10px] text-red-600 text-center flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" /> Anda perlu verifikasi data
              diri sebelum bisa menyewa.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main UserDashboard ────────────────────────────────────────────────────────
export default function UserDashboard({ currentUser }) {
  const [userPage, setUserPage] = useState("beranda");
  const [selectedKamar, setSelectedKamar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Kost list & filter
  const [kostList, setKostList] = useState([]);
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterLokasi, setFilterLokasi] = useState("Semua");
  const [searchQ, setSearchQ] = useState("");

  // Biodata
  const [biodata, setBiodata] = useState(null);
  const [biodataForm, setBiodataForm] = useState({
    namaLengkap: "",
    tanggalLahir: "",
    tempatLahir: "",
    jenisKelamin: "",
    noHp: "",
    alamat: "",
    pekerjaan: "",
    ktpUrl: "",
    kkUrl: "",
    fotoUrl: "",
  });
  const [biodataFiles, setBiodataFiles] = useState({
    ktpUrl: null,
    kkUrl: null,
    fotoUrl: null,
  });
  const [biodataSaving, setBiodataSaving] = useState(false);
  const [biodataMsg, setBiodataMsg] = useState(null);

  // Kamar saya (dari pengajuan yg DITERIMA)
  const [kamarSaya, setKamarSaya] = useState(null); // PengajuanSewa yg DITERIMA
  const [unitSaya, setUnitSaya] = useState(null); // UnitKamar detail
  const [kamarTab, setKamarTab] = useState("info");

  // Laporan
  const [laporanList, setLaporanList] = useState([]);
  const [laporanForm, setLaporanForm] = useState({
    kategori: "",
    kendala: "",
    detail: "",
  });
  const [laporanMsg, setLaporanMsg] = useState(null);

  // Notifikasi (pengajuan sewa + invite)
  const [pengajuanList, setPengajuanList] = useState([]);
  const [inviteList, setInviteList] = useState([]);

  // ── Fetch ──
  const loadAll = useCallback(async () => {
    if (!currentUser?.id) return;
    const uid = currentUser.id;
    try {
      // Biodata
      const bRes = await fetch(`${API}/api/biodata/${uid}`);
      if (bRes.ok) {
        const bd = await bRes.json();
        setBiodata(bd);
        setBiodataForm({
          namaLengkap: bd.namaLengkap || "",
          tanggalLahir: bd.tanggalLahir || "",
          tempatLahir: bd.tempatLahir || "",
          jenisKelamin: bd.jenisKelamin || "",
          noHp: bd.noHp || "",
          alamat: bd.alamat || "",
          pekerjaan: bd.pekerjaan || "",
          ktpUrl: bd.ktpUrl || "",
          kkUrl: bd.kkUrl || "",
          fotoUrl: bd.fotoUrl || "",
        });
      }
      // Kost list
      const kRes = await fetch(`${API}/api/kost/medan`);
      if (kRes.ok) setKostList(await kRes.json());
      // Pengajuan user
      const pRes = await fetch(`${API}/api/pengajuan/${uid}`);
      if (pRes.ok) {
        const list = await pRes.json();
        setPengajuanList(list);
        // Cari yang DITERIMA
        const diterima = list.find((p) => p.status === "DITERIMA");
        if (diterima) {
          setKamarSaya(diterima);
          if (diterima.unitKamarId) {
            const uRes = await fetch(
              `${API}/api/owner/unit-kamar/single/${diterima.unitKamarId}`,
            ).catch(() => null);
            // endpoint single belum ada — simpan apa adanya
          }
        }
      }
      // Invite
      const iRes = await fetch(`${API}/api/invite/${uid}`);
      if (iRes.ok) setInviteList(await iRes.json());
      // Laporan
      const lRes = await fetch(`${API}/api/laporan?userId=${uid}`);
      if (lRes.ok) setLaporanList(await lRes.json());
    } catch {
      /* offline fallback – tampil UI kosong */
    }
  }, [currentUser]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Handlers ──
  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    // Preview lokal dulu
    const localUrl = URL.createObjectURL(file);
    setBiodataFiles((prev) => ({
      ...prev,
      [key]: { file, localUrl, name: file.name },
    }));
    setBiodataForm((prev) => ({ ...prev, [key]: localUrl })); // placeholder sementara
  };

  const handleSaveBiodata = async (e) => {
    e.preventDefault();
    setBiodataSaving(true);
    try {
      // Upload berkas yang baru dipilih
      const uploads = {};
      for (const key of ["ktpUrl", "kkUrl", "fotoUrl"]) {
        if (biodataFiles[key]?.file) {
          uploads[key] = await uploadFile(biodataFiles[key].file);
        } else {
          uploads[key] = biodata?.[key] || "";
        }
      }
      const payload = { ...biodataForm, ...uploads };
      const res = await fetch(`${API}/api/biodata/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.biodata) {
        setBiodata(data.biodata);
        setBiodataMsg({
          type: "success",
          text: "Data diri berhasil disimpan! Menunggu verifikasi admin.",
        });
      } else throw new Error(data.error);
    } catch (err) {
      setBiodataMsg({ type: "error", text: err.message || "Gagal menyimpan." });
    } finally {
      setBiodataSaving(false);
      setTimeout(() => setBiodataMsg(null), 5000);
    }
  };

  const handleLaporan = async (e) => {
    e.preventDefault();
    if (!laporanForm.kategori || !laporanForm.kendala) return;
    try {
      const payload = {
        userId: Number(currentUser.id),
        unitKamarId: kamarSaya?.unitKamarId || null,
        ...laporanForm,
      };
      const res = await fetch(`${API}/api/laporan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLaporanList((prev) => [data, ...prev]);
      setLaporanForm({ kategori: "", kendala: "", detail: "" });
      setLaporanMsg("Laporan berhasil dikirim!");
      setTimeout(() => setLaporanMsg(null), 4000);
    } catch {
      setLaporanMsg("Gagal mengirim laporan.");
    }
  };

  const handleRespondInvite = async (id, status) => {
    try {
      await fetch(`${API}/api/invite/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setInviteList((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i)),
      );
    } catch {
      /* offline */
    }
  };

  const handlePengajuanSubmit = (newPengajuan) => {
    setPengajuanList((prev) => [newPengajuan, ...prev]);
  };

  // Derived
  const pendingInvite = inviteList.filter(
    (i) =>
      String(i.toUserId) === String(currentUser?.id) && i.status === "PENDING",
  ).length;
  const pendingPengajuan = pengajuanList.filter(
    (p) => p.status === "PENDING",
  ).length;
  const totalNotif = pendingInvite + pendingPengajuan;

  const lokasiOptions = [
    "Semua",
    ...new Set(kostList.map((k) => k.daerah).filter(Boolean)),
  ];

  const filteredKost = kostList.filter((k) => {
    if (filterKategori !== "Semua" && k.kategori !== filterKategori)
      return false;
    if (filterLokasi !== "Semua" && k.daerah !== filterLokasi) return false;
    if (
      searchQ &&
      !k.namaKost?.toLowerCase().includes(searchQ.toLowerCase()) &&
      !k.daerah?.toLowerCase().includes(searchQ.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row relative">
      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-64 bg-white border-r border-neutral-200 p-5 flex flex-col gap-4 shrink-0 lg:sticky lg:top-0 lg:h-[calc(100vh-68px)]">
        <div className="hidden lg:flex flex-col gap-2 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-800">
                {currentUser.name}
              </h4>
              <p className="text-[9px] text-neutral-400 font-mono">
                ID: {currentUser.id}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${
              biodata?.verifikasiStatus === "DISETUJUI"
                ? "bg-emerald-100 text-emerald-700"
                : biodata?.verifikasiStatus === "PENDING"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {biodata?.verifikasiStatus === "DISETUJUI"
              ? "✓ Terverifikasi"
              : biodata?.verifikasiStatus === "PENDING"
                ? "⏳ Menunggu Verifikasi"
                : "⚠ Belum Lengkap"}
          </span>
        </div>
        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {[
            {
              key: "beranda",
              icon: <Home className="h-4 w-4" />,
              label: "Cari Kost",
            },
            {
              key: "biodata",
              icon: <User className="h-4 w-4" />,
              label: "Data Diri",
            },
            {
              key: "kamar-saya",
              icon: <DoorOpen className="h-4 w-4" />,
              label: "Kamar Saya",
            },
            {
              key: "notifikasi",
              icon: <BellIcon className="h-4 w-4" />,
              label: "Notifikasi",
              badge: totalNotif,
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setUserPage(item.key);
                setSelectedKamar(null);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                userPage === item.key
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {item.icon} {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* ════ BERANDA / CARI KOST ════ */}
          {userPage === "beranda" && !selectedKamar && (
            <motion.div
              key="beranda"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Cari Kost
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Temukan kamar kost terbaik di Medan.
                </p>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari nama kost atau daerah..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              {/* Filter chips */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Kategori:
                  </span>
                  {["Semua", "Putra", "Putri", "Campur"].map((k) => (
                    <button
                      key={k}
                      onClick={() => setFilterKategori(k)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition ${filterKategori === k ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400"}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Lokasi:
                  </span>
                  {lokasiOptions.slice(0, 6).map((l) => (
                    <button
                      key={l}
                      onClick={() => setFilterLokasi(l)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition ${filterLokasi === l ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {/* Kost grid */}
              {filteredKost.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">
                    Tidak ada kost yang ditemukan
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Coba ubah filter atau kata kunci pencarian.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredKost.map((k) => (
                    <KostCard key={k.id} kost={k} onSelect={setSelectedKamar} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════ DETAIL KAMAR ════ */}
          {userPage === "beranda" && selectedKamar && (
            <DetailKamar
              key="detail"
              kost={selectedKamar}
              currentUser={currentUser}
              biodata={biodata}
              onBack={() => setSelectedKamar(null)}
              onPengajuanSubmit={handlePengajuanSubmit}
            />
          )}

          {/* ════ DATA DIRI ════ */}
          {userPage === "biodata" && (
            <motion.div
              key="biodata"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Data Diri
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Lengkapi dan upload berkas. Admin akan memverifikasi sebelum
                  Anda bisa menyewa.
                </p>
              </div>

              {/* Status banner */}
              {biodata?.verifikasiStatus === "DISETUJUI" && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Data Diri Terverifikasi ✓
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Anda sudah bisa menyewa kamar.
                    </p>
                  </div>
                </div>
              )}
              {biodata?.verifikasiStatus === "PENDING" && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex gap-3 items-start">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      Menunggu Verifikasi Admin
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Data sedang ditinjau. Anda bisa menyewa setelah disetujui.
                    </p>
                  </div>
                </div>
              )}
              {biodata?.verifikasiStatus === "DITOLAK" && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex gap-3 items-start">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Verifikasi Ditolak
                    </p>
                    <p className="text-xs text-red-700 mt-0.5">
                      Perbaiki berkas yang ditolak lalu kirim ulang.
                    </p>
                    {/* Komentar per berkas */}
                    <div className="mt-2 flex flex-col gap-1">
                      {[
                        ["KTP", biodata.ktpStatus, biodata.ktpKomentar],
                        ["KK", biodata.kkStatus, biodata.kkKomentar],
                        ["Foto", biodata.fotoStatus, biodata.fotoKomentar],
                      ]
                        .filter(([, s, k]) => s === "DITOLAK" && k)
                        .map(([label, , komentar]) => (
                          <p
                            key={label}
                            className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded"
                          >
                            <strong>{label}:</strong> {komentar}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {biodataMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${biodataMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}
                >
                  {biodataMsg.text}
                </div>
              )}

              <form
                onSubmit={handleSaveBiodata}
                className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-5"
              >
                <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-3">
                  Informasi Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Nama Lengkap",
                      key: "namaLengkap",
                      type: "text",
                      placeholder: "Sesuai KTP",
                    },
                    {
                      label: "Tempat Lahir",
                      key: "tempatLahir",
                      type: "text",
                      placeholder: "Kota kelahiran",
                    },
                    {
                      label: "Tanggal Lahir",
                      key: "tanggalLahir",
                      type: "date",
                    },
                    {
                      label: "No. HP / WhatsApp",
                      key: "noHp",
                      type: "tel",
                      placeholder: "08xxxxxxxxxx",
                    },
                    {
                      label: "Pekerjaan",
                      key: "pekerjaan",
                      type: "text",
                      placeholder: "Mahasiswa / Karyawan",
                    },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder || ""}
                        required
                        value={biodataForm[f.key]}
                        onChange={(e) =>
                          setBiodataForm((p) => ({
                            ...p,
                            [f.key]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      required
                      value={biodataForm.jenisKelamin}
                      onChange={(e) =>
                        setBiodataForm((p) => ({
                          ...p,
                          jenisKelamin: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="">Pilih...</option>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Contoh No. 1, Kota"
                    value={biodataForm.alamat}
                    onChange={(e) =>
                      setBiodataForm((p) => ({ ...p, alamat: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                  />
                </div>

                <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-3 mt-2">
                  Upload Berkas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "KTP", key: "ktpUrl", status: biodata?.ktpStatus },
                    { label: "KK", key: "kkUrl", status: biodata?.kkStatus },
                    {
                      label: "Foto Diri",
                      key: "fotoUrl",
                      status: biodata?.fotoStatus,
                    },
                  ].map((f) => {
                    const fileInfo = biodataFiles[f.key];
                    const existingUrl =
                      biodata?.[f.key] && !fileInfo ? biodata[f.key] : null;
                    const displayUrl =
                      fileInfo?.localUrl ||
                      (existingUrl ? API + existingUrl : null);
                    return (
                      <div
                        key={f.key}
                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition ${
                          f.status === "DISETUJUI"
                            ? "border-emerald-400 bg-emerald-50/30"
                            : f.status === "DITOLAK"
                              ? "border-red-400 bg-red-50/30"
                              : displayUrl
                                ? "border-emerald-300 bg-emerald-50/20"
                                : "border-neutral-200 hover:border-emerald-400"
                        }`}
                      >
                        <Upload
                          className={`h-5 w-5 ${displayUrl ? "text-emerald-500" : "text-neutral-400"}`}
                        />
                        <p className="text-xs font-bold text-neutral-700">
                          {f.label}
                        </p>
                        {f.status && f.status !== "BELUM" && (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              f.status === "DISETUJUI"
                                ? "bg-emerald-100 text-emerald-700"
                                : f.status === "DITOLAK"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {f.status}
                          </span>
                        )}
                        {displayUrl && (
                          <div
                            className="w-full h-20 rounded-lg overflow-hidden border border-neutral-200 cursor-pointer"
                            onClick={() => setPreviewUrl(displayUrl)}
                          >
                            <img
                              src={displayUrl}
                              alt={f.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <label className="w-full cursor-pointer">
                          <div className="w-full py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[10px] font-bold rounded-lg text-center transition">
                            {displayUrl ? "Ganti File" : "Pilih File"}
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, f.key)}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  disabled={biodataSaving}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {biodataSaving
                    ? "Menyimpan & Mengupload..."
                    : "Simpan & Ajukan Verifikasi"}
                </button>
              </form>
            </motion.div>
          )}

          {/* ════ KAMAR SAYA ════ */}
          {userPage === "kamar-saya" && (
            <motion.div
              key="kamar-saya"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              <h2 className="text-xl font-bold text-neutral-900">Kamar Saya</h2>

              {!kamarSaya ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <Home className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">
                    Anda belum menyewa kamar
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cari dan ajukan sewa kamar kost untuk memulai.
                  </p>
                  <button
                    onClick={() => setUserPage("beranda")}
                    className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition"
                  >
                    Cari Kost Sekarang
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-800 text-white rounded-2xl p-5 flex gap-4 items-center">
                    <div className="p-3 bg-emerald-700 rounded-xl">
                      <Home className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                        Kamar Aktif
                      </p>
                      <h3 className="text-lg font-black">
                        {kamarSaya.namaKost || "Unit Kamar"}
                      </h3>
                      {kamarSaya.batasKontrak && (
                        <p className="text-xs text-emerald-200 mt-0.5 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> Kontrak s.d.{" "}
                          {new Date(kamarSaya.batasKontrak).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl">
                    {[
                      { key: "info", label: "Info Kamar" },
                      { key: "laporan", label: "Laporan Kerusakan" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setKamarTab(tab.key)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${kamarTab === tab.key ? "bg-white text-emerald-800 shadow-sm" : "text-neutral-500"}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {kamarTab === "info" && (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-neutral-800">
                        Detail Sewa
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          {
                            l: "Tipe Sewa",
                            v:
                              kamarSaya.tipeSewa === "DUO"
                                ? "👥 2 Orang"
                                : "👤 Sendiri",
                          },
                          { l: "Durasi", v: `${kamarSaya.durasiBulan} Bulan` },
                          {
                            l: "Total",
                            v: `Rp ${fmt(kamarSaya.totalTagihan)}`,
                          },
                          { l: "Nomor Kamar", v: unitSaya?.nomorKamar || "-" },
                          {
                            l: "Mulai",
                            v: kamarSaya.tanggalMulai
                              ? new Date(
                                  kamarSaya.tanggalMulai,
                                ).toLocaleDateString("id-ID")
                              : "-",
                          },
                          {
                            l: "Kontrak s.d.",
                            v: kamarSaya.batasKontrak
                              ? new Date(
                                  kamarSaya.batasKontrak,
                                ).toLocaleDateString("id-ID")
                              : "-",
                          },
                        ].map((d) => (
                          <div
                            key={d.l}
                            className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100"
                          >
                            <p className="text-[9px] font-bold text-emerald-600 uppercase">
                              {d.l}
                            </p>
                            <p className="text-xs font-bold text-neutral-800 mt-0.5">
                              {d.v}
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-neutral-400 italic">
                        Hubungi owner jika ada pertanyaan tentang sewa Anda.
                      </p>
                    </div>
                  )}

                  {kamarTab === "laporan" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
                        <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-2.5 py-0.5 rounded-full self-start uppercase">
                          Buat Laporan
                        </span>
                        {laporanMsg && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                            {laporanMsg}
                          </div>
                        )}
                        <form
                          onSubmit={handleLaporan}
                          className="flex flex-col gap-3"
                        >
                          <select
                            required
                            value={laporanForm.kategori}
                            onChange={(e) =>
                              setLaporanForm((f) => ({
                                ...f,
                                kategori: e.target.value,
                              }))
                            }
                            className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            <option value="">Kategori...</option>
                            <option>Pipa Air</option>
                            <option>Listrik</option>
                            <option>Perabot</option>
                            <option>Lainnya</option>
                          </select>
                          <input
                            type="text"
                            required
                            placeholder="Detail kendala..."
                            value={laporanForm.kendala}
                            onChange={(e) =>
                              setLaporanForm((f) => ({
                                ...f,
                                kendala: e.target.value,
                              }))
                            }
                            className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                          <textarea
                            rows={2}
                            placeholder="Penjelasan (opsional)..."
                            value={laporanForm.detail}
                            onChange={(e) =>
                              setLaporanForm((f) => ({
                                ...f,
                                detail: e.target.value,
                              }))
                            }
                            className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                          />
                          <button
                            type="submit"
                            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <Send className="h-3.5 w-3.5" /> Kirim Laporan
                          </button>
                        </form>
                      </div>
                      <div className="lg:col-span-8">
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                          <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                              Riwayat Laporan
                            </h3>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {
                                laporanList.filter(
                                  (l) => l.status !== "SELESAI",
                                ).length
                              }{" "}
                              Aktif
                            </span>
                          </div>
                          {laporanList.length === 0 ? (
                            <div className="p-8 text-center text-neutral-400 text-sm">
                              Belum ada laporan.
                            </div>
                          ) : (
                            <div className="divide-y divide-neutral-100">
                              {laporanList.map((l) => (
                                <div
                                  key={l.id}
                                  className="p-5 flex flex-col md:flex-row gap-3 items-start md:items-center"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                                        {l.kategori}
                                      </span>
                                      <span className="text-[10px] text-neutral-400">
                                        {new Date(l.tanggal).toLocaleDateString(
                                          "id-ID",
                                        )}
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-neutral-800">
                                      {l.kendala}
                                    </h4>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                      {l.detail}
                                    </p>
                                    {l.catatanOwner && (
                                      <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">
                                        <Wrench className="h-3 w-3" />{" "}
                                        {l.catatanOwner}
                                      </p>
                                    )}
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                      l.status === "SELESAI"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : l.status === "BARU"
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : l.status === "DITOLAK"
                                            ? "bg-red-50 text-red-600 border-red-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    {l.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ════ NOTIFIKASI ════ */}
          {userPage === "notifikasi" && (
            <motion.div
              key="notifikasi"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Notifikasi
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Undangan & status pengajuan sewa Anda.
                </p>
              </div>

              {/* Pengajuan sewa status */}
              {pengajuanList.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                  <div className="p-4 bg-neutral-50 border-b border-neutral-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Status Pengajuan Sewa
                    </h3>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {pengajuanList.map((p) => (
                      <div key={p.id} className="p-5 flex gap-4 items-start">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            p.status === "PENDING"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : p.status === "DITERIMA"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {p.status}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-neutral-800">
                            {p.namaKost || `Pengajuan #${p.id}`}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {p.tipeSewa === "DUO" ? "👥 2 Orang" : "👤 Sendiri"}{" "}
                            • {p.durasiBulan} Bulan • Rp {fmt(p.totalTagihan)}
                          </p>
                          {p.status === "PENDING" && p.nomorWhatsApp && (
                            <button
                              onClick={() =>
                                window.open(
                                  `https://wa.me/${p.nomorWhatsApp}`,
                                  "_blank",
                                )
                              }
                              className="mt-2 px-3 py-1.5 bg-[#25D366] hover:bg-[#1fad54] text-white text-[10px] font-bold rounded-lg transition"
                            >
                              Hubungi Owner
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invite */}
              {inviteList.filter(
                (i) => String(i.toUserId) === String(currentUser?.id),
              ).length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                  <div className="p-4 bg-neutral-50 border-b border-neutral-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Undangan Roommate
                    </h3>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {inviteList
                      .filter(
                        (i) => String(i.toUserId) === String(currentUser?.id),
                      )
                      .map((inv) => (
                        <div
                          key={inv.id}
                          className="p-5 flex gap-4 items-start"
                        >
                          <Users className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-neutral-800">
                              {inv.fromUserName} mengundang Anda
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {inv.namaKost} • {inv.durasi} Bulan • Rp{" "}
                              {fmt(inv.hargaDasar / 2)}/orang
                            </p>
                            {inv.status === "PENDING" && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    handleRespondInvite(inv.id, "DITERIMA")
                                  }
                                  className="px-3 py-1.5 bg-emerald-700 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition"
                                >
                                  Terima
                                </button>
                                <button
                                  onClick={() =>
                                    handleRespondInvite(inv.id, "DITOLAK")
                                  }
                                  className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-[10px] font-bold rounded-lg hover:bg-neutral-200 transition"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                            {inv.status !== "PENDING" && (
                              <span
                                className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  inv.status === "DITERIMA"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {inv.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {pengajuanList.length === 0 &&
                inviteList.filter(
                  (i) => String(i.toUserId) === String(currentUser?.id),
                ).length === 0 && (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                    <BellIcon className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-neutral-500">
                      Tidak ada notifikasi
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Undangan dan status pengajuan akan muncul di sini.
                    </p>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white text-sm font-bold"
            >
              ✕ Tutup
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-white p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
