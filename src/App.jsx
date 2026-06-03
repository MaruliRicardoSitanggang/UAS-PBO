import AdminDashboard from './AdminDashboard';
import OwnerDashboard from './OwnerDashboard';
import React, { useState, useEffect } from "react";
import {
  Search, Bell, LayoutDashboard, Bed, ClipboardCheck, ClipboardList,
  Ticket, AlertTriangle, MapPin, Calendar, CreditCard, Briefcase,
  Send, History, Plus, Phone, Users, ShieldAlert, ArrowLeft,
  ArrowRight, ChevronLeft, ChevronRight, Image, Check, X,
  Eye, EyeOff, User, Code, Database, Layers, Terminal, BookOpen, Copy,
  FileText, Upload, UserCheck, Building, Bell as BellIcon, CheckCircle,
  XCircle, Clock, Home, Settings, LogOut, Star, Wifi, Wind, Bath,
  BookOpen as BookIcon, ChevronDown, ChevronUp, Info, AlertCircle,
  Key as KeyIcon, DoorOpen, CalendarDays, Wrench, BarChart3, TrendingUp,
  PlusCircle, Edit3, Trash2, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { javaFiles } from "./javaCodeData";
import LoginPage from "./LoginPage.jsx";


// ─── Static mock listings ────────────────────────────────────────────────────
const INITIAL_KAMAR_KOST = [
  {
    id: 1, namaKost: "Kost Putra Padang Bulan", daerah: "Padang Bulan",
    hargaDasar: 1500000, status: "Tersedia 2 Kamar", rating: 4.8,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true, mejaBelajar: true, ac: false, availableRooms: 2,
    description: "Kost premium minimalis dengan pencahayaan alami melimpah, dirancang khusus untuk kenyamanan belajar mahasiswa USU dekat pintu gerbang utama."
  },
  {
    id: 2, namaKost: "Kost Eksklusif Setia Budi", daerah: "Setia Budi",
    hargaDasar: 2200000, status: "Tersedia", rating: 4.9,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true, ac: true, kamarMandiDalam: true, kasurSpringbed: true, mejaBelajar: true, availableRooms: 5,
    description: "Kost mewah berfasilitas lengkap dekat pusat kuliner Setia Budi Medan. Dilengkapi AC, kamar mandi dalam, smart lock, dan area parkir luas."
  },
  {
    id: 3, namaKost: "Kost Putri Dr. Mansyur", daerah: "Dr. Mansyur",
    hargaDasar: 1300000, status: "Sisa 1 Kamar", rating: 4.7,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true, dapurBersama: true, availableRooms: 1,
    description: "Kost putri asri dan kondusif berlokasi strategis di Jalan Dr. Mansyur Medan, persis di seberang Kampus USU. Lingkungan aman dengan penjagaan sekuriti 24 jam."
  },
  {
    id: 4, namaKost: "Kost Sejahtera Helvetia", daerah: "Helvetia",
    hargaDasar: 900000, status: "Penuh", rating: 4.3,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600",
    wifiCepat: false, ac: false, availableRooms: 0,
    description: "Kost sederhana di kawasan Helvetia, cocok untuk pekerja dengan budget terbatas."
  }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString("id-ID");

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("papikost_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [protectedError, setProtectedError] = useState(null);

  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem("papikost_user");
    if (saved) return JSON.parse(saved).role;
    return "pencari";
  });

  // Sub-pages
  // pencari: "beranda" | "biodata" | "kamar-saya" | "notifikasi"
  // kamar-saya sub: "laporan" | "masa-sewa" | "fasilitas"
  const [userPage, setUserPage] = useState("beranda");
  const [kamarSayaTab, setKamarSayaTab] = useState("laporan");

  // admin: "verifikasi-pemilik" | "verifikasi-berkas" | "pengajuan-owner" | "tiket-perbaikan"
  const [adminPage, setAdminPage] = useState("verifikasi-data-diri");

  // owner: "dashboard" | "manajemen-kamar" | "pengajuan-sewa" | "tiket-perbaikan" | "keuangan"
  const [ownerPage, setOwnerPage] = useState("dashboard");

  // Kost & room
  const [activeKamarList, setActiveKamarList] = useState(INITIAL_KAMAR_KOST);
  const [selectedKamar, setSelectedKamar] = useState(null);

  // Search/filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("Padang Bulan");
  const [filterDurasi, setFilterDurasi] = useState("Bulanan");
  const [filterHarga, setFilterHarga] = useState("Rp 1 Jt - 2 Jt");

  // Laporan
  const [laporanList, setLaporanList] = useState([]);
  const [newKategori, setNewKategori] = useState("");
  const [newKendala, setNewKendala] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [notifReport, setNotifReport] = useState(null);

  // Verifikasi pemilik (admin)
  const [verifikasiList, setVerifikasiList] = useState([]);

  // Pengajuan sewa (admin now handles this)
  const [pengajuanSewa, setPengajuanSewa] = useState([]);

  // Biodata user
  const [biodata, setBiodata] = useState(null);
  const [biodataForm, setBiodataForm] = useState({
    namaLengkap: "", tanggalLahir: "", tempatLahir: "", jenisKelamin: "",
    noHp: "", alamat: "", pekerjaan: "", ktpUrl: "", kkUrl: "", fotoUrl: ""
  });
  const [biodataSaving, setBiodataSaving] = useState(false);
  const [biodataMsg, setBiodataMsg] = useState(null);

  // Invite patungan
  const [inviteList, setInviteList] = useState([]);
  const [inviteTargetId, setInviteTargetId] = useState("");
  const [inviteJumlah, setInviteJumlah] = useState(2);
  const [inviteDurasi, setInviteDurasi] = useState(6);
  const [inviteMsg, setInviteMsg] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Pengajuan owner
  const [pengajuanOwnerList, setPengajuanOwnerList] = useState([]);

  // File upload previews
  const [biodataFiles, setBiodataFiles] = useState({ ktpUrl: null, kkUrl: null, fotoUrl: null });

  // Mock kamar data for owner
  const [kamarOwnerList, setKamarOwnerList] = useState([
    { id: 1, nomor: "Kamar 01", lantai: 1, harga: 1800000, status: "Terisi", penyewa: "Andreas Pegri Damanik", masukSejak: "01/10/2025", kontrakHingga: "01/04/2026" },
    { id: 2, nomor: "Kamar 02", lantai: 1, harga: 1800000, status: "Terisi", penyewa: "Maruli Ricardo", masukSejak: "01/10/2025", kontrakHingga: "01/04/2026" },
    { id: 3, nomor: "Kamar 03", lantai: 1, harga: 1800000, status: "Kosong", penyewa: null, masukSejak: null, kontrakHingga: null },
    { id: 4, nomor: "Kamar 04", lantai: 2, harga: 2000000, status: "Terisi", penyewa: "Sari Dewi", masukSejak: "15/09/2025", kontrakHingga: "15/03/2026" },
    { id: 5, nomor: "Kamar 05", lantai: 2, harga: 2000000, status: "Kosong", penyewa: null, masukSejak: null, kontrakHingga: null },
    { id: 6, nomor: "Kamar 06", lantai: 2, harga: 2000000, status: "Maintenance", penyewa: null, masukSejak: null, kontrakHingga: null },
  ]);

  // Verifikasi berkas penyewa (admin)
  const [verifikasiBerkasList, setVerifikasiBerkasList] = useState([]);

  // Verifikasi data diri (admin)
  const [verifikasiDataDiriList, setVerifikasiDataDiriList] = useState([]);

  // Pengajuan sewa kos (ke owner)
  const [pengajuanSewaKosList, setPengajuanSewaKosList] = useState([]);

  // Java inspector
  const [activeJavaFile, setActiveJavaFile] = useState("Akun.java");
  const [copied, setCopied] = useState(false);

  // Reservation calculator
  const [calcTipe, setCalcTipe] = useState("solo");
  const [calcHargaDasar, setCalcHargaDasar] = useState(1500000);
  const [calcDurasi, setCalcDurasi] = useState(6);
  const [calcJumlahOrang, setCalcJumlahOrang] = useState(2);
  const [apiResult, setApiResult] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);

  // Sewa form
  const [showSewaForm, setShowSewaForm] = useState(false);
  const [sewaMsg, setSewaMsg] = useState(null);

  // Owner: add/edit kamar form
  const [showAddKamar, setShowAddKamar] = useState(false);
  const [addKamarForm, setAddKamarForm] = useState({ nomor: "", lantai: 1, harga: 1500000 });
  const [editKamarId, setEditKamarId] = useState(null);
  const [editKamarForm, setEditKamarForm] = useState({ nomor: "", lantai: 1, harga: 1500000 });
  const [showEditKamar, setShowEditKamar] = useState(false);
  const [showDeleteKamarId, setShowDeleteKamarId] = useState(null);

  // Image preview modal
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Owner: info kost form
  const [ownerKostInfo, setOwnerKostInfo] = useState({
    namaKost: "Kost Eksklusif Setia Budi",
    alamat: "Jl. Setia Budi No. 88, Medan",
    daerah: "Setia Budi",
    deskripsi: "Kost mewah berfasilitas lengkap dekat pusat kuliner Setia Budi Medan.",
    hargaDasar: 1800000,
    fasilitas: ["WiFi Cepat", "AC", "Kamar Mandi Dalam", "Springbed", "Meja Belajar"]
  });
  const [ownerKostMsg, setOwnerKostMsg] = useState(null);

  // ─── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchKamarList = async () => {
    try {
      const r = await fetch("/api/kost/medan");
      if (r.ok) setActiveKamarList(await r.json());
    } catch { /* offline */ }
  };

  const fetchLaporanList = async () => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/laporan?userId=${currentUser.id}`);
      if (r.ok) setLaporanList(await r.json());
    } catch { /* offline */ }
  };

  const fetchVerifikasiList = async () => {
    // Backend tidak punya endpoint /api/verifikasi terpisah — pakai verifikasi-data-diri
    try {
      const r = await fetch("/api/verifikasi-data-diri");
      if (r.ok) setVerifikasiList(await r.json());
    } catch { /* offline */ }
  };

  const fetchPengajuanSewa = async () => {
    // Owner: GET /api/owner/pengajuan-masuk
    try {
      const r = await fetch("/api/owner/pengajuan-masuk");
      if (r.ok) setPengajuanSewa(await r.json());
    } catch { /* offline */ }
  };

  const fetchBiodata = async () => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/biodata/${currentUser.id}`);
      if (r.ok) {
        const data = await r.json();
        setBiodata(data);
        if (data) {
          setBiodataForm({
            namaLengkap: data.namaLengkap || "",
            tanggalLahir: data.tanggalLahir || "",
            tempatLahir: data.tempatLahir || "",
            jenisKelamin: data.jenisKelamin || "",
            noHp: data.noHp || "",
            alamat: data.alamat || "",
            pekerjaan: data.pekerjaan || "",
            ktpUrl: data.ktpUrl || "",
            kkUrl: data.kkUrl || "",
            fotoUrl: data.fotoUrl || ""
          });
        }
      }
    } catch { /* offline */ }
  };

  const fetchInvites = async () => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/invite/${currentUser.id}`);
      if (r.ok) setInviteList(await r.json());
    } catch { /* offline */ }
  };

  const fetchPengajuanOwner = async () => {
    try {
      const r = await fetch("/api/pengajuan-owner");
      if (r.ok) setPengajuanOwnerList(await r.json());
    } catch { /* offline */ }
  };

  const fetchVerifikasiBerkas = async () => {
    try {
      const r = await fetch("/api/verifikasi-berkas");
      if (r.ok) setVerifikasiBerkasList(await r.json());
    } catch { /* offline */ }
  };

  const fetchVerifikasiDataDiri = async () => {
    try {
      const r = await fetch("/api/verifikasi-data-diri");
      if (r.ok) setVerifikasiDataDiriList(await r.json());
    } catch { /* offline */ }
  };

  const fetchPengajuanSewaKos = async () => {
    // Penyewa: GET /api/pengajuan/:userId | Owner: GET /api/owner/pengajuan-masuk
    try {
      if (currentUser?.role === "pemilik") {
        const r = await fetch("/api/owner/pengajuan-masuk");
        if (r.ok) setPengajuanSewaKosList(await r.json());
      } else if (currentUser?.id) {
        const r = await fetch(`/api/pengajuan/${currentUser.id}`);
        if (r.ok) setPengajuanSewaKosList(await r.json());
      }
    } catch { /* offline */ }
  };

  const fetchReservationBill = () => {
    // Kalkulasi lokal — tidak perlu network request ke backend
    const total = calcTipe === "solo"
      ? calcHargaDasar * calcDurasi
      : (calcHargaDasar / calcJumlahOrang) * calcDurasi;
    setApiResult({
      idReservasi: calcTipe === "solo" ? "RES-SLO-200" : "RES-PTG-100",
      tipe: calcTipe,
      hargaDasarSewa: calcHargaDasar,
      durasiBulan: calcDurasi,
      totalTagihanHasil: total,
      deskripsiKonsep: `Reservasi${calcTipe === "solo" ? "Solo" : "Patungan"}.hitungTotalTagihan()`,
      formulaPBO: calcTipe === "solo"
        ? `Total = hargaDasar * ${calcDurasi}`
        : `Total = (hargaDasar / ${calcJumlahOrang}) * ${calcDurasi}`,
      jumlahOrang: calcTipe === "solo" ? 1 : calcJumlahOrang,
    });
  };

  useEffect(() => {
    if (currentUser) {
      fetchKamarList();
      fetchLaporanList();
      fetchVerifikasiList();
      fetchPengajuanSewa();
      fetchBiodata();
      fetchInvites();
      fetchPengajuanOwner();
      fetchVerifikasiBerkas();
      fetchVerifikasiDataDiri();
      fetchPengajuanSewaKos();
    }
  }, [currentUser]);

  useEffect(() => { fetchReservationBill(); }, [calcTipe, calcHargaDasar, calcDurasi, calcJumlahOrang]);

  // ─── Action handlers ────────────────────────────────────────────────────────
  const handleFileChange = (e, formType, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = file.name;
    const objectUrl = URL.createObjectURL(file);
    if (formType === "biodata") {
      setBiodataFiles(prev => ({ ...prev, [key]: { name: fileName, url: objectUrl } }));
      setBiodataForm(prev => ({ ...prev, [key]: fileName }));
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(javaFiles[activeJavaFile]?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!newKategori || !newKendala) return;
    try {
      const r = await fetch("/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kategori: newKategori, kendala: newKendala, detail: newDetail, userId: currentUser.id }),
      });
      if (r.ok) {
        setNewKategori(""); setNewKendala(""); setNewDetail("");
        setNotifReport("Laporan berhasil dikirim!");
        setTimeout(() => setNotifReport(null), 4000);
        await fetchLaporanList();
      }
    } catch {
      const newRep = {
        id: `REP-0${laporanList.length + 1}`, userId: currentUser.id,
        tanggal: new Date().toLocaleDateString("id-ID"),
        kategori: newKategori === "pipa" ? "Pipa Air" : newKategori === "listrik" ? "Listrik" : newKategori === "perabot" ? "Peralatan" : "Lainnya",
        kendala: newKendala, status: "BARU", detail: newDetail || "-"
      };
      setLaporanList([newRep, ...laporanList]);
      setNewKategori(""); setNewKendala(""); setNewDetail("");
      setNotifReport("Laporan berhasil dikirim!");
      setTimeout(() => setNotifReport(null), 4000);
    }
  };

  const handleDecisionPengajuan = async (id, decision) => {
    // Owner: PUT /api/owner/pengajuan-masuk/:id
    try {
      const r = await fetch(`/api/owner/pengajuan-masuk/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision })
      });
      if (r.ok) await fetchPengajuanSewa();
    } catch {
      setPengajuanSewa(pengajuanSewa.map(p => p.id === id ? { ...p, status: decision } : p));
    }
  };

  const handleDecisionVerifikasi = async (id, decision) => {
    // Admin: PUT /api/verifikasi-data-diri/:id
    try {
      const r = await fetch(`/api/verifikasi-data-diri/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision })
      });
      if (r.ok) await fetchVerifikasiList();
    } catch {
      setVerifikasiList(verifikasiList.map(v => v.id === id ? { ...v, status: decision } : v));
    }
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
        setBiodataMsg({ type: "success", text: "Data diri berhasil disimpan!" });
      }
    } catch {
      setBiodataMsg({ type: "error", text: "Gagal menyimpan, coba lagi." });
    } finally {
      setBiodataSaving(false);
      setTimeout(() => setBiodataMsg(null), 4000);
    }
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
          jumlahOrang: inviteJumlah, durasi: inviteDurasi
        })
      });
      const data = await r.json();
      if (r.ok) {
        setInviteMsg({ type: "success", text: "Undangan patungan berhasil dikirim!" });
        setInviteTargetId(""); setShowInviteForm(false);
        await fetchInvites();
      } else {
        setInviteMsg({ type: "error", text: data.error || "Gagal mengirim undangan." });
      }
    } catch {
      setInviteMsg({ type: "error", text: "Gagal tersambung ke server." });
    }
    setTimeout(() => setInviteMsg(null), 4000);
  };

  const handleRespondInvite = async (id, status) => {
    try {
      const r = await fetch(`/api/invite/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (r.ok) await fetchInvites();
    } catch { /* offline */ }
  };

  const handleDecisionVerifikasiBerkas = async (id, decision) => {
    try {
      const r = await fetch(`/api/verifikasi-berkas/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision })
      });
      if (r.ok) await fetchVerifikasiBerkas();
    } catch {
      setVerifikasiBerkasList(verifikasiBerkasList.map(v => v.id === id ? { ...v, status: decision } : v));
    }
  };

  const handleDecisionVerifikasiDataDiri = async (id, decision, comment = "") => {
    try {
      const r = await fetch(`/api/verifikasi-data-diri/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, komentarAdmin: comment })
      });
      if (r.ok) {
        await fetchVerifikasiDataDiri();
        await fetchBiodata();
      }
    } catch {
      setVerifikasiDataDiriList(verifikasiDataDiriList.map(v =>
        v.id === id ? { ...v, status: decision, komentarAdmin: comment } : v));
    }
  };

  const handleDecisionPengajuanSewaKos = async (id, decision) => {
    // Owner: PUT /api/owner/pengajuan-masuk/:id
    try {
      const r = await fetch(`/api/owner/pengajuan-masuk/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision })
      });
      if (r.ok) await fetchPengajuanSewaKos();
    } catch {
      setPengajuanSewaKosList(pengajuanSewaKosList.map(p => p.id === id ? { ...p, status: decision } : p));
    }
  };

  const handleDecisionPengajuanOwner = async (id, decision, comment = "") => {
    try {
      const r = await fetch(`/api/pengajuan-owner/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, komentarAdmin: comment })
      });
      if (r.ok) await fetchPengajuanOwner();
    } catch {
      setPengajuanOwnerList(pengajuanOwnerList.map(p =>
        p.id === id ? { ...p, status: decision, komentarAdmin: comment } : p));
    }
  };

  const handleSubmitSewa = async () => {
    if (!biodata?.isVerified) {
      setSewaMsg({ type: "error", text: "Data diri Anda belum diverifikasi admin. Tunggu konfirmasi verifikasi terlebih dahulu!" });
      return;
    }
    try {
      const r = await fetch("/api/pengajuan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(currentUser.id),
          kamarId: selectedKamar.id,
          tipeSewa: calcTipe,
          durasiBulan: calcDurasi,
          totalTagihan: apiResult?.totalTagihanHasil,
        })
      });
      if (r.ok) {
        setSewaMsg({ type: "success", text: "Pengajuan sewa berhasil dikirim ke pemilik kost! Tunggu konfirmasi dari owner." });
        setShowSewaForm(false);
        await fetchPengajuanSewaKos();
      }
    } catch {
      setSewaMsg({ type: "error", text: "Gagal mengirim pengajuan." });
    }
    setTimeout(() => setSewaMsg(null), 5000);
  };

  const handleAddKamar = (e) => {
    e.preventDefault();
    const newKamar = {
      id: kamarOwnerList.length + 1,
      nomor: addKamarForm.nomor,
      lantai: Number(addKamarForm.lantai),
      harga: Number(addKamarForm.harga),
      status: "Kosong",
      penyewa: null,
      masukSejak: null,
      kontrakHingga: null
    };
    setKamarOwnerList([...kamarOwnerList, newKamar]);
    setAddKamarForm({ nomor: "", lantai: 1, harga: 1500000 });
    setShowAddKamar(false);
  };

  const handleEditKamar = (e) => {
    e.preventDefault();
    setKamarOwnerList(kamarOwnerList.map(k =>
      k.id === editKamarId
        ? { ...k, nomor: editKamarForm.nomor, lantai: Number(editKamarForm.lantai), harga: Number(editKamarForm.harga) }
        : k
    ));
    setShowEditKamar(false);
    setEditKamarId(null);
  };

  const handleDeleteKamar = (id) => {
    setKamarOwnerList(kamarOwnerList.filter(k => k.id !== id));
    setShowDeleteKamarId(null);
  };

  const handleUpdateKamarStatus = (id, newStatus) => {
    setKamarOwnerList(kamarOwnerList.map(k => k.id === id ? { ...k, status: newStatus } : k));
  };

  const handleLogout = () => {
    localStorage.removeItem("papikost_user");
    setCurrentUser(null); setCurrentRole("pencari"); setProtectedError(null);
    setSelectedKamar(null); setUserPage("beranda");
  };

  // Pending invites for current user
  const pendingInvites = inviteList.filter(i => i.toUserId === currentUser?.id && i.status === "PENDING");

  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(userData) => {
          // userData sudah dinormalisasi di LoginPage (field langsung di root)
          setCurrentUser(userData);
          localStorage.setItem("papikost_user", JSON.stringify(userData));
          setCurrentRole(userData.role);
          setProtectedError(null);
        }}
      />
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">

      {/* HEADER */}
      <div className="bg-emerald-950 text-white shadow-md z-45 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-800 rounded-lg text-emerald-300">
              <Layers className="h-6 w-6 stroke-[2]" />
            </span>
            <div>
              <h1 className="font-bold tracking-tight text-xl">PapiKost Medan</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === "pencari" && pendingInvites.length > 0 && (
              <button
                onClick={() => { setUserPage("notifikasi"); setCurrentRole("pencari"); }}
                className="relative p-2 bg-emerald-800 rounded-lg text-emerald-300 hover:bg-emerald-700 transition"
              >
                <BellIcon className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingInvites.length}
                </span>
              </button>
            )}

            <div className="flex items-center gap-3 bg-emerald-900/40 px-3.5 py-1.5 rounded-xl border border-emerald-800/40">
              <span className="p-1 bg-emerald-800 text-emerald-300 rounded-lg">
                <User className="h-3.5 w-3.5" />
              </span>
              <div className="text-left leading-tight">
                <p className="text-[10px] text-emerald-400 font-mono">
                  {currentUser.role === "pencari" ? "Penyewa" : currentUser.role === "pemilik" ? "Owner Kost" : "Administrator"}
                </p>
                <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-red-700/80 hover:bg-red-800 text-white text-[11px] font-black tracking-wide rounded-lg border border-red-650/40 transition-all shadow cursor-pointer uppercase"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════
              ROLE: PENCARI (USER DASHBOARD)
          ═══════════════════════════════════════════════ */}
          {currentRole === "pencari" && (
            <motion.div key="pencari" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col lg:flex-row relative">

              {/* Sidebar */}
              <aside className="w-full lg:w-64 bg-white border-r border-neutral-200 p-5 flex flex-col gap-4 shrink-0 lg:sticky lg:top-0 h-auto lg:h-[calc(100vh-68px)]">
                    {/* Status verifikasi di sidebar */}
                  <div className="hidden lg:flex items-center gap-3 px-1 pb-2 border-b border-neutral-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-800">{currentUser.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        biodata?.verifikasiStatus === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
                        biodata?.verifikasiStatus === "PENDING" ? "bg-amber-100 text-amber-700" :
                        "bg-neutral-100 text-neutral-500"
                      }`}>
                        {biodata?.verifikasiStatus === "DISETUJUI" ? "✓ Terverifikasi" :
                         biodata?.verifikasiStatus === "PENDING" ? "⏳ Menunggu Verifikasi" :
                         "⚠ Belum Lengkap"}
                      </span>
                    </div>
                  </div>

                <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                  {[
                    { key: "beranda", icon: <Home className="h-4 w-4" />, label: "Cari Kost" },
                    { key: "biodata", icon: <User className="h-4 w-4" />, label: "Data Diri" },
                    { key: "kamar-saya", icon: <DoorOpen className="h-4 w-4" />, label: "Kamar Saya", hidden: !currentUser.hasKamar },
                    { key: "notifikasi", icon: <BellIcon className="h-4 w-4" />, label: "Notifikasi", badge: pendingInvites.length },
                  ].filter(item => !item.hidden).map(item => (
                    <button key={item.key}
                      onClick={() => { setUserPage(item.key); setSelectedKamar(null); }}
                      className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 relative ${userPage === item.key ? "bg-emerald-50 text-emerald-800" : "text-neutral-600 hover:bg-neutral-50"}`}>
                      {item.icon} {item.label}
                      {item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                {currentUser.hasKamar && (
                  <div className="mt-auto hidden lg:block bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-emerald-800 mb-0.5 flex items-center gap-1">
                      <Home className="h-3 w-3" /> Kamar Aktif
                    </p>
                    <p className="text-xs font-bold text-emerald-900">{currentUser.namaKost}</p>
                  </div>
                )}
              </aside>

              {/* Main content */}
              <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">

                {/* ── PAGE: BIODATA ── */}
                {userPage === "biodata" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">Data Diri</h2>
                      <p className="text-xs text-neutral-500 mt-1">Lengkapi data diri Anda. Setelah disimpan, admin akan memverifikasi data Anda sebelum bisa menyewa kamar.</p>
                    </div>

                    {/* Status verifikasi banner */}
                    {biodata?.verifikasiStatus === "DISETUJUI" && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex gap-3 items-center">
                        <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800">Data Diri Terverifikasi ✓</p>
                          <p className="text-xs text-emerald-700 mt-0.5">Data diri Anda telah diverifikasi oleh admin. Anda sudah bisa menyewa kamar kost.</p>
                        </div>
                      </div>
                    )}
                    {biodata?.verifikasiStatus === "PENDING" && (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex gap-3 items-center">
                        <Clock className="h-6 w-6 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-amber-800">Menunggu Verifikasi Admin</p>
                          <p className="text-xs text-amber-700 mt-0.5">Data diri Anda sedang ditinjau oleh admin. Anda akan bisa menyewa kamar setelah disetujui.</p>
                        </div>
                      </div>
                    )}
                    {biodata?.verifikasiStatus === "DITOLAK" && (
                      <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex gap-3 items-center">
                        <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-red-800">Verifikasi Ditolak</p>
                          <p className="text-xs text-red-700 mt-0.5">Data diri Anda ditolak admin. Perbaiki data dan kirim ulang.</p>
                        </div>
                      </div>
                    )}
                    {!biodata?.isLengkap && (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex gap-3 items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-800">Data diri belum lengkap</p>
                          <p className="text-xs text-amber-700 mt-0.5">Lengkapi semua data termasuk upload KTP, KK, dan foto diri, lalu simpan untuk dikirim ke admin.</p>
                        </div>
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
                          { label: "Tanggal Lahir", key: "tanggalLahir", type: "date", placeholder: "" },
                          { label: "No. HP / WhatsApp", key: "noHp", type: "tel", placeholder: "08xxxxxxxxxx" },
                          { label: "Pekerjaan", key: "pekerjaan", type: "text", placeholder: "Mahasiswa / Karyawan / dll" },
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block text-xs font-bold text-neutral-600 mb-1">{field.label}</label>
                            <input type={field.type} placeholder={field.placeholder}
                              value={biodataForm[field.key]}
                              onChange={e => setBiodataForm({ ...biodataForm, [field.key]: e.target.value })}
                              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                              required />
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs font-bold text-neutral-600 mb-1">Jenis Kelamin</label>
                          <select value={biodataForm.jenisKelamin}
                            onChange={e => setBiodataForm({ ...biodataForm, jenisKelamin: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition" required>
                            <option value="">Pilih...</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">Alamat Lengkap</label>
                        <textarea rows={2} placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
                          value={biodataForm.alamat}
                          onChange={e => setBiodataForm({ ...biodataForm, alamat: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition resize-none" required />
                      </div>

                      <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-3 mt-2">Upload Berkas</h3>
                      <p className="text-xs text-neutral-500 -mt-3">Upload berkas identitas Anda. Format yang diterima: JPG, PNG, PDF.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: "KTP (Kartu Tanda Penduduk)", key: "ktpUrl" },
                          { label: "KK (Kartu Keluarga)", key: "kkUrl" },
                          { label: "Foto Diri Terbaru", key: "fotoUrl" },
                        ].map(field => (
                          <div key={field.key} className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition cursor-pointer ${biodataFiles[field.key] ? "border-emerald-400 bg-emerald-50/40" : "border-neutral-200 hover:border-emerald-400"}`}>
                            <Upload className={`h-6 w-6 ${biodataFiles[field.key] ? "text-emerald-600" : "text-neutral-400"}`} />
                            <label className="text-xs font-bold text-neutral-600 text-center">{field.label}</label>
                            {biodataFiles[field.key] ? (
                              <div className="flex flex-col items-center gap-1 w-full">
                                {/* Preview gambar jika ada */}
                                {biodataFiles[field.key].url && (
                                  <div
                                    className="w-full h-24 rounded-lg overflow-hidden border border-emerald-200 cursor-pointer relative group"
                                    onClick={() => setPreviewImageUrl(biodataFiles[field.key].url)}
                                  >
                                    <img
                                      src={biodataFiles[field.key].url}
                                      alt={field.label}
                                      className="w-full h-full object-cover group-hover:scale-105 transition"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                      <Eye className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                )}
                                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> {biodataFiles[field.key].name}
                                </span>
                                <div className="flex gap-2 w-full">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImageUrl(biodataFiles[field.key].url)}
                                    className="flex-1 text-[10px] text-emerald-700 font-bold border border-emerald-300 rounded-lg py-1 hover:bg-emerald-50 transition flex items-center justify-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" /> Lihat
                                  </button>
                                  <label className="flex-1 cursor-pointer">
                                    <div className="text-[10px] text-neutral-600 border border-neutral-200 rounded-lg py-1 hover:bg-neutral-100 transition text-center">
                                      Ganti
                                    </div>
                                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                                      onChange={e => handleFileChange(e, "biodata", field.key)} />
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label className="w-full cursor-pointer">
                                <div className="w-full py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[10px] font-bold rounded-lg text-center transition">
                                  Pilih File
                                </div>
                                <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                                  onChange={e => handleFileChange(e, "biodata", field.key)} />
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
                  </div>
                )}

                {/* ── PAGE: KAMAR SAYA ── */}
                {userPage === "kamar-saya" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">Kamar Saya</h2>
                      <p className="text-xs text-neutral-500 mt-1">Kelola informasi kamar kost Anda yang aktif.</p>
                    </div>

                    {/* Info kamar aktif */}
                    <div className="bg-emerald-800 text-white rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="p-3 bg-emerald-700 rounded-xl">
                        <Home className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Kamar Aktif</p>
                        <h3 className="text-lg font-black">{currentUser.namaKost}</h3>
                        <p className="text-xs text-emerald-200 mt-0.5">Kamar #{currentUser.kamarId} • Status: Aktif</p>
                      </div>
                      <div className="bg-emerald-700/60 rounded-xl px-4 py-2 text-center">
                        <p className="text-[10px] text-emerald-300">Masa Sewa</p>
                        <p className="text-sm font-black">6 Bulan</p>
                      </div>
                    </div>

                    {/* Tab navigation */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl">
                      {[
                        { key: "laporan", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Laporan Kerusakan" },
                        { key: "masa-sewa", icon: <CalendarDays className="h-3.5 w-3.5" />, label: "Masa Sewa" },
                        { key: "fasilitas", icon: <Wrench className="h-3.5 w-3.5" />, label: "Fasilitas" },
                      ].map(tab => (
                        <button key={tab.key}
                          onClick={() => setKamarSayaTab(tab.key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${kamarSayaTab === tab.key ? "bg-white text-emerald-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                          {tab.icon} {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab: Laporan Kerusakan */}
                    {kamarSayaTab === "laporan" && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Form */}
                        <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
                          <div>
                            <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-2.5 py-0.5 rounded-full">BUAT LAPORAN BARU</span>
                          </div>
                          {notifReport && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">{notifReport}</div>
                          )}
                          <form onSubmit={handleAddReport} className="flex flex-col gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-600 mb-1">Kategori</label>
                              <select required value={newKategori} onChange={e => setNewKategori(e.target.value)}
                                className="w-full text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:border-emerald-700 focus:outline-none">
                                <option value="">Pilih Kategori...</option>
                                <option value="pipa">Pipa Air & Saluran</option>
                                <option value="listrik">Listrik & Lampu</option>
                                <option value="perabot">Peralatan Furniture</option>
                                <option value="lainnya">Lainnya</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-600 mb-1">Detail Kendala</label>
                              <input type="text" required placeholder="Cth: Wastafel Bocor..."
                                value={newKendala} onChange={e => setNewKendala(e.target.value)}
                                className="w-full text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:border-emerald-700 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-600 mb-1">Penjelasan (Opsional)</label>
                              <textarea rows={3} placeholder="Deskripsikan kerusakan..."
                                value={newDetail} onChange={e => setNewDetail(e.target.value)}
                                className="w-full text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:border-emerald-700 focus:outline-none resize-none" />
                            </div>
                            <button type="submit"
                              className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs py-2.5 rounded-lg transition shadow flex items-center justify-center gap-1.5">
                              <Send className="h-3.5 w-3.5" /> Kirim Laporan
                            </button>
                          </form>

                          <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-3 flex gap-2.5">
                            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-neutral-800">Keadaan Darurat?</h4>
                              <p className="text-[10px] text-neutral-500 mb-1">Untuk kebocoran deras atau korsleting fatal, hubungi pengelola segera.</p>
                              <a href="tel:+628111222333" className="text-xs font-bold text-emerald-800 flex items-center gap-1 hover:underline">
                                <Phone className="h-3.5 w-3.5" /> 0811-1222-333
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Riwayat */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                          <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                            <h4 className="text-xs font-black text-neutral-800 flex items-center gap-1.5">
                              <History className="h-4 w-4 text-emerald-800" /> Riwayat Laporan
                            </h4>
                            <span className="text-[10px] bg-emerald-800/10 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              {laporanList.length} Laporan
                            </span>
                          </div>
                          <div className="border border-neutral-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                                  <th className="p-3 font-bold">Tanggal</th>
                                  <th className="p-3 font-bold">Kategori</th>
                                  <th className="p-3 font-bold">Kendala</th>
                                  <th className="p-3 font-bold">Status</th>
                                </tr>
                              </thead>
                              <tbody className="text-xs text-neutral-700 divide-y divide-neutral-100">
                                {laporanList.length === 0 ? (
                                  <tr><td colSpan={4} className="p-8 text-center text-neutral-400">Belum ada laporan kerusakan</td></tr>
                                ) : laporanList.map(item => (
                                  <tr key={item.id} className="hover:bg-neutral-50 transition">
                                    <td className="p-3 font-medium text-neutral-500">{item.tanggal}</td>
                                    <td className="p-3"><span className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-[10px]">{item.kategori}</span></td>
                                    <td className="p-3">
                                      <p className="font-bold">{item.kendala}</p>
                                      <p className="text-[10px] text-neutral-400 truncate max-w-[180px]">{item.detail}</p>
                                    </td>
                                    <td className="p-3">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${item.status === "SELESAI" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : item.status === "BARU" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === "SELESAI" ? "bg-emerald-700" : item.status === "BARU" ? "bg-blue-600" : "bg-amber-600"}`}></span>
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

                    {/* Tab: Masa Sewa */}
                    {kamarSayaTab === "masa-sewa" && (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: "Tanggal Masuk", value: "01 Oktober 2025", icon: <CalendarDays className="h-5 w-5 text-emerald-600" />, color: "bg-emerald-50 border-emerald-200" },
                            { label: "Kontrak Hingga", value: "01 April 2026", icon: <Clock className="h-5 w-5 text-amber-600" />, color: "bg-amber-50 border-amber-200" },
                            { label: "Sisa Masa Sewa", value: "4 Bulan", icon: <BarChart3 className="h-5 w-5 text-blue-600" />, color: "bg-blue-50 border-blue-200" },
                          ].map(item => (
                            <div key={item.label} className={`${item.color} border rounded-2xl p-5 flex items-center gap-4`}>
                              <div className="p-2 bg-white rounded-xl shadow-sm">{item.icon}</div>
                              <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{item.label}</p>
                                <p className="text-base font-black text-neutral-800 mt-0.5">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-700" /> Riwayat Pembayaran
                          </h3>
                          <div className="flex flex-col gap-2">
                            {[
                              { bulan: "Oktober 2025", jumlah: 1800000, status: "LUNAS", tanggal: "01/10/2025" },
                              { bulan: "November 2025", jumlah: 1800000, status: "LUNAS", tanggal: "01/11/2025" },
                              { bulan: "Desember 2025", jumlah: 1800000, status: "LUNAS", tanggal: "01/12/2025" },
                              { bulan: "Januari 2026", jumlah: 1800000, status: "LUNAS", tanggal: "01/01/2026" },
                              { bulan: "Februari 2026", jumlah: 1800000, status: "MENUNGGU", tanggal: "-" },
                              { bulan: "Maret 2026", jumlah: 1800000, status: "BELUM", tanggal: "-" },
                            ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${item.status === "LUNAS" ? "bg-emerald-500" : item.status === "MENUNGGU" ? "bg-amber-500" : "bg-neutral-300"}`}></div>
                                  <div>
                                    <p className="text-xs font-bold text-neutral-800">{item.bulan}</p>
                                    <p className="text-[10px] text-neutral-400">{item.tanggal}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-xs font-bold text-neutral-700">Rp {fmt(item.jumlah)}</p>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.status === "LUNAS" ? "bg-emerald-100 text-emerald-700" : item.status === "MENUNGGU" ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"}`}>
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab: Fasilitas */}
                    {kamarSayaTab === "fasilitas" && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                          <h3 className="text-sm font-bold text-neutral-800 mb-4">Fasilitas Kamar</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              { nama: "WiFi Cepat", ada: true, icon: "📶" },
                              { nama: "AC", ada: true, icon: "❄️" },
                              { nama: "Kamar Mandi Dalam", ada: true, icon: "🚿" },
                              { nama: "Kasur Springbed", ada: true, icon: "🛏️" },
                              { nama: "Meja Belajar", ada: true, icon: "📚" },
                              { nama: "Lemari Pakaian", ada: true, icon: "🗄️" },
                              { nama: "Dapur Bersama", ada: false, icon: "🍳" },
                              { nama: "Parkir Motor", ada: true, icon: "🏍️" },
                              { nama: "Laundry", ada: false, icon: "👕" },
                            ].map(f => (
                              <div key={f.nama} className={`flex items-center gap-3 p-3 rounded-xl border ${f.ada ? "bg-emerald-50 border-emerald-200" : "bg-neutral-50 border-neutral-200 opacity-50"}`}>
                                <span className="text-lg">{f.icon}</span>
                                <div>
                                  <p className="text-xs font-bold text-neutral-800">{f.nama}</p>
                                  <p className={`text-[10px] font-bold ${f.ada ? "text-emerald-600" : "text-neutral-400"}`}>{f.ada ? "Tersedia" : "Tidak Ada"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                          <h3 className="text-sm font-bold text-neutral-800 mb-4">Peraturan Kost</h3>
                          <div className="flex flex-col gap-2">
                            {[
                              "Tamu diperbolehkan hingga pukul 21.00 WIB",
                              "Dilarang membawa hewan peliharaan",
                              "Bayar sewa paling lambat tanggal 5 setiap bulan",
                              "Jaga kebersihan kamar dan area bersama",
                              "Dilarang membuat keributan setelah pukul 22.00 WIB",
                              "Laporan kerusakan fasilitas wajib dilaporkan dalam 3x24 jam",
                            ].map((rule, i) => (
                              <div key={i} className="flex items-start gap-2.5 py-2 border-b border-neutral-100 last:border-0">
                                <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</span>
                                <p className="text-xs text-neutral-700">{rule}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PAGE: NOTIFIKASI ── */}
                {userPage === "notifikasi" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">Notifikasi</h2>
                      <p className="text-xs text-neutral-500 mt-1">Undangan patungan dan pemberitahuan sistem.</p>
                    </div>

                    {inviteList.filter(i => i.toUserId === currentUser.id).length === 0 ? (
                      <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                        <BellIcon className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-neutral-500">Tidak ada notifikasi</p>
                        <p className="text-xs text-neutral-400 mt-1">Undangan patungan dari teman akan muncul di sini.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {inviteList.filter(i => i.toUserId === currentUser.id).map(invite => (
                          <div key={invite.id} className={`bg-white border rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center ${invite.status === "PENDING" ? "border-emerald-300 shadow-sm" : "border-neutral-200"}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${invite.status === "PENDING" ? "bg-blue-100 text-blue-700" : invite.status === "DITERIMA" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {invite.status}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-neutral-800">Undangan Patungan dari {invite.fromUserName}</h4>
                              <p className="text-xs text-neutral-500 mt-0.5">{invite.namaKost} • {invite.jumlahOrang} orang • {invite.durasi} bulan</p>
                              <p className="text-xs font-bold text-emerald-700 mt-1">
                                Rp {fmt(Math.round(invite.hargaDasar / invite.jumlahOrang))}/bulan/orang
                              </p>
                            </div>
                            {invite.status === "PENDING" && (
                              <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => handleRespondInvite(invite.id, "DITOLAK")}
                                  className="flex-1 md:flex-none px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg transition">
                                  Tolak
                                </button>
                                <button onClick={() => handleRespondInvite(invite.id, "DITERIMA")}
                                  className="flex-1 md:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition">
                                  Terima
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── PAGE: BERANDA (Cari Kost + Detail) ── */}
                {userPage === "beranda" && (
                  <div className="flex flex-col gap-6">
                    {!biodata?.isVerified && (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex gap-3 items-center">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div className="flex-1">
                          {biodata?.verifikasiStatus === "PENDING" ? (
                            <>
                              <p className="text-xs font-bold text-amber-800">⏳ Menunggu verifikasi admin — belum bisa menyewa</p>
                              <p className="text-xs text-amber-700">Data diri Anda sedang ditinjau admin. Tunggu konfirmasi.</p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-bold text-amber-800">Data diri belum lengkap — Anda belum bisa menyewa kamar</p>
                              <p className="text-xs text-amber-700">Lengkapi data diri terlebih dahulu di menu <strong>Data Diri</strong>.</p>
                            </>
                          )}
                        </div>
                        {biodata?.verifikasiStatus !== "PENDING" && (
                          <button onClick={() => setUserPage("biodata")}
                            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition shrink-0">
                            Lengkapi
                          </button>
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
                        <button onClick={() => { setSelectedKamar(null); setShowInviteForm(false); setInviteMsg(null); }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition">
                          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kost
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[250px] md:h-[320px] rounded-2xl overflow-hidden shadow-sm">
                          <div className="md:col-span-8 h-full relative overflow-hidden group">
                            <img src={selectedKamar.image} alt={selectedKamar.namaKost} referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                            <div className={`absolute top-4 left-4 font-bold text-xs px-3 py-1 rounded-full shadow ${selectedKamar.availableRooms === 0 ? "bg-neutral-600/90 text-white" : "bg-emerald-900/90 text-white"}`}>
                              {selectedKamar.availableRooms === 0 ? "Penuh" : `${selectedKamar.availableRooms} Kamar Tersedia`}
                            </div>
                          </div>
                          <div className="hidden md:col-span-4 md:flex flex-col gap-3 h-full">
                            <div className="h-1/2 overflow-hidden relative group">
                              <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300" alt="Bathroom" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition" />
                            </div>
                            <div className="h-1/2 overflow-hidden relative group">
                              <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=300" alt="Facilities" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">+12 Foto</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          <div className="lg:col-span-7 flex flex-col gap-5">
                            <div>
                              <h2 className="text-2xl font-bold tracking-tight text-neutral-950 mb-1">{selectedKamar.namaKost}</h2>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                                <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                                <span>{selectedKamar.daerah}, Medan</span>
                                <span className="text-neutral-300">•</span>
                                <span className="text-amber-500 font-bold">★ {selectedKamar.rating}</span>
                              </div>
                            </div>
                            <hr className="border-neutral-200" />
                            <p className="text-xs text-neutral-600 leading-relaxed">{selectedKamar.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedKamar.wifiCepat && <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">WiFi Cepat</span>}
                              {selectedKamar.ac && <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">AC</span>}
                              {selectedKamar.kamarMandiDalam && <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-200">KM Dalam</span>}
                              {selectedKamar.kasurSpringbed && <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-200">Springbed</span>}
                              {selectedKamar.mejaBelajar && <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-neutral-200">Meja Belajar</span>}
                              {selectedKamar.dapurBersama && <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-yellow-200">Dapur Bersama</span>}
                            </div>
                          </div>

                          <div className="lg:col-span-5">
                            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
                              <div>
                                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Mulai Dari</span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                  <h3 className="text-2xl font-black text-emerald-800">Rp {fmt(selectedKamar.hargaDasar)}</h3>
                                  <span className="text-xs font-medium text-neutral-500">/ bulan</span>
                                </div>
                              </div>
                              <hr className="border-dashed border-neutral-200" />

                              <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => { setCalcTipe("solo"); setCalcHargaDasar(selectedKamar.hargaDasar); setShowInviteForm(false); }}
                                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all ${calcTipe === "solo" ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>
                                  <div className="font-bold">Sewa Sendiri</div>
                                  <div className="text-[10px] font-normal mt-0.5">Rp {fmt(selectedKamar.hargaDasar)}/bln</div>
                                </button>
                                <button onClick={() => { setCalcTipe("patungan"); setCalcHargaDasar(selectedKamar.hargaDasar); }}
                                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all ${calcTipe === "patungan" ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>
                                  <div className="font-bold flex items-center gap-1"><Users className="h-3 w-3" /> Patungan</div>
                                  <div className="text-[10px] font-normal mt-0.5">Rp {fmt(Math.round(selectedKamar.hargaDasar / calcJumlahOrang))}/bln/org</div>
                                </button>
                              </div>

                              {calcTipe === "patungan" && (
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">Jumlah Orang</label>
                                    <select value={calcJumlahOrang} onChange={e => setCalcJumlahOrang(Number(e.target.value))}
                                      className="w-full text-xs font-medium bg-neutral-50 border border-neutral-200 rounded p-1.5">
                                      <option value={2}>2 Orang</option>
                                      <option value={3}>3 Orang</option>
                                      <option value={4}>4 Orang</option>
                                    </select>
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">Durasi</label>
                                    <select value={calcDurasi} onChange={e => setCalcDurasi(Number(e.target.value))}
                                      className="w-full text-xs font-medium bg-neutral-50 border border-neutral-200 rounded p-1.5">
                                      <option value={1}>1 Bulan</option>
                                      <option value={3}>3 Bulan</option>
                                      <option value={6}>6 Bulan</option>
                                      <option value={12}>12 Bulan</option>
                                    </select>
                                  </div>
                                </div>
                              )}

                              {apiResult && (
                                <div className="bg-emerald-950 text-emerald-100 rounded-xl p-3 font-mono text-xs">
                                  <div className="flex justify-between text-emerald-400 text-[10px] border-b border-emerald-800/40 pb-1.5 mb-1.5">
                                    <span>TOTAL TAGIHAN</span><span className="bg-emerald-800/60 px-2 py-0.5 rounded">200 OK</span>
                                  </div>
                                  <div className="flex justify-between font-bold">
                                    <span className="text-emerald-300">Total</span>
                                    <span className="text-emerald-300">Rp {fmt(apiResult.totalTagihanHasil)}</span>
                                  </div>
                                  <p className="text-[10px] text-emerald-400 mt-1">{apiResult.formulaPBO}</p>
                                </div>
                              )}

                              {selectedKamar.availableRooms === 0 ? (
                                <div className="w-full py-3 bg-neutral-200 text-neutral-500 font-bold rounded-xl text-sm text-center">Kamar Penuh</div>
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

                              {calcTipe === "patungan" && biodata?.isVerified && selectedKamar.availableRooms > 0 && (
                                <div className="border-t border-neutral-100 pt-3">
                                  <button onClick={() => setShowInviteForm(!showInviteForm)}
                                    className="w-full py-2 border-2 border-dashed border-emerald-300 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                                    <Users className="h-3.5 w-3.5" /> Undang Teman Patungan
                                  </button>

                                  {showInviteForm && (
                                    <form onSubmit={handleSendInvite} className="mt-3 flex flex-col gap-2">
                                      {inviteMsg && (
                                        <div className={`p-2 rounded-lg text-xs font-medium ${inviteMsg.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                                          {inviteMsg.text}
                                        </div>
                                      )}
                                      <label className="text-[10px] font-bold text-neutral-600">ID Akun Teman</label>
                                      <input type="text" placeholder="Contoh: user001 atau user1748..."
                                        value={inviteTargetId}
                                        onChange={e => setInviteTargetId(e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 transition" required />
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

                        {showSewaForm && (
                          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
                              <h3 className="text-lg font-bold text-neutral-900">Konfirmasi Pengajuan Sewa</h3>
                              <div className="bg-neutral-50 rounded-xl p-4 flex flex-col gap-2 text-xs">
                                <div className="flex justify-between"><span className="text-neutral-500">Kamar</span><span className="font-bold">{selectedKamar.namaKost}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Tipe</span><span className="font-bold capitalize">{calcTipe}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Durasi</span><span className="font-bold">{calcDurasi} Bulan</span></div>
                                <div className="flex justify-between border-t border-neutral-200 pt-2 mt-1"><span className="font-bold text-neutral-700">Total</span><span className="font-black text-emerald-800">Rp {fmt(apiResult?.totalTagihanHasil)}</span></div>
                              </div>
                              <p className="text-xs text-neutral-500">Berkas KTP, KK, dan foto diri Anda akan dikirim ke admin untuk diverifikasi.</p>
                              <div className="flex gap-3">
                                <button onClick={() => setShowSewaForm(false)}
                                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition">
                                  Batal
                                </button>
                                <button onClick={handleSubmitSewa}
                                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl transition">
                                  Kirim Pengajuan
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 py-12 px-6 text-center text-white shadow">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-25 z-0"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                          <div className="relative z-25 flex flex-col items-center">
                            <span className="text-[10px] bg-emerald-800 text-emerald-300 px-3 py-1 rounded-full font-bold uppercase tracking-widest mb-3 border border-emerald-700/40">
                              Sewa Patungan Termurah di Medan
                            </span>
                            <h2 className="text-3xl font-black tracking-tight leading-tight max-w-2xl mb-2">
                              Cari Kost Nyaman di Medan, <span className="text-emerald-400">Patungan Biar Ringan</span>
                            </h2>
                            <p className="text-xs text-neutral-300 font-medium max-w-md">
                              Temukan pilihan hunian terbaik untuk mahasiswa dan pekerja profesional di sekitar USU dan Lapangan Merdeka Medan.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 mb-1">Daerah</label>
                            <select value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)}
                              className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                              <option value="Padang Bulan">Padang Bulan (USU)</option>
                              <option value="Dr. Mansyur">Dr. Mansyur (USU)</option>
                              <option value="Setia Budi">Setia Budi</option>
                              <option value="Helvetia">Helvetia</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 mb-1">Durasi</label>
                            <select value={filterDurasi} onChange={e => setFilterDurasi(e.target.value)}
                              className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                              <option value="Bulanan">Bulanan</option>
                              <option value="Tahunan">Tahunan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 mb-1">Range Harga</label>
                            <select value={filterHarga} onChange={e => setFilterHarga(e.target.value)}
                              className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                              <option value="Rp 1 Jt - 2 Jt">Rp 1 Jt - 2 Jt</option>
                              <option value="Rp 500k - 1 Jt">Rp 500k - 1 Jt</option>
                              <option value="> Rp 2 Jt">&gt; Rp 2 Jt</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button onClick={() => {
                              const filtered = INITIAL_KAMAR_KOST.filter(k => k.daerah === filterLokasi);
                              setActiveKamarList(filtered.length > 0 ? filtered : INITIAL_KAMAR_KOST);
                            }}
                              className="w-full bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-emerald-800 transition shadow flex items-center justify-center gap-1.5">
                              <Search className="h-4 w-4" /> Cari Sekarang
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Rekomendasi Terbaik Medan</h3>
                            <span className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer" onClick={() => setActiveKamarList(INITIAL_KAMAR_KOST)}>
                              Tampilkan Semua ({INITIAL_KAMAR_KOST.length})
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {activeKamarList.map(kamar => {
                              const isFull = kamar.availableRooms === 0;
                              return (
                                <div key={kamar.id}
                                  onClick={() => !isFull && setSelectedKamar(kamar)}
                                  className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${isFull ? "opacity-60 grayscale cursor-not-allowed border-neutral-200" : "border-neutral-200 group cursor-pointer hover:shadow-md hover:border-emerald-700/30"}`}>
                                  <div className="aspect-[4/3] overflow-hidden relative">
                                    <img src={kamar.image} alt={kamar.namaKost} referrerPolicy="no-referrer"
                                      className={`w-full h-full object-cover transition-transform duration-300 ${!isFull && "group-hover:scale-105"}`} />
                                    <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded shadow ${isFull ? "bg-neutral-600 text-white" : "bg-white/95 text-neutral-800"}`}>
                                      {isFull ? "Penuh" : kamar.status}
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
                                    <div className="border-t border-neutral-100 pt-3 mt-1 flex justify-between items-end">
                                      <div>
                                        <span className="text-[10px] text-neutral-400">Mulai dari</span>
                                        <p className={`text-sm font-black ${isFull ? "text-neutral-400" : "text-emerald-800"}`}>
                                          Rp {fmt(kamar.hargaDasar)}<span className="text-xs font-normal text-neutral-400">/bln</span>
                                        </p>
                                      </div>
                                      {!isFull && (
                                        <span className="text-[10px] font-bold text-emerald-700 group-hover:translate-x-1 transition flex items-center gap-0.5">
                                          Pilih <ArrowRight className="h-3 w-3" />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </main>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              ROLE: ADMIN
          ═══════════════════════════════════════════════ */}
          {currentRole === "admin" && (
            <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col lg:flex-row">
              <AdminDashboard
                currentUser={currentUser}
                verifikasiDataDiriList={verifikasiDataDiriList}
                pengajuanOwnerList={pengajuanOwnerList}
                handleDecisionVerifikasiDataDiri={handleDecisionVerifikasiDataDiri}
                handleDecisionPengajuanOwner={handleDecisionPengajuanOwner}
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              ROLE: PEMILIK (OWNER DASHBOARD)
          ═══════════════════════════════════════════════ */}
          {currentRole === "pemilik" && (
            <motion.div key="pemilik" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col lg:flex-row">
              <OwnerDashboard
                currentUser={currentUser}
                laporanList={laporanList}
                setLaporanList={setLaporanList}
                pengajuanSewaKosList={pengajuanSewaKosList}
                handleDecisionPengajuanSewaKos={handleDecisionPengajuanSewaKos}
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              ROLE: JAVA OOP INSPECTOR
          ═══════════════════════════════════════════════ */}
          {currentRole === "javabackend" && (
            <motion.div key="javabackend" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col lg:flex-row bg-[#1e1e24] text-neutral-300">

              <aside className="w-full lg:w-72 bg-[#17171d] border-r border-neutral-800 p-5 flex flex-col gap-6 shrink-0 lg:sticky lg:top-0 h-auto lg:h-[calc(100vh-68px)]">
                <div>
                  <h3 className="text-zinc-200 font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-400" /> Java OOP Explorer
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-mono tracking-widest mt-0.5">Project Structure</p>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">📁 maven configuration</span>
                    <button onClick={() => setActiveJavaFile("pom.xml")}
                      className={`w-full px-3 py-1.5 rounded text-xs font-mono text-left flex items-center gap-2 transition ${activeJavaFile === "pom.xml" ? "bg-emerald-900/60 text-emerald-300 border-l-2 border-emerald-400" : "hover:bg-neutral-800"}`}>
                      ⚙️ pom.xml
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">📁 jpa entities</span>
                    <div className="flex flex-col gap-1 pl-2">
                      {["Akun.java", "Penyewa.java"].map(f => (
                        <button key={f} onClick={() => setActiveJavaFile(f)}
                          className={`px-3 py-1.5 rounded text-xs font-mono text-left block transition ${activeJavaFile === f ? "bg-[#2d2d3a] text-yellow-300 border-l-2 border-yellow-400 font-bold" : "hover:bg-[#25252f]"}`}>
                          ☕ {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">📁 oop models</span>
                    <div className="flex flex-col gap-1 pl-2">
                      {["Reservasi.java", "ReservasiSolo.java", "ReservasiPatungan.java"].map(f => (
                        <button key={f} onClick={() => setActiveJavaFile(f)}
                          className={`px-3 py-1.5 rounded text-xs font-mono text-left block transition ${activeJavaFile === f ? "bg-[#2d2d3a] text-blue-300 border-l-2 border-blue-400 font-bold" : "hover:bg-[#25252f]"}`}>
                          ☕ {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">📁 controllers & seeders</span>
                    <div className="flex flex-col gap-1 pl-2 font-mono">
                      {["DatabaseSeeder.java", "ReservasiController.java"].map(f => (
                        <button key={f} onClick={() => setActiveJavaFile(f)}
                          className={`px-3 py-1.5 rounded text-xs text-left block transition ${activeJavaFile === f ? "bg-[#2d2d3a] text-[#a5d6a7]" : "hover:bg-[#25252f]"}`}>
                          ☕ {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center bg-[#17171d] p-4 rounded-xl border border-neutral-800">
                  <div>
                    <h2 className="text-sm font-mono text-emerald-400 font-bold">.../{activeJavaFile}</h2>
                    <p className="text-xs text-neutral-400 mt-1">{javaFiles[activeJavaFile]?.description}</p>
                  </div>
                  <button onClick={handleCopyCode}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white flex items-center gap-1.5 active:scale-95 transition">
                    <Copy className="h-4 w-4" /> {copied ? "Disalin!" : "Salin Kode"}
                  </button>
                </div>
                <div className="bg-[#151515] rounded-xl border border-neutral-800 p-5 overflow-x-auto relative shadow-md">
                  <div className="absolute top-2 right-3 font-mono text-[9px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-900 font-bold">
                    JAVA REST BACKEND SPRING
                  </div>
                  <pre className="font-mono text-xs text-[#a9b2c3] leading-relaxed select-all whitespace-pre">
                    <code>{javaFiles[activeJavaFile]?.content}</code>
                  </pre>
                </div>

                <div className="bg-[#1c2c26] text-[#c9ebd9] rounded-2xl border border-emerald-900/50 p-6 flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] bg-emerald-500 text-emerald-950 font-bold self-start px-2 py-0.5 rounded uppercase tracking-wider">REST API SIMULATOR</span>
                    <h3 className="text-base font-extrabold text-white mt-1">Simulasikan /api/reservasi/hitung</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-950/40 p-4 rounded-xl border border-emerald-900">
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">Tipe Klas</label>
                      <div className="flex gap-1.5">
                        <button onClick={() => setCalcTipe("solo")} className={`flex-1 py-1.5 px-2 rounded text-xs font-bold font-mono transition ${calcTipe === "solo" ? "bg-emerald-500 text-emerald-950" : "bg-emerald-900/60"}`}>Solo</button>
                        <button onClick={() => setCalcTipe("patungan")} className={`flex-1 py-1.5 px-2 rounded text-xs font-bold font-mono transition ${calcTipe === "patungan" ? "bg-emerald-500 text-emerald-950" : "bg-emerald-900/60"}`}>Patungan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">Harga Dasar</label>
                      <input type="range" min={1000000} max={3000000} step={10000} value={calcHargaDasar} onChange={e => setCalcHargaDasar(Number(e.target.value))} className="w-full accent-emerald-400" />
                      <span className="text-xs font-mono font-bold mt-1 text-white block">Rp {fmt(calcHargaDasar)}</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">Jumlah Orang</label>
                      <input type="range" min={1} max={5} step={1} value={calcJumlahOrang} onChange={e => setCalcJumlahOrang(Number(e.target.value))} disabled={calcTipe === "solo"} className="w-full accent-emerald-400" />
                      <span className="text-xs font-mono font-bold mt-1 text-white block">{calcTipe === "solo" ? "1 (Solo)" : `${calcJumlahOrang} Orang`}</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">Durasi (Bulan)</label>
                      <input type="range" min={1} max={24} step={1} value={calcDurasi} onChange={e => setCalcDurasi(Number(e.target.value))} className="w-full accent-emerald-400" />
                      <span className="text-xs font-mono font-bold mt-1 text-white block">{calcDurasi} Bulan</span>
                    </div>
                  </div>
                  {apiResult && (
                    <div className="bg-[#121c17] text-[#a9dfc0] rounded-xl p-4 font-mono text-xs border border-emerald-900/40">
                      <div className="flex justify-between items-center border-b border-emerald-900 pb-2 mb-2">
                        <span className="font-bold text-emerald-400">📡 GET /api/reservasi/hitung</span>
                        <span className="text-[10px] text-emerald-300 font-bold bg-[#1d3528] px-2 py-0.5 rounded">HTTP 200 OK</span>
                      </div>
                      <pre className="whitespace-pre overflow-x-auto text-[#b2ddbd]">{JSON.stringify(apiResult, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </main>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <footer className="bg-neutral-800 text-neutral-400 text-xs py-5 border-t border-neutral-700 text-center font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 PapiKost Medan System – PBO REST API Architecture Demo.</p>
        </div>
      </footer>

      {/* ── Image Preview Modal ── */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 transition flex items-center gap-1.5 text-sm font-bold"
            >
              <X className="h-5 w-5" /> Tutup
            </button>
            <img
              src={previewImageUrl}
              alt="Preview"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ── Edit Kamar Modal ── */}
      {showEditKamar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-neutral-900">Edit Kamar</h3>
            <form onSubmit={handleEditKamar} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">Nomor Kamar</label>
                <input type="text" placeholder="Kamar 07" required
                  value={editKamarForm.nomor} onChange={e => setEditKamarForm({...editKamarForm, nomor: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">Lantai</label>
                <select value={editKamarForm.lantai} onChange={e => setEditKamarForm({...editKamarForm, lantai: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600">
                  <option value={1}>Lantai 1</option>
                  <option value={2}>Lantai 2</option>
                  <option value={3}>Lantai 3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">Harga/Bulan</label>
                <input type="number" placeholder="1500000" required min={500000}
                  value={editKamarForm.harga} onChange={e => setEditKamarForm({...editKamarForm, harga: e.target.value})}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setShowEditKamar(false); setEditKamarId(null); }}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition">Batal</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Hapus Kamar Modal ── */}
      {showDeleteKamarId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-neutral-900">Hapus Kamar?</h3>
            <p className="text-sm text-neutral-600">
              Yakin ingin menghapus <strong>{kamarOwnerList.find(k => k.id === showDeleteKamarId)?.nomor}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteKamarId(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition">Batal</button>
              <button onClick={() => handleDeleteKamar(showDeleteKamarId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
