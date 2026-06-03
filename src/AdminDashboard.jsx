import React, { useState } from "react";
import {
  UserCheck,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Home,
  Shield,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BERKAS_STATUS_COLOR = {
  DISETUJUI: "bg-emerald-100 text-emerald-700 border-emerald-300",
  DITOLAK: "bg-red-100 text-red-700 border-red-300",
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  BELUM: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    DISETUJUI: "bg-emerald-100 text-emerald-700 border-emerald-200",
    DITOLAK: "bg-red-100 text-red-700 border-red-200",
    BELUM: "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  const label = {
    PENDING: "⏳ Menunggu",
    DISETUJUI: "✓ Disetujui",
    DITOLAK: "✗ Ditolak",
    BELUM: "Belum Lengkap",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${map[status] || map.BELUM}`}
    >
      {label[status] || status}
    </span>
  );
}

// ── BerkasRow: satu baris berkas dengan tombol Setuju/Tolak per item ─────────
function BerkasRow({
  label,
  url,
  status,
  komentar,
  onSetuju,
  onTolak,
  onPreview,
}) {
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState("");
  const sudahDiproses = status === "DISETUJUI" || status === "DITOLAK";

  const kirimTolak = () => {
    if (!comment.trim()) return;
    onTolak(comment.trim());
    setComment("");
    setShowForm(false);
  };

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-neutral-50">
        {/* Nama berkas + status */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-neutral-700">{label}</p>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border mt-0.5 inline-block ${BERKAS_STATUS_COLOR[status] || BERKAS_STATUS_COLOR.BELUM}`}
          >
            {status || "BELUM"}
          </span>
        </div>
        {/* Tombol lihat dokumen */}
        {url ? (
          <button
            onClick={() => onPreview(url)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-white border border-neutral-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition"
          >
            <Eye className="h-3 w-3" /> Lihat
          </button>
        ) : (
          <span className="text-[10px] text-neutral-400 px-2">
            Tidak ada file
          </span>
        )}
        {/* Aksi — hanya tampil jika belum diproses */}
        {!sudahDiproses && url && (
          <>
            <button
              onClick={onSetuju}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <CheckCircle className="h-3 w-3" /> Setuju
            </button>
            <button
              onClick={() => setShowForm((f) => !f)}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition"
            >
              <XCircle className="h-3 w-3" /> Tolak
            </button>
          </>
        )}
      </div>
      {/* Form komentar penolakan */}
      {showForm && (
        <div className="p-3 bg-red-50 border-t border-red-200 flex flex-col gap-2">
          <label className="text-[10px] font-bold text-red-700">
            Instruksi / alasan penolakan:
          </label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contoh: Foto KTP buram, harap upload ulang dengan kualitas lebih baik."
            className="w-full px-3 py-2 text-xs border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setComment("");
              }}
              className="flex-1 py-1.5 text-xs font-bold bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              Batal
            </button>
            <button
              onClick={kirimTolak}
              disabled={!comment.trim()}
              className="flex-1 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40"
            >
              Kirim Penolakan
            </button>
          </div>
        </div>
      )}
      {/* Komentar yang sudah dikirim */}
      {status === "DITOLAK" && komentar && (
        <div className="p-3 bg-red-50 border-t border-red-100 flex gap-2 items-start">
          <MessageSquare className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-800 font-medium">{komentar}</p>
        </div>
      )}
    </div>
  );
}

