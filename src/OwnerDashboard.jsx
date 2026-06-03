import React, { useState, useEffect, useCallback } from "react";
import {
  Bed,
  ClipboardList,
  Wrench,
  Building,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Home,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  User,
  Briefcase,
  MessageSquare,
  Save,
  AlertCircle,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const fmt = (n) => n?.toLocaleString("id-ID");
const API = "http://localhost:8080";

// ── Helpers ──────────────────────────────────────────────────────────────────
const FASILITAS_UNIT = [
  { key: "ac", label: "AC", icon: "❄️" },
  { key: "kamarMandiDalam", label: "Kamar Mandi Dalam", icon: "🚿" },
  { key: "kasur", label: "Kasur Springbed", icon: "🛏️" },
  { key: "lemari", label: "Lemari", icon: "🗄️" },
  { key: "meja", label: "Meja Belajar", icon: "📚" },
  { key: "kursi", label: "Kursi", icon: "🪑" },
];

const FASILITAS_KOST = [
  { key: "wifi", label: "WiFi Cepat", icon: "📶" },
  { key: "parkir", label: "Parkir Motor", icon: "🏍️" },
  { key: "laundry", label: "Laundry", icon: "👕" },
  { key: "dapur", label: "Dapur Bersama", icon: "🍳" },
  { key: "security", label: "Security 24J", icon: "🔐" },
];

function StatusPill({ status }) {
  const map = {
    KOSONG: "bg-blue-100 text-blue-700",
    TERISI: "bg-emerald-100 text-emerald-700",
    MAINTENANCE: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${map[status] || "bg-neutral-100 text-neutral-500"}`}
    >
      {status}
    </span>
  );
}

// Upload satu file ke backend dan kembalikan URL-nya
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Upload gagal");
  return data.url; // "/uploads/xxx.jpg"
}

// ── KamarFormModal ────────────────────────────────────────────────────────────
const EMPTY_UNIT = {
  nomorKamar: "",
  kapasitas: 1,
  harga: "",
  deskripsi: "",
  ac: false,
  kamarMandiDalam: false,
  kasur: false,
  lemari: false,
  meja: false,
  kursi: false,
  fotoFiles: [null, null, null], // File objects
  fotoPreviews: [null, null, null], // Data-URLs for preview
  fotoUrls: "", // Comma-sep string untuk DB
};

function KamarFormModal({
  isEdit,
  form,
  setForm,
  onSubmit,
  onClose,
  uploading,
}) {
  const handleImageChange = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => {
        const previews = [...f.fotoPreviews];
        previews[idx] = ev.target.result;
        const files = [...f.fotoFiles];
        files[idx] = file;
        return { ...f, fotoPreviews: previews, fotoFiles: files };
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleFasilitas = (key) => setForm((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-900">
            {isEdit ? "Edit Unit Kamar" : "Tambah Unit Kamar"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
        <form
          onSubmit={onSubmit}
          className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Kapasitas */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-2">
              Kapasitas Kamar
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, kapasitas: k }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${
                    form.kapasitas === k
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  }`}
                >
                  {k === 1 ? "👤 1 Orang (Solo)" : "👥 2 Orang (Duo)"}
                </button>
              ))}
            </div>
          </div>

          {/* Nomor & harga */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Nomor Kamar
              </label>
              <input
                type="text"
                placeholder="Kamar 07"
                required
                value={form.nomorKamar}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nomorKamar: e.target.value }))
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Harga / Bulan (Rp)
              </label>
              <input
                type="number"
                placeholder="1500000"
                required
                min={100000}
                value={form.harga}
                onChange={(e) =>
                  setForm((f) => ({ ...f, harga: e.target.value }))
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">
              Deskripsi
            </label>
            <textarea
              rows={2}
              placeholder="Deskripsikan unit kamar ini..."
              value={form.deskripsi}
              onChange={(e) =>
                setForm((f) => ({ ...f, deskripsi: e.target.value }))
              }
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
            />
          </div>

          {/* Fasilitas */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-2">
              Fasilitas Unit
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {FASILITAS_UNIT.map((f) => (
                <label
                  key={f.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                    form[f.key]
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={() => toggleFasilitas(f.key)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-xs font-medium text-neutral-700">
                    {f.icon} {f.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Foto kamar – maks 3 */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-2">
              Foto Kamar (maks. 3 foto)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <label
                  key={i}
                  className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-emerald-400 transition cursor-pointer overflow-hidden relative group"
                >
                  {form.fotoPreviews[i] ? (
                    <>
                      <img
                        src={form.fotoPreviews[i]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                          Ganti
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <Upload className="h-5 w-5 text-neutral-300" />
                      <span className="text-[9px] text-neutral-400">
                        Foto {i + 1}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, i)}
                  />
                </label>
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              File akan diunggah otomatis saat menyimpan.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition disabled:opacity-50"
            >
              {uploading ? "Mengupload..." : isEdit ? "Simpan" : "Tambah Kamar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── PengajuanCard ─────────────────────────────────────────────────────────────
function PengajuanCard({ app, onDecision, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = app.status === "PENDING";

  return (
    <div
      className={`bg-white border rounded-2xl shadow-xs overflow-hidden ${
        isPending
          ? "border-amber-200"
          : app.status === "DITERIMA"
            ? "border-emerald-200"
            : "border-red-200"
      }`}
    >
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isPending
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : app.status === "DITERIMA"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {app.status || "PENDING"}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  app.tipeSewa === "DUO"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {app.tipeSewa === "DUO" ? "👥 Sewa 2 Orang" : "👤 Sewa Sendiri"}
              </span>
            </div>
            <h4 className="text-sm font-bold text-neutral-900">
              {app.namaLengkap || `User #${app.userId}`}
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { l: "Durasi", v: `${app.durasiBulan} Bulan` },
                { l: "Total", v: `Rp ${fmt(app.totalTagihan)}` },
                {
                  l: "Tanggal",
                  v: app.tanggalPengajuan
                    ? new Date(app.tanggalPengajuan).toLocaleDateString("id-ID")
                    : "-",
                },
              ].map((d) => (
                <div
                  key={d.l}
                  className="bg-neutral-50 rounded-lg px-2.5 py-1.5 text-xs border border-neutral-100"
                >
                  <span className="text-neutral-400">{d.l}: </span>
                  <span className="font-bold text-neutral-800">{d.v}</span>
                </div>
              ))}
              {app.roommateUsername && (
                <div className="bg-blue-50 rounded-lg px-2.5 py-1.5 text-xs border border-blue-100">
                  <span className="text-blue-500">Roommate: </span>
                  <span className="font-bold text-blue-800">
                    @{app.roommateUsername}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="px-3 py-1.5 text-[10px] font-bold text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition flex items-center gap-1"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}{" "}
              Biodata
            </button>
            {isPending && (
              <>
                <button
                  onClick={() => onDecision(app.id, "DITOLAK")}
                  className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 text-xs font-bold transition border border-neutral-200"
                >
                  Tolak
                </button>
                <button
                  onClick={() => onDecision(app.id, "DITERIMA")}
                  className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow"
                >
                  Terima
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-neutral-100"
          >
            <div className="p-5">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Data Penyewa
              </p>
              {app.dataPenyewa ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {[
                      { l: "Nama", v: app.dataPenyewa.namaLengkap },
                      { l: "No. HP", v: app.dataPenyewa.noHp },
                      { l: "Pekerjaan", v: app.dataPenyewa.pekerjaan },
                      { l: "Jenis Kel.", v: app.dataPenyewa.jenisKelamin },
                      { l: "Email", v: app.dataPenyewa.email },
                      { l: "Alamat", v: app.dataPenyewa.alamat },
                    ].map(
                      (d) =>
                        d.v && (
                          <div
                            key={d.l}
                            className="bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100"
                          >
                            <p className="text-[9px] text-neutral-400 font-bold uppercase">
                              {d.l}
                            </p>
                            <p className="text-xs font-bold text-neutral-800 mt-0.5 truncate">
                              {d.v}
                            </p>
                          </div>
                        ),
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { l: "KTP", v: app.dataPenyewa.ktpUrl },
                      { l: "KK", v: app.dataPenyewa.kkUrl },
                      { l: "Foto", v: app.dataPenyewa.fotoUrl },
                    ].map((doc) =>
                      doc.v ? (
                        <button
                          key={doc.l}
                          onClick={() => onPreview(API + doc.v)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition"
                        >
                          <Eye className="h-3 w-3" /> {doc.l}
                        </button>
                      ) : null,
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  Data biodata tidak tersedia.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main OwnerDashboard ───────────────────────────────────────────────────────
export default function OwnerDashboard({ currentUser }) {
  const [ownerPage, setOwnerPage] = useState("manajemen-kamar");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState(null);

  // ── InfoKost state ──
  const [infoKost, setInfoKost] = useState(null);
  const [infoForm, setInfoForm] = useState({
    namaKost: "",
    daerah: "",
    alamatLengkap: "",
    kategori: "Campur",
    hargaDasar: "",
    nomorWhatsApp: "",
    wifi: false,
    parkir: false,
    laundry: false,
    dapur: false,
    security: false,
  });
  const [savingInfo, setSavingInfo] = useState(false);

  // ── UnitKamar state ──
  const [unitList, setUnitList] = useState([]);
  const [loadingUnit, setLoadingUnit] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_UNIT });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_UNIT });
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── Pengajuan Sewa state ──
  const [pengajuanList, setPengajuanList] = useState([]);

  // ── Tiket Perbaikan state ──
  const [tiketList, setTiketList] = useState([]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch InfoKost owner ──
  const fetchInfoKost = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`${API}/api/owner/info-kost/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setInfoKost(data);
        // Populate form — kunci fix "data hilang saat refresh"
        setInfoForm({
          namaKost: data.namaKost || "",
          daerah: data.daerah || "",
          alamatLengkap: data.alamatLengkap || "",
          kategori: data.kategori || "Campur",
          hargaDasar: data.hargaDasar || "",
          nomorWhatsApp: data.nomorWhatsApp || "",
          wifi: !!data.wifi,
          parkir: !!data.parkir,
          laundry: !!data.laundry,
          dapur: !!data.dapur,
          security: !!data.security,
        });
        // Langsung fetch unit kamar dalam satu chain — hindari race condition
        try {
          const uRes = await fetch(`${API}/api/owner/unit-kamar/${data.id}`);
          if (uRes.ok) setUnitList(await uRes.json());
        } catch {
          /* unit kosong */
        }
      }
    } catch {
      /* belum ada info kost — owner mengisi nanti */
    }
  }, [currentUser?.id]); // dependency hanya id, bukan seluruh objek currentUser

  // ── Fetch UnitKamar ──
  const fetchUnits = useCallback(async () => {
    if (!infoKost?.id) return;
    setLoadingUnit(true);
    try {
      const res = await fetch(`${API}/api/owner/unit-kamar/${infoKost.id}`);
      if (res.ok) setUnitList(await res.json());
    } catch {
      showToast("Gagal memuat daftar kamar", "error");
    } finally {
      setLoadingUnit(false);
    }
  }, [infoKost]);

  // ── Fetch Pengajuan ──
  const fetchPengajuan = useCallback(async () => {
    if (!infoKost?.id) return;
    try {
      const res = await fetch(
        `${API}/api/owner/pengajuan-masuk/${infoKost.id}`,
      );
      if (res.ok) setPengajuanList(await res.json());
    } catch {
      /* offline */
    }
  }, [infoKost]);

  // ── Fetch Tiket ──
  const fetchTiket = useCallback(async () => {
    if (!infoKost?.id) return;
    try {
      const res = await fetch(
        `${API}/api/owner/tiket-perbaikan/${infoKost.id}`,
      );
      if (res.ok) setTiketList(await res.json());
    } catch {
      /* offline */
    }
  }, [infoKost]);

  useEffect(() => {
    fetchInfoKost();
  }, [fetchInfoKost]);
  useEffect(() => {
    if (infoKost) {
      fetchUnits();
      fetchPengajuan();
      fetchTiket();
    }
  }, [infoKost, fetchUnits, fetchPengajuan, fetchTiket]);

  // ── Handler: Simpan Info Kost ──
  const handleSaveInfoKost = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setSavingInfo(true);
    try {
      const payload = {
        ...infoForm,
        ownerId: Number(currentUser.id),
        hargaDasar: Number(infoForm.hargaDasar),
      };
      const res = await fetch(`${API}/api/owner/info-kost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setInfoKost(data.data);
        showToast("Info kost berhasil disimpan!");
      } else throw new Error(data.error);
    } catch (err) {
      showToast(err.message || "Gagal menyimpan info kost", "error");
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Handler: Upload foto dan simpan unit ──
  const processAndSaveUnit = async (form, unitId = null) => {
    setUploading(true);
    try {
      // Upload foto-foto yang baru dipilih
      const uploadedUrls = await Promise.all(
        form.fotoFiles.map(async (file) => {
          if (!file) return null;
          return await uploadFile(file);
        }),
      );
      // Gabungkan URL baru dengan URL lama (yang tidak diganti)
      const existingUrls = form.fotoUrls ? form.fotoUrls.split(",") : [];
      const finalUrls = [0, 1, 2]
        .map((i) => uploadedUrls[i] || existingUrls[i] || null)
        .filter(Boolean);

      const payload = {
        infoKostId: infoKost.id,
        nomorKamar: form.nomorKamar,
        kapasitas: form.kapasitas,
        harga: Number(form.harga),
        deskripsi: form.deskripsi,
        ac: !!form.ac,
        kamarMandiDalam: !!form.kamarMandiDalam,
        kasur: !!form.kasur,
        lemari: !!form.lemari,
        meja: !!form.meja,
        kursi: !!form.kursi,
        fotoUrls: finalUrls.join(","),
      };

      const url = unitId
        ? `${API}/api/owner/unit-kamar/${unitId}`
        : `${API}/api/owner/unit-kamar`;
      const method = unitId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      await fetchUnits();
      showToast(
        unitId
          ? "Unit kamar berhasil diperbarui!"
          : "Unit kamar berhasil ditambahkan!",
      );
      return true;
    } catch (err) {
      showToast(err.message || "Gagal menyimpan unit", "error");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    const ok = await processAndSaveUnit(addForm);
    if (ok) {
      setShowAddModal(false);
      setAddForm({ ...EMPTY_UNIT });
    }
  };

  const handleEditUnit = async (e) => {
    e.preventDefault();
    const ok = await processAndSaveUnit(editForm, editId);
    if (ok) {
      setEditId(null);
      setEditForm({ ...EMPTY_UNIT });
    }
  };

  const openEdit = (unit) => {
    const urlArr = unit.fotoUrls ? unit.fotoUrls.split(",") : [];
    setEditId(unit.id);
    setEditForm({
      nomorKamar: unit.nomorKamar || "",
      kapasitas: unit.kapasitas || 1,
      harga: unit.harga || "",
      deskripsi: unit.deskripsi || "",
      ac: !!unit.ac,
      kamarMandiDalam: !!unit.kamarMandiDalam,
      kasur: !!unit.kasur,
      lemari: !!unit.lemari,
      meja: !!unit.meja,
      kursi: !!unit.kursi,
      fotoFiles: [null, null, null],
      fotoPreviews: [
        urlArr[0] ? API + urlArr[0] : null,
        urlArr[1] ? API + urlArr[1] : null,
        urlArr[2] ? API + urlArr[2] : null,
      ],
      fotoUrls: unit.fotoUrls || "",
    });
  };

  const handleDeleteUnit = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(
        `${API}/api/owner/unit-kamar/${deleteConfirmId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (data.success) {
        await fetchUnits();
        showToast("Unit kamar dihapus.");
      } else throw new Error(data.error);
    } catch (err) {
      showToast(err.message || "Gagal hapus unit", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleMaintenance = async (unitId, isOn) => {
    try {
      const res = await fetch(
        `${API}/api/owner/unit-kamar/${unitId}/maintenance`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maintenance: isOn }),
        },
      );
      const data = await res.json();
      if (data.success) {
        await fetchUnits();
        showToast(
          isOn ? "Kamar diset maintenance." : "Status maintenance diangkat.",
        );
      }
    } catch {
      showToast("Gagal mengubah status maintenance", "error");
    }
  };

  const handlePengajuanDecision = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/owner/pengajuan-masuk/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPengajuan();
        await fetchUnits();
        showToast(
          `Pengajuan berhasil ${status === "DITERIMA" ? "diterima" : "ditolak"}.`,
        );
      } else throw new Error(data.error);
    } catch (err) {
      showToast(err.message || "Gagal update pengajuan", "error");
    }
  };

  const handleTiketUpdate = async (id, status, catatan = "") => {
    try {
      const res = await fetch(`${API}/api/owner/tiket-perbaikan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, catatanOwner: catatan }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTiket();
        showToast("Status tiket diperbarui.");
      }
    } catch {
      showToast("Gagal update tiket", "error");
    }
  };

  const pendingPengajuan = pengajuanList.filter(
    (p) => p.status === "PENDING",
  ).length;
  const tiketAktif = tiketList.filter(
    (t) => t.status !== "SELESAI" && t.status !== "DITOLAK",
  ).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[200] px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-emerald-700 text-white"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-60 bg-[#f2f4f6] border-r border-neutral-200 p-5 flex flex-col gap-4 shrink-0 lg:h-[calc(100vh-68px)] lg:sticky lg:top-0">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Owner Panel</h3>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5 truncate">
            {currentUser?.name}
          </p>
          <p className="text-[9px] font-mono text-neutral-400 mt-0.5">
            ID: {currentUser?.id}
          </p>
          {infoKost && (
            <div className="mt-2 px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                <Building className="h-3 w-3" /> {infoKost.namaKost}
              </p>
              <p className="text-[9px] text-emerald-600">
                {infoKost.daerah} • {infoKost.kategori}
              </p>
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {[
            {
              key: "manajemen-kamar",
              icon: <Bed className="h-4 w-4" />,
              label: "Manajemen Kamar",
              badge: 0,
            },
            {
              key: "pengajuan-sewa",
              icon: <ClipboardList className="h-4 w-4" />,
              label: "Pengajuan Sewa",
              badge: pendingPengajuan,
            },
            {
              key: "tiket-perbaikan",
              icon: <Wrench className="h-4 w-4" />,
              label: "Tiket Perbaikan",
              badge: tiketAktif,
            },
            {
              key: "info-kost",
              icon: <Settings className="h-4 w-4" />,
              label: "Info Kost",
              badge: 0,
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setOwnerPage(item.key)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition ${
                ownerPage === item.key
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-200"
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

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* ═══ HALAMAN: MANAJEMEN KAMAR ═══ */}
          {ownerPage === "manajemen-kamar" && (
            <motion.div
              key="mk"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Manajemen Kamar
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Kelola semua unit kamar kost Anda.
                  </p>
                </div>
                {infoKost ? (
                  <button
                    onClick={() => {
                      setAddForm({ ...EMPTY_UNIT });
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    <PlusCircle className="h-4 w-4" /> Tambah Kamar
                  </button>
                ) : (
                  <button
                    onClick={() => setOwnerPage("info-kost")}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition"
                  >
                    <AlertCircle className="h-4 w-4" /> Isi Info Kost Dulu
                  </button>
                )}
              </div>

              {!infoKost && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
                  <Building className="h-10 w-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-amber-800">
                    Info Kost Belum Diisi
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Isi Info Kost terlebih dahulu agar unit kamar bisa
                    ditambahkan dan muncul di halaman pencari.
                  </p>
                </div>
              )}

              {/* Stats */}
              {infoKost && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { l: "Total", v: unitList.length, c: "text-neutral-800" },
                    {
                      l: "Terisi",
                      v: unitList.filter((u) => u.status === "TERISI").length,
                      c: "text-emerald-700",
                    },
                    {
                      l: "Kosong",
                      v: unitList.filter((u) => u.status === "KOSONG").length,
                      c: "text-blue-700",
                    },
                    {
                      l: "Maintenance",
                      v: unitList.filter((u) => u.status === "MAINTENANCE")
                        .length,
                      c: "text-amber-700",
                    },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="bg-white border border-neutral-200 rounded-xl p-4"
                    >
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {s.l}
                      </p>
                      <p className={`text-2xl font-black mt-1 ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </div>
              )}

              {loadingUnit ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  Memuat unit kamar...
                </div>
              ) : unitList.length === 0 && infoKost ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <Bed className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">
                    Belum ada unit kamar
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Klik "Tambah Kamar" untuk menambahkan unit.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unitList.map((unit) => {
                    const fotoList = unit.fotoUrls
                      ? unit.fotoUrls.split(",").filter(Boolean)
                      : [];
                    return (
                      <div
                        key={unit.id}
                        className={`bg-white border rounded-2xl overflow-hidden shadow-xs ${
                          unit.status === "TERISI"
                            ? "border-emerald-200"
                            : unit.status === "MAINTENANCE"
                              ? "border-amber-200"
                              : "border-blue-200"
                        }`}
                      >
                        {/* Foto */}
                        {fotoList[0] ? (
                          <div
                            className="h-36 overflow-hidden cursor-pointer"
                            onClick={() => setPreviewUrl(API + fotoList[0])}
                          >
                            <img
                              src={API + fotoList[0]}
                              alt={unit.nomorKamar}
                              className="w-full h-full object-cover hover:scale-105 transition"
                            />
                          </div>
                        ) : (
                          <div className="h-36 bg-neutral-100 flex items-center justify-center">
                            <Bed className="h-8 w-8 text-neutral-300" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-neutral-800">
                                {unit.nomorKamar}
                              </h4>
                              <p className="text-[10px] text-neutral-400">
                                {unit.kapasitas === 2
                                  ? "👥 2 Orang (Duo)"
                                  : "👤 1 Orang (Solo)"}
                              </p>
                            </div>
                            <StatusPill status={unit.status} />
                          </div>
                          <p className="text-xs font-bold text-emerald-700">
                            Rp {fmt(unit.harga)} / bulan
                          </p>
                          {unit.status === "TERISI" && unit.namaPenyewa && (
                            <p className="text-xs text-neutral-600 flex items-center gap-1">
                              <User className="h-3 w-3" /> {unit.namaPenyewa}
                            </p>
                          )}
                          {unit.tanggalMasuk && (
                            <p className="text-[10px] text-neutral-400">
                              {new Date(unit.tanggalMasuk).toLocaleDateString(
                                "id-ID",
                              )}{" "}
                              →{" "}
                              {unit.batasKontrak
                                ? new Date(
                                    unit.batasKontrak,
                                  ).toLocaleDateString("id-ID")
                                : "-"}
                            </p>
                          )}
                          {unit.deskripsi && (
                            <p className="text-[10px] text-neutral-500 line-clamp-2">
                              {unit.deskripsi}
                            </p>
                          )}
                          {/* Fasilitas chips */}
                          <div className="flex flex-wrap gap-1">
                            {FASILITAS_UNIT.filter((f) => unit[f.key]).map(
                              (f) => (
                                <span
                                  key={f.key}
                                  className="text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded-full text-neutral-600"
                                >
                                  {f.icon}
                                </span>
                              ),
                            )}
                          </div>
                          {/* Actions */}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => openEdit(unit)}
                              className="flex-1 py-1.5 text-[10px] font-bold bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition flex items-center justify-center gap-1"
                            >
                              <Edit3 className="h-3 w-3" /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(unit.id)}
                              disabled={unit.status === "TERISI"}
                              className="flex-1 py-1.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-3 w-3" /> Hapus
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              handleMaintenance(
                                unit.id,
                                unit.status !== "MAINTENANCE",
                              )
                            }
                            disabled={unit.status === "TERISI"}
                            className={`w-full py-1.5 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                              unit.status === "MAINTENANCE"
                                ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            <Wrench className="h-3 w-3" />
                            {unit.status === "MAINTENANCE"
                              ? "Selesai Maintenance"
                              : "Set Maintenance"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ HALAMAN: PENGAJUAN SEWA ═══ */}
          {ownerPage === "pengajuan-sewa" && (
            <motion.div
              key="ps"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">
                  Pengajuan Sewa
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Penyewa yang mengajukan sewa kamar kost Anda.
                </p>
              </header>
              {pengajuanList.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <ClipboardList className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">
                    Belum ada pengajuan sewa
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pengajuanList.map((app) => (
                    <PengajuanCard
                      key={app.id}
                      app={app}
                      onDecision={handlePengajuanDecision}
                      onPreview={setPreviewUrl}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ HALAMAN: TIKET PERBAIKAN ═══ */}
          {ownerPage === "tiket-perbaikan" && (
            <motion.div
              key="tp"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">
                  Tiket Perbaikan
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Laporan kerusakan dari penyewa. Proses setiap tiket.
                </p>
              </header>
              {tiketList.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <Wrench className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">
                    Belum ada tiket perbaikan
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tiketList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-neutral-200 rounded-2xl p-5"
                    >
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                              {item.kategori}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {item.tanggal}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-neutral-800">
                            {item.kendala}
                          </h4>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {item.detail}
                          </p>
                          {item.catatanOwner && (
                            <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />{" "}
                              {item.catatanOwner}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {/* Status badge */}
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              item.status === "SELESAI"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : item.status === "BARU"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : item.status === "DITOLAK"
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {item.status}
                          </span>
                          {/* Action buttons per status */}
                          {item.status === "BARU" && (
                            <>
                              <button
                                onClick={() =>
                                  handleTiketUpdate(item.id, "ACC")
                                }
                                className="px-3 py-1.5 bg-emerald-700 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition"
                              >
                                ACC
                              </button>
                              <button
                                onClick={() =>
                                  handleTiketUpdate(
                                    item.id,
                                    "DITOLAK",
                                    "Laporan tidak valid.",
                                  )
                                }
                                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-lg hover:bg-red-100 transition"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {item.status === "ACC" && (
                            <button
                              onClick={() =>
                                handleTiketUpdate(item.id, "DIPROSES")
                              }
                              className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition"
                            >
                              Mulai Proses
                            </button>
                          )}
                          {item.status === "DIPROSES" && (
                            <button
                              onClick={() =>
                                handleTiketUpdate(item.id, "SELESAI")
                              }
                              className="px-3 py-1.5 bg-emerald-700 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition"
                            >
                              Selesaikan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ HALAMAN: INFO KOST ═══ */}
          {ownerPage === "info-kost" && (
            <motion.div
              key="ik"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">
                  Info Kost
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Atur profil kost Anda. Data ini akan muncul di halaman pencari
                  kamar.
                </p>
              </header>
              <form
                onSubmit={handleSaveInfoKost}
                className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-5"
              >
                <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-3">
                  Identitas Kost
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">
                      Nama Kost
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kost Eksklusif Setia Budi"
                      value={infoForm.namaKost}
                      onChange={(e) =>
                        setInfoForm((f) => ({ ...f, namaKost: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">
                      Daerah / Kecamatan
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Setia Budi"
                      value={infoForm.daerah}
                      onChange={(e) =>
                        setInfoForm((f) => ({ ...f, daerah: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">
                      Kategori Kost
                    </label>
                    <select
                      value={infoForm.kategori}
                      onChange={(e) =>
                        setInfoForm((f) => ({ ...f, kategori: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Putra">🧑 Putra</option>
                      <option value="Putri">👩 Putri</option>
                      <option value="Campur">👫 Campur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">
                      Harga Dasar / Bulan (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="1500000"
                      min={100000}
                      value={infoForm.hargaDasar}
                      onChange={(e) =>
                        setInfoForm((f) => ({
                          ...f,
                          hargaDasar: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Nomor WhatsApp Pemilik
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="6281234567890"
                      value={infoForm.nomorWhatsApp}
                      onChange={(e) =>
                        setInfoForm((f) => ({
                          ...f,
                          nomorWhatsApp: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Format: 628xxx (tanpa +, dengan kode negara)
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Alamat Lengkap
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Setia Budi No. 88, Kel. Tanjung Rejo, Medan Sunggal"
                    value={infoForm.alamatLengkap}
                    onChange={(e) =>
                      setInfoForm((f) => ({
                        ...f,
                        alamatLengkap: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                  />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-3">
                  Fasilitas Umum Kost
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {FASILITAS_KOST.map((f) => (
                    <label
                      key={f.key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                        infoForm[f.key]
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!infoForm[f.key]}
                        onChange={() =>
                          setInfoForm((p) => ({ ...p, [f.key]: !p[f.key] }))
                        }
                        className="rounded accent-emerald-600"
                      />
                      <span className="text-xs font-medium text-neutral-700">
                        {f.icon} {f.label}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={savingInfo}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {savingInfo
                    ? "Menyimpan..."
                    : infoKost
                      ? "Update Info Kost"
                      : "Simpan Info Kost"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Modals ── */}
      {showAddModal && (
        <KamarFormModal
          isEdit={false}
          form={addForm}
          setForm={setAddForm}
          onSubmit={handleAddUnit}
          onClose={() => setShowAddModal(false)}
          uploading={uploading}
        />
      )}
      {editId && (
        <KamarFormModal
          isEdit={true}
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleEditUnit}
          onClose={() => setEditId(null)}
          uploading={uploading}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 mb-2">
              Hapus Unit Kamar?
            </h3>
            <p className="text-xs text-neutral-500 mb-5">
              Tindakan ini tidak dapat dibatalkan. Unit kamar akan dihapus
              secara permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUnit}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
