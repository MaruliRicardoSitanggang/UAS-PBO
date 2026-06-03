import React, { useState } from "react";
import {
  UserCheck, Building, CheckCircle, XCircle, Clock, Eye,
  MessageSquare, FileText, ChevronDown, ChevronUp, AlertCircle,
  User, Phone, MapPin, Briefcase, Calendar, Home, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const fmt = (n) => n?.toLocaleString("id-ID");

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:   "bg-amber-100 text-amber-700 border-amber-200",
    DISETUJUI: "bg-emerald-100 text-emerald-700 border-emerald-200",
    DITOLAK:   "bg-red-100 text-red-700 border-red-200",
    BELUM:     "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  const label = {
    PENDING:   "⏳ Menunggu",
    DISETUJUI: "✓ Disetujui",
    DITOLAK:   "✗ Ditolak",
    BELUM:     "Belum Lengkap",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${map[status] || map.BELUM}`}>
      {label[status] || status}
    </span>
  );
}

// ── Document Badge ───────────────────────────────────────────────────────────
function DocBadge({ label, value, onView }) {
  if (!value) return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-neutral-100 text-neutral-400 border-neutral-200 flex items-center gap-1">
      <XCircle className="h-3 w-3" /> {label}: Tidak ada
    </span>
  );
  return (
    <button
      onClick={onView}
      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition"
    >
      <Eye className="h-3 w-3" /> {label}: Lihat
    </button>
  );
}

// ── Verifikasi Card Component ────────────────────────────────────────────────
function VerifikasiCard({ item, type, onDecision, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const handleTolak = () => {
    if (!showRejectForm) { setShowRejectForm(true); return; }
    if (!rejectComment.trim()) return;
    onDecision(item.id || item.userId, "DITOLAK", rejectComment);
    setShowRejectForm(false);
    setRejectComment("");
  };

  const handleSetujui = () => {
    onDecision(item.id || item.userId, "DISETUJUI", "");
    setShowRejectForm(false);
  };

  const isPending = item.status === "PENDING" || !item.status;

  return (
    <div className={`bg-white border rounded-2xl shadow-xs overflow-hidden transition ${
      item.status === "PENDING" || !item.status ? "border-amber-200" :
      item.status === "DISETUJUI" ? "border-emerald-200" : "border-red-200"
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Avatar + Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
              {(item.namaLengkap || "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={item.status || "PENDING"} />
                {item.createdAt && (
                  <span className="text-[10px] text-neutral-400">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-neutral-800">{item.namaLengkap || "-"}</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {item.email || "-"}
                {item.noHp && <span> • {item.noHp}</span>}
              </p>
              {type === "owner" && item.namaKost && (
                <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <Building className="h-3 w-3" /> {item.namaKost} — {item.daerah}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition">
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Tutup" : "Detail"}
            </button>
            {isPending && (
              <>
                <button onClick={() => setShowRejectForm(f => !f)}
                  className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 text-xs font-bold transition border border-neutral-200">
                  Tolak
                </button>
                <button onClick={handleSetujui}
                  className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow">
                  Setujui
                </button>
              </>
            )}
            {!isPending && (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${
                item.status === "DISETUJUI" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>{item.status}</span>
            )}
          </div>
        </div>

        {/* Reject comment form */}
        {showRejectForm && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2">
            <label className="text-xs font-bold text-red-700">Alasan / instruksi penolakan:</label>
            <textarea rows={2} value={rejectComment} onChange={e => setRejectComment(e.target.value)}
              placeholder="Contoh: Foto KTP tidak jelas, harap upload ulang..."
              className="w-full px-3 py-2 text-xs border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowRejectForm(false)}
                className="flex-1 py-1.5 text-xs font-bold bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition">
                Batal
              </button>
              <button onClick={handleTolak} disabled={!rejectComment.trim()}
                className="flex-1 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-40">
                Kirim Penolakan
              </button>
            </div>
          </div>
        )}

        {/* Komentar penolakan yang sudah dikirim */}
        {item.status === "DITOLAK" && item.komentarAdmin && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Instruksi Admin
            </p>
            <p className="text-xs text-red-800">{item.komentarAdmin}</p>
          </div>
        )}
      </div>

      {/* Detail Expandable */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-neutral-100 overflow-hidden">
            <div className="p-5 flex flex-col gap-4">

              {/* Data diri */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Data Diri</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { label: "Nama", val: item.namaLengkap, icon: <User className="h-3 w-3" /> },
                    { label: "Email", val: item.email, icon: <FileText className="h-3 w-3" /> },
                    { label: "No. HP", val: item.noHp, icon: <Phone className="h-3 w-3" /> },
                    { label: "Pekerjaan", val: item.pekerjaan, icon: <Briefcase className="h-3 w-3" /> },
                    { label: "Jenis Kelamin", val: item.jenisKelamin, icon: <User className="h-3 w-3" /> },
                    { label: "Tgl Lahir", val: item.tanggalLahir, icon: <Calendar className="h-3 w-3" /> },
                    { label: "Tempat Lahir", val: item.tempatLahir, icon: <MapPin className="h-3 w-3" /> },
                    { label: "Alamat", val: item.alamat, icon: <Home className="h-3 w-3" /> },
                    ...(type === "owner" ? [
                      { label: "Nama Kost", val: item.namaKost, icon: <Building className="h-3 w-3" /> },
                      { label: "Daerah", val: item.daerah, icon: <MapPin className="h-3 w-3" /> },
                      { label: "Alamat Kost", val: item.alamatKost, icon: <MapPin className="h-3 w-3" /> },
                    ] : []),
                  ].filter(f => f.val).map(field => (
                    <div key={field.label} className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                        {field.icon} {field.label}
                      </p>
                      <p className="text-xs font-bold text-neutral-800 mt-0.5 truncate">{field.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Berkas */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Berkas Dokumen</p>
                <div className="flex flex-wrap gap-2">
                  {type === "user" && <>
                    <DocBadge label="KTP" value={item.ktpUrl} onView={() => onPreview(item.ktpUrl)} />
                    <DocBadge label="KK" value={item.kkUrl} onView={() => onPreview(item.kkUrl)} />
                    <DocBadge label="Foto Diri" value={item.fotoUrl} onView={() => onPreview(item.fotoUrl)} />
                  </>}
                  {type === "owner" && <>
                    <DocBadge label="KTP" value={item.ktpUrl} onView={() => onPreview(item.ktpUrl)} />
                    <DocBadge label="Surat Kepemilikan" value={item.suratKepemilikanUrl} onView={() => onPreview(item.suratKepemilikanUrl)} />
                    <DocBadge label="Foto Kost" value={item.fotoKostUrl} onView={() => onPreview(item.fotoKostUrl)} />
                  </>}
                </div>
              </div>

              {/* Persetujuan per berkas */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Acc per Berkas
                </p>
                <div className="flex flex-wrap gap-2">
                  {(type === "user"
                    ? [{ label: "KTP", key: "ktp" }, { label: "KK", key: "kk" }, { label: "Foto Diri", key: "foto" }]
                    : [{ label: "KTP", key: "ktp" }, { label: "Surat Kepemilikan", key: "surat" }, { label: "Foto Kost", key: "fotoKost" }]
                  ).map(doc => {
                    const docStatus = item[`status_${doc.key}`] || "PENDING";
                    return (
                      <div key={doc.key} className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-bold text-neutral-700">{doc.label}</span>
                        {docStatus === "DISETUJUI" ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        ) : docStatus === "DITOLAK" ? (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main AdminDashboard Component ────────────────────────────────────────────
export default function AdminDashboard({
  currentUser,
  verifikasiDataDiriList,
  pengajuanOwnerList,
  handleDecisionVerifikasiDataDiri,
  handleDecisionPengajuanOwner,
}) {
  const [activeTab, setActiveTab] = useState("user"); // "user" | "owner"
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDecisionWithComment = (id, status, comment, type) => {
    if (type === "user") handleDecisionVerifikasiDataDiri(id, status, comment);
    else handleDecisionPengajuanOwner(id, status, comment);
  };

  const pendingUser  = verifikasiDataDiriList.filter(v => v.status === "PENDING" || !v.status).length;
  const pendingOwner = pengajuanOwnerList.filter(p => p.status === "PENDING" || !p.status).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row">

      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-zinc-900 text-zinc-100 p-5 flex flex-col gap-6 shrink-0 lg:h-[calc(100vh-68px)] lg:sticky lg:top-0">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 bg-zinc-800 rounded-lg">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Admin Panel</h3>
              <p className="text-[10px] text-zinc-500 font-mono">Control Center</p>
            </div>
          </div>
          {/* Admin profile */}
          <div className="mt-3 px-3 py-2 bg-zinc-800 rounded-xl">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Login sebagai</p>
            <p className="text-xs font-bold text-white mt-0.5">{currentUser?.name}</p>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">ID: {currentUser?.id}</p>
          </div>
        </div>

        {/* Navbar — hanya 2 menu */}
        <nav className="flex flex-col gap-1">
          {[
            {
              key: "user",
              icon: <UserCheck className="h-4 w-4" />,
              label: "Verifikasi User",
              badge: pendingUser,
              desc: "Biodata penyewa"
            },
            {
              key: "owner",
              icon: <Building className="h-4 w-4" />,
              label: "Verifikasi Owner",
              badge: pendingOwner,
              desc: "Pendaftar pemilik kost"
            },
          ].map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`px-4 py-3 rounded-xl flex items-start gap-3 transition text-left ${
                activeTab === item.key ? "bg-emerald-600 text-white" : "text-zinc-400 hover:bg-zinc-800"
              }`}>
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
                <p className={`text-[10px] mt-0.5 ${activeTab === item.key ? "text-emerald-100" : "text-zinc-600"}`}>
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* Stats ringkas */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="bg-zinc-800 rounded-xl p-3">
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-2">Ringkasan</p>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">User pending</span>
              <span className="text-amber-400 font-bold">{pendingUser}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-zinc-400">Owner pending</span>
              <span className="text-amber-400 font-bold">{pendingOwner}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-zinc-400">Total diproses</span>
              <span className="text-emerald-400 font-bold">
                {verifikasiDataDiriList.filter(v => v.status === "DISETUJUI").length +
                 pengajuanOwnerList.filter(p => p.status === "DISETUJUI").length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ── TAB: VERIFIKASI USER ── */}
          {activeTab === "user" && (
            <motion.div key="user" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Verifikasi User</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Tinjau biodata dan berkas penyewa yang mengajukan verifikasi. Setelah disetujui, penyewa bisa menyewa kamar.
                </p>
              </header>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Total", val: verifikasiDataDiriList.length, color: "bg-neutral-50 border-neutral-200 text-neutral-800" },
                  { label: "Menunggu", val: pendingUser, color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { label: "Disetujui", val: verifikasiDataDiriList.filter(v => v.status === "DISETUJUI").length, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map(s => (
                  <div key={s.label} className={`${s.color} border rounded-xl p-4`}>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-2xl font-black mt-1 ${s.color.split(" ").find(c => c.startsWith("text-"))}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {verifikasiDataDiriList.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <UserCheck className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">Belum ada pengajuan verifikasi user</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {verifikasiDataDiriList.map(item => (
                    <VerifikasiCard key={item.id || item.userId} item={item} type="user"
                      onDecision={(id, status, comment) => handleDecisionWithComment(id, status, comment, "user")}
                      onPreview={setPreviewUrl} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB: VERIFIKASI OWNER ── */}
          {activeTab === "owner" && (
            <motion.div key="owner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <header className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Verifikasi Owner</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Tinjau biodata, berkas, dan info kost dari pendaftar sebagai pemilik kost. Jika ditolak, berikan instruksi perbaikan.
                </p>
              </header>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Total", val: pengajuanOwnerList.length, color: "bg-neutral-50 border-neutral-200 text-neutral-800" },
                  { label: "Menunggu", val: pendingOwner, color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { label: "Disetujui", val: pengajuanOwnerList.filter(p => p.status === "DISETUJUI").length, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map(s => (
                  <div key={s.label} className={`${s.color} border rounded-xl p-4`}>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-2xl font-black mt-1 ${s.color.split(" ").find(c => c.startsWith("text-"))}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {pengajuanOwnerList.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <Building className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500">Belum ada pengajuan owner</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pengajuanOwnerList.map(item => (
                    <VerifikasiCard key={item.id} item={item} type="owner"
                      onDecision={(id, status, comment) => handleDecisionWithComment(id, status, comment, "owner")}
                      onPreview={setPreviewUrl} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 text-sm font-bold flex items-center gap-1">
              ✕ Tutup
            </button>
            <img src={previewUrl} alt="Preview dokumen"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