// ── VerifikasiCard – kartu utama tiap pengaju ────────────────────────────────
function VerifikasiCard({ item, type, onBerkasAction, onPreview }) {
  const [expanded, setExpanded] = useState(false);

  // Tentukan daftar berkas sesuai tipe
  const berkasConfig =
    type === "user"
      ? [
          {
            label: "KTP",
            urlKey: "ktpUrl",
            statusKey: "ktpStatus",
            komentarKey: "ktpKomentar",
            berkasId: "ktp",
          },
          {
            label: "KK",
            urlKey: "kkUrl",
            statusKey: "kkStatus",
            komentarKey: "kkKomentar",
            berkasId: "kk",
          },
          {
            label: "Foto Diri",
            urlKey: "fotoUrl",
            statusKey: "fotoStatus",
            komentarKey: "fotoKomentar",
            berkasId: "foto",
          },
        ]
      : [
          {
            label: "KTP",
            urlKey: "ktpUrl",
            statusKey: "ktpStatus",
            komentarKey: "ktpKomentar",
            berkasId: "ktp",
          },
          {
            label: "Surat Kepemilikan",
            urlKey: "suratKepemilikanUrl",
            statusKey: "suratKepemilikanStatus",
            komentarKey: "suratKepemilikanKomentar",
            berkasId: "suratKepemilikan",
          },
          {
            label: "Foto Kost",
            urlKey: "fotoKostUrl",
            statusKey: "fotoKostStatus",
            komentarKey: "fotoKostKomentar",
            berkasId: "fotoKost",
          },
        ];

  const overallStatus = item.verifikasiStatus || item.status || "PENDING";

  return (
    <div
      className={`bg-white border rounded-2xl shadow-xs overflow-hidden transition ${
        overallStatus === "PENDING"
          ? "border-amber-200"
          : overallStatus === "DISETUJUI"
            ? "border-emerald-200"
            : "border-red-200"
      }`}
    >
      {/* ── Header ── */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0">
              {(item.namaLengkap || "?")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={overallStatus} />
                {item.createdAt && (
                  <span className="text-[10px] text-neutral-400">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-neutral-800">
                {item.namaLengkap || "-"}
              </h4>
              <p className="text-xs text-neutral-500">
                {item.email || "-"}
                {item.noHp && ` • ${item.noHp}`}
              </p>
              {type === "owner" && item.namaKost && (
                <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <Building className="h-3 w-3" /> {item.namaKost} —{" "}
                  {item.daerah}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition shrink-0"
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {expanded ? "Tutup" : "Periksa Berkas"}
          </button>
        </div>
      </div>

      {/* ── Detail expandable ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-neutral-100 overflow-hidden"
          >
            <div className="p-5 flex flex-col gap-5">
              {/* Data diri */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Data Diri
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    {
                      label: "Nama",
                      val: item.namaLengkap,
                      icon: <User className="h-3 w-3" />,
                    },
                    {
                      label: "Email",
                      val: item.email,
                      icon: <FileText className="h-3 w-3" />,
                    },
                    {
                      label: "No. HP",
                      val: item.noHp,
                      icon: <Phone className="h-3 w-3" />,
                    },
                    {
                      label: "Pekerjaan",
                      val: item.pekerjaan,
                      icon: <Briefcase className="h-3 w-3" />,
                    },
                    {
                      label: "Jenis Kelamin",
                      val: item.jenisKelamin,
                      icon: <User className="h-3 w-3" />,
                    },
                    {
                      label: "Tgl Lahir",
                      val: item.tanggalLahir,
                      icon: <Calendar className="h-3 w-3" />,
                    },
                    {
                      label: "Tempat Lahir",
                      val: item.tempatLahir,
                      icon: <MapPin className="h-3 w-3" />,
                    },
                    {
                      label: "Alamat",
                      val: item.alamat,
                      icon: <Home className="h-3 w-3" />,
                    },
                    ...(type === "owner"
                      ? [
                          {
                            label: "Nama Kost",
                            val: item.namaKost,
                            icon: <Building className="h-3 w-3" />,
                          },
                          {
                            label: "Daerah",
                            val: item.daerah,
                            icon: <MapPin className="h-3 w-3" />,
                          },
                          {
                            label: "Alamat Kost",
                            val: item.alamatKost,
                            icon: <MapPin className="h-3 w-3" />,
                          },
                        ]
                      : []),
                  ]
                    .filter((f) => f.val)
                    .map((field) => (
                      <div
                        key={field.label}
                        className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-100"
                      >
                        <p className="text-[9px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                          {field.icon} {field.label}
                        </p>
                        <p className="text-xs font-bold text-neutral-800 mt-0.5 break-words">
                          {field.val}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Verifikasi per berkas */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  Verifikasi Berkas — Acc atau Tolak tiap dokumen secara
                  terpisah
                </p>
                <div className="flex flex-col gap-2">
                  {berkasConfig.map((b) => (
                    <BerkasRow
                      key={b.berkasId}
                      label={b.label}
                      url={item[b.urlKey]}
                      status={item[b.statusKey] || "PENDING"}
                      komentar={item[b.komentarKey]}
                      onPreview={onPreview}
                      onSetuju={() =>
                        onBerkasAction(
                          // user → pakai userId (PK biodata), owner → pakai id (PK pengajuan)
                          type === "user" ? item.userId || item.id : item.id,
                          b.berkasId,
                          "DISETUJUI",
                          "",
                        )
                      }
                      onTolak={(komentar) =>
                        onBerkasAction(
                          type === "user" ? item.userId || item.id : item.id,
                          b.berkasId,
                          "DITOLAK",
                          komentar,
                        )
                      }
                    />
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Status keseluruhan otomatis berubah saat semua berkas
                  diproses.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main AdminDashboard ──────────────────────────────────────────────────────
export default function AdminDashboard({
  currentUser,
  verifikasiDataDiriList,
  pengajuanOwnerList,
  onBerkasUserAction, // (userId, jenisBerkas, status, komentar)
  onBerkasOwnerAction, // (id,     jenisBerkas, status, komentar)
  // Backward-compat props lama (jika masih ada di App.jsx)
  handleDecisionVerifikasiDataDiri,
  handleDecisionPengajuanOwner,
}) {
  const [activeTab, setActiveTab] = useState("user");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Wrapper agar bisa pakai prop baru atau lama
  const handleBerkasUser =
    onBerkasUserAction ||
    ((userId, jenis, status, komentar) => {
      if (handleDecisionVerifikasiDataDiri)
        handleDecisionVerifikasiDataDiri(userId, status, komentar);
    });
  const handleBerkasOwner =
    onBerkasOwnerAction ||
    ((id, jenis, status, komentar) => {
      if (handleDecisionPengajuanOwner)
        handleDecisionPengajuanOwner(id, status, komentar);
    });

  const pendingUser = (verifikasiDataDiriList || []).filter(
    (v) => (v.verifikasiStatus || v.status) === "PENDING",
  ).length;
  const pendingOwner = (pengajuanOwnerList || []).filter(
    (p) => p.status === "PENDING",
  ).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-64 bg-zinc-900 text-zinc-100 p-5 flex flex-col gap-6 shrink-0 lg:h-[calc(100vh-68px)] lg:sticky lg:top-0">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 bg-zinc-800 rounded-lg">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Admin Panel</h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                PapiKost Control Center
              </p>
            </div>
          </div>
          <div className="px-3 py-2 bg-zinc-800 rounded-xl">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
              Login sebagai
            </p>
            <p className="text-xs font-bold text-white mt-0.5">
              {currentUser?.name}
            </p>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
              ID: {currentUser?.id}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            {
              key: "user",
              icon: <UserCheck className="h-4 w-4" />,
              label: "Verifikasi User",
              badge: pendingUser,
              desc: "Biodata penyewa",
            },
            {
              key: "owner",
              icon: <Building className="h-4 w-4" />,
              label: "Verifikasi Owner",
              badge: pendingOwner,
              desc: "Pendaftar pemilik kost",
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`px-4 py-3 rounded-xl flex items-start gap-3 transition text-left ${
                activeTab === item.key
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <span className="mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[10px] mt-0.5 ${activeTab === item.key ? "text-emerald-100" : "text-zinc-600"}`}
                >
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* Stats mini */}
        <div className="mt-auto bg-zinc-800 rounded-xl p-3">
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-2">
            Ringkasan
          </p>
          {[
            {
              label: "User pending",
              val: pendingUser,
              color: "text-amber-400",
            },
            {
              label: "Owner pending",
              val: pendingOwner,
              color: "text-amber-400",
            },
            {
              label: "User disetujui",
              val: (verifikasiDataDiriList || []).filter(
                (v) => (v.verifikasiStatus || v.status) === "DISETUJUI",
              ).length,
              color: "text-emerald-400",
            },
            {
              label: "Owner disetujui",
              val: (pengajuanOwnerList || []).filter(
                (p) => p.status === "DISETUJUI",
              ).length,
              color: "text-emerald-400",
            },
          ].map((s) => (
            <div key={s.label} className="flex justify-between text-xs mt-1">
              <span className="text-zinc-400">{s.label}</span>
              <span className={`font-bold ${s.color}`}>{s.val}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* TAB: VERIFIKASI USER */}
          {activeTab === "user" && (
            <motion.div
              key="user"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">
                  Verifikasi User
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Tinjau biodata dan berkas penyewa. Acc atau tolak tiap berkas
                  secara terpisah. Setelah semua berkas disetujui, penyewa bisa
                  menyewa kamar.
                </p>
              </header>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  {
                    label: "Total",
                    val: (verifikasiDataDiriList || []).length,
                    color: "bg-neutral-50 border-neutral-200 text-neutral-800",
                  },
                  {
                    label: "Menunggu",
                    val: pendingUser,
                    color: "bg-amber-50 border-amber-200 text-amber-700",
                  },
                  {
                    label: "Disetujui",
                    val: (verifikasiDataDiriList || []).filter(
                      (v) => (v.verifikasiStatus || v.status) === "DISETUJUI",
                    ).length,
                    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`${s.color} border rounded-xl p-4`}
                  >
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {s.label}
                    </p>
                    <p className="text-2xl font-black mt-1">{s.val}</p>
                  </div>
                ))}
              </div>

              {(verifikasiDataDiriList || []).length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <UserCheck className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">
                    Belum ada pengajuan verifikasi user
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Pengajuan baru akan muncul di sini saat user menyimpan
                    biodata.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {(verifikasiDataDiriList || []).map((item) => (
                    <VerifikasiCard
                      key={item.userId || item.id}
                      item={item}
                      type="user"
                      onBerkasAction={handleBerkasUser}
                      onPreview={setPreviewUrl}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: VERIFIKASI OWNER */}
          {activeTab === "owner" && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">
                  Verifikasi Owner
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Tinjau berkas pendaftar pemilik kost. Acc atau tolak tiap
                  berkas secara terpisah. Setelah semua disetujui, role akun
                  otomatis berubah menjadi "pemilik".
                </p>
              </header>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  {
                    label: "Total",
                    val: (pengajuanOwnerList || []).length,
                    color: "bg-neutral-50 border-neutral-200 text-neutral-800",
                  },
                  {
                    label: "Menunggu",
                    val: pendingOwner,
                    color: "bg-amber-50 border-amber-200 text-amber-700",
                  },
                  {
                    label: "Disetujui",
                    val: (pengajuanOwnerList || []).filter(
                      (p) => p.status === "DISETUJUI",
                    ).length,
                    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`${s.color} border rounded-xl p-4`}
                  >
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {s.label}
                    </p>
                    <p className="text-2xl font-black mt-1">{s.val}</p>
                  </div>
                ))}
              </div>

              {(pengajuanOwnerList || []).length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <Building className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">
                    Belum ada pengajuan owner
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {(pengajuanOwnerList || []).map((item) => (
                    <VerifikasiCard
                      key={item.id}
                      item={item}
                      type="owner"
                      onBerkasAction={handleBerkasOwner}
                      onPreview={setPreviewUrl}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Image Preview Modal */}
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
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 text-sm font-bold flex items-center gap-1"
            >
              ✕ Tutup
            </button>
            <img
              src={previewUrl}
              alt="Preview dokumen"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-white p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
