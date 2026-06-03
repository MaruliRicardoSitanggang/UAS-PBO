import AdminDashboard from "./AdminDashboard";
import OwnerDashboard from "./OwnerDashboard";
import UserDashboard from "./UserDashboard";
import OwnerVerifikasiGate from "./OwnerVerifikasiGate";
import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  LayoutDashboard,
  Bed,
  ClipboardCheck,
  ClipboardList,
  Ticket,
  AlertTriangle,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  Send,
  History,
  Plus,
  Phone,
  Users,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Image,
  Check,
  X,
  Eye,
  EyeOff,
  User,
  Code,
  Database,
  Layers,
  Terminal,
  BookOpen,
  Copy,
  FileText,
  Upload,
  UserCheck,
  Building,
  Bell as BellIcon,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Settings,
  LogOut,
  Star,
  Wifi,
  Wind,
  Bath,
  BookOpen as BookIcon,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Key as KeyIcon,
  DoorOpen,
  CalendarDays,
  Wrench,
  BarChart3,
  TrendingUp,
  PlusCircle,
  Edit3,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { javaFiles } from "./javaCodeData";
import LoginPage from "./LoginPage.jsx";

// ─── Static mock listings ────────────────────────────────────────────────────
const INITIAL_KAMAR_KOST = [
  {
    id: 1,
    namaKost: "Kost Putra Padang Bulan",
    daerah: "Padang Bulan",
    hargaDasar: 1500000,
    status: "Tersedia 2 Kamar",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true,
    mejaBelajar: true,
    ac: false,
    availableRooms: 2,
    description:
      "Kost premium minimalis dengan pencahayaan alami melimpah, dirancang khusus untuk kenyamanan belajar mahasiswa USU dekat pintu gerbang utama.",
  },
  {
    id: 2,
    namaKost: "Kost Eksklusif Setia Budi",
    daerah: "Setia Budi",
    hargaDasar: 2200000,
    status: "Tersedia",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true,
    ac: true,
    kamarMandiDalam: true,
    kasurSpringbed: true,
    mejaBelajar: true,
    availableRooms: 5,
    description:
      "Kost mewah berfasilitas lengkap dekat pusat kuliner Setia Budi Medan. Dilengkapi AC, kamar mandi dalam, smart lock, dan area parkir luas.",
  },
  {
    id: 3,
    namaKost: "Kost Putri Dr. Mansyur",
    daerah: "Dr. Mansyur",
    hargaDasar: 1300000,
    status: "Sisa 1 Kamar",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600",
    wifiCepat: true,
    dapurBersama: true,
    availableRooms: 1,
    description:
      "Kost putri asri dan kondusif berlokasi strategis di Jalan Dr. Mansyur Medan, persis di seberang Kampus USU. Lingkungan aman dengan penjagaan sekuriti 24 jam.",
  },
  {
    id: 4,
    namaKost: "Kost Sejahtera Helvetia",
    daerah: "Helvetia",
    hargaDasar: 900000,
    status: "Penuh",
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600",
    wifiCepat: false,
    ac: false,
    availableRooms: 0,
    description:
      "Kost sederhana di kawasan Helvetia, cocok untuk pekerja dengan budget terbatas.",
  },
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
  const [biodataFiles, setBiodataFiles] = useState({
    ktpUrl: null,
    kkUrl: null,
    fotoUrl: null,
  });

  // Mock kamar data for owner
  const [kamarOwnerList, setKamarOwnerList] = useState([
    {
      id: 1,
      nomor: "Kamar 01",
      lantai: 1,
      harga: 1800000,
      status: "Terisi",
      penyewa: "Andreas Pegri Damanik",
      masukSejak: "01/10/2025",
      kontrakHingga: "01/04/2026",
    },
    {
      id: 2,
      nomor: "Kamar 02",
      lantai: 1,
      harga: 1800000,
      status: "Terisi",
      penyewa: "Maruli Ricardo",
      masukSejak: "01/10/2025",
      kontrakHingga: "01/04/2026",
    },
    {
      id: 3,
      nomor: "Kamar 03",
      lantai: 1,
      harga: 1800000,
      status: "Kosong",
      penyewa: null,
      masukSejak: null,
      kontrakHingga: null,
    },
    {
      id: 4,
      nomor: "Kamar 04",
      lantai: 2,
      harga: 2000000,
      status: "Terisi",
      penyewa: "Sari Dewi",
      masukSejak: "15/09/2025",
      kontrakHingga: "15/03/2026",
    },
    {
      id: 5,
      nomor: "Kamar 05",
      lantai: 2,
      harga: 2000000,
      status: "Kosong",
      penyewa: null,
      masukSejak: null,
      kontrakHingga: null,
    },
    {
      id: 6,
      nomor: "Kamar 06",
      lantai: 2,
      harga: 2000000,
      status: "Maintenance",
      penyewa: null,
      masukSejak: null,
      kontrakHingga: null,
    },
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
  const [addKamarForm, setAddKamarForm] = useState({
    nomor: "",
    lantai: 1,
    harga: 1500000,
  });
  const [editKamarId, setEditKamarId] = useState(null);
  const [editKamarForm, setEditKamarForm] = useState({
    nomor: "",
    lantai: 1,
    harga: 1500000,
  });
  const [showEditKamar, setShowEditKamar] = useState(false);
  const [showDeleteKamarId, setShowDeleteKamarId] = useState(null);

  // Image preview modal
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Owner: info kost form
  const [ownerKostInfo, setOwnerKostInfo] = useState({
    namaKost: "Kost Eksklusif Setia Budi",
    alamat: "Jl. Setia Budi No. 88, Medan",
    daerah: "Setia Budi",
    deskripsi:
      "Kost mewah berfasilitas lengkap dekat pusat kuliner Setia Budi Medan.",
    hargaDasar: 1800000,
    fasilitas: [
      "WiFi Cepat",
      "AC",
      "Kamar Mandi Dalam",
      "Springbed",
      "Meja Belajar",
    ],
  });
  const [ownerKostMsg, setOwnerKostMsg] = useState(null);

  // ─── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchKamarList = async () => {
    try {
      const r = await fetch("/api/kost/medan");
      if (r.ok) setActiveKamarList(await r.json());
    } catch {
      /* offline */
    }
  };

  const fetchLaporanList = async () => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/laporan?userId=${currentUser.id}`);
      if (r.ok) setLaporanList(await r.json());
    } catch {
      /* offline */
    }
  };

  const fetchVerifikasiList = async () => {
    // Backend tidak punya endpoint /api/verifikasi terpisah — pakai verifikasi-data-diri
    try {
      const r = await fetch("/api/verifikasi-data-diri");
      if (r.ok) setVerifikasiList(await r.json());
    } catch {
      /* offline */
    }
  };

  const fetchPengajuanSewa = async () => {
    // Owner: GET /api/owner/pengajuan-masuk
    try {
      const r = await fetch("/api/owner/pengajuan-masuk");
      if (r.ok) setPengajuanSewa(await r.json());
    } catch {
      /* offline */
    }
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
            fotoUrl: data.fotoUrl || "",
          });
        }
      }
    } catch {
      /* offline */
    }
  };

  const fetchInvites = async () => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/invite/${currentUser.id}`);
      if (r.ok) setInviteList(await r.json());
    } catch {
      /* offline */
    }
  };

  const fetchPengajuanOwner = async () => {
    try {
      const r = await fetch("/api/pengajuan-owner");
      if (r.ok) setPengajuanOwnerList(await r.json());
    } catch {
      /* offline */
    }
  };

  const fetchVerifikasiBerkas = async () => {
    try {
      const r = await fetch("/api/verifikasi-berkas");
      if (r.ok) setVerifikasiBerkasList(await r.json());
    } catch {
      /* offline */
    }
  };

  const fetchVerifikasiDataDiri = async () => {
    try {
      const r = await fetch("/api/verifikasi-data-diri");
      if (r.ok) setVerifikasiDataDiriList(await r.json());
    } catch {
      /* offline */
    }
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
    } catch {
      /* offline */
    }
  };

  const fetchReservationBill = () => {
    // Kalkulasi lokal — tidak perlu network request ke backend
    const total =
      calcTipe === "solo"
        ? calcHargaDasar * calcDurasi
        : (calcHargaDasar / calcJumlahOrang) * calcDurasi;
    setApiResult({
      idReservasi: calcTipe === "solo" ? "RES-SLO-200" : "RES-PTG-100",
      tipe: calcTipe,
      hargaDasarSewa: calcHargaDasar,
      durasiBulan: calcDurasi,
      totalTagihanHasil: total,
      deskripsiKonsep: `Reservasi${calcTipe === "solo" ? "Solo" : "Patungan"}.hitungTotalTagihan()`,
      formulaPBO:
        calcTipe === "solo"
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

      // ── Refresh ownerVerifikasiStatus setiap kali app dimuat (termasuk F5) ──
      // localStorage hanya menyimpan data saat login — status verifikasi bisa
      // berubah tanpa re-login, jadi kita selalu fetch ke backend.
      if (currentUser.role === "pemilik") {
        fetch(`/api/auth/owner-status/${currentUser.id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data) {
              const updated = { ...currentUser, ...data };
              setCurrentUser(updated);
              localStorage.setItem("papikost_user", JSON.stringify(updated));
            }
          })
          .catch(() => {
            /* offline — pakai data lama dari localStorage */
          });
      }
    }
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchReservationBill();
  }, [calcTipe, calcHargaDasar, calcDurasi, calcJumlahOrang]);

  // ─── Action handlers ────────────────────────────────────────────────────────
  const handleFileChange = (e, formType, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = file.name;
    const objectUrl = URL.createObjectURL(file);
    if (formType === "biodata") {
      setBiodataFiles((prev) => ({
        ...prev,
        [key]: { name: fileName, url: objectUrl },
      }));
      setBiodataForm((prev) => ({ ...prev, [key]: fileName }));
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
        body: JSON.stringify({
          kategori: newKategori,
          kendala: newKendala,
          detail: newDetail,
          userId: currentUser.id,
        }),
      });
      if (r.ok) {
        setNewKategori("");
        setNewKendala("");
        setNewDetail("");
        setNotifReport("Laporan berhasil dikirim!");
        setTimeout(() => setNotifReport(null), 4000);
        await fetchLaporanList();
      }
    } catch {
      const newRep = {
        id: `REP-0${laporanList.length + 1}`,
        userId: currentUser.id,
        tanggal: new Date().toLocaleDateString("id-ID"),
        kategori:
          newKategori === "pipa"
            ? "Pipa Air"
            : newKategori === "listrik"
              ? "Listrik"
              : newKategori === "perabot"
                ? "Peralatan"
                : "Lainnya",
        kendala: newKendala,
        status: "BARU",
        detail: newDetail || "-",
      };
      setLaporanList([newRep, ...laporanList]);
      setNewKategori("");
      setNewKendala("");
      setNewDetail("");
      setNotifReport("Laporan berhasil dikirim!");
      setTimeout(() => setNotifReport(null), 4000);
    }
  };

  const handleDecisionPengajuan = async (id, decision) => {
    // Owner: PUT /api/owner/pengajuan-masuk/:id
    try {
      const r = await fetch(`/api/owner/pengajuan-masuk/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision }),
      });
      if (r.ok) await fetchPengajuanSewa();
    } catch {
      setPengajuanSewa(
        pengajuanSewa.map((p) =>
          p.id === id ? { ...p, status: decision } : p,
        ),
      );
    }
  };

  const handleDecisionVerifikasi = async (id, decision) => {
    // Admin: PUT /api/verifikasi-data-diri/:id
    try {
      const r = await fetch(`/api/verifikasi-data-diri/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision }),
      });
      if (r.ok) await fetchVerifikasiList();
    } catch {
      setVerifikasiList(
        verifikasiList.map((v) =>
          v.id === id ? { ...v, status: decision } : v,
        ),
      );
    }
  };

  const handleSaveBiodata = async (e) => {
    e.preventDefault();
    setBiodataSaving(true);
    try {
      const r = await fetch(`/api/biodata/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(biodataForm),
      });
      if (r.ok) {
        const data = await r.json();
        setBiodata(data.biodata);
        setBiodataMsg({
          type: "success",
          text: "Data diri berhasil disimpan!",
        });
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: inviteTargetId,
          kamarId: selectedKamar.id,
          namaKost: selectedKamar.namaKost,
          hargaDasar: selectedKamar.hargaDasar,
          jumlahOrang: inviteJumlah,
          durasi: inviteDurasi,
        }),
      });
      const data = await r.json();
      if (r.ok) {
        setInviteMsg({
          type: "success",
          text: "Undangan patungan berhasil dikirim!",
        });
        setInviteTargetId("");
        setShowInviteForm(false);
        await fetchInvites();
      } else {
        setInviteMsg({
          type: "error",
          text: data.error || "Gagal mengirim undangan.",
        });
      }
    } catch {
      setInviteMsg({ type: "error", text: "Gagal tersambung ke server." });
    }
    setTimeout(() => setInviteMsg(null), 4000);
  };

  const handleRespondInvite = async (id, status) => {
    try {
      const r = await fetch(`/api/invite/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (r.ok) await fetchInvites();
    } catch {
      /* offline */
    }
  };

  const handleDecisionVerifikasiBerkas = async (id, decision) => {
    try {
      const r = await fetch(`/api/verifikasi-berkas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision }),
      });
      if (r.ok) await fetchVerifikasiBerkas();
    } catch {
      setVerifikasiBerkasList(
        verifikasiBerkasList.map((v) =>
          v.id === id ? { ...v, status: decision } : v,
        ),
      );
    }
  };

  const handleDecisionVerifikasiDataDiri = async (
    id,
    decision,
    comment = "",
  ) => {
    try {
      const r = await fetch(`/api/verifikasi-data-diri/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, komentarAdmin: comment }),
      });
      if (r.ok) {
        await fetchVerifikasiDataDiri();
        await fetchBiodata();
      }
    } catch {
      setVerifikasiDataDiriList(
        verifikasiDataDiriList.map((v) =>
          v.id === id ? { ...v, status: decision, komentarAdmin: comment } : v,
        ),
      );
    }
  };

  const handleDecisionPengajuanSewaKos = async (id, decision) => {
    // Owner: PUT /api/owner/pengajuan-masuk/:id
    try {
      const r = await fetch(`/api/owner/pengajuan-masuk/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision }),
      });
      if (r.ok) await fetchPengajuanSewaKos();
    } catch {
      setPengajuanSewaKosList(
        pengajuanSewaKosList.map((p) =>
          p.id === id ? { ...p, status: decision } : p,
        ),
      );
    }
  };

  const handleDecisionPengajuanOwner = async (id, decision, comment = "") => {
    try {
      const r = await fetch(`/api/pengajuan-owner/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, komentarAdmin: comment }),
      });
      if (r.ok) await fetchPengajuanOwner();
    } catch {
      setPengajuanOwnerList(
        pengajuanOwnerList.map((p) =>
          p.id === id ? { ...p, status: decision, komentarAdmin: comment } : p,
        ),
      );
    }
  };

  const handleSubmitSewa = async () => {
    if (!biodata?.isVerified) {
      setSewaMsg({
        type: "error",
        text: "Data diri Anda belum diverifikasi admin. Tunggu konfirmasi verifikasi terlebih dahulu!",
      });
      return;
    }
    try {
      const r = await fetch("/api/pengajuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(currentUser.id),
          kamarId: selectedKamar.id,
          tipeSewa: calcTipe,
          durasiBulan: calcDurasi,
          totalTagihan: apiResult?.totalTagihanHasil,
        }),
      });
      if (r.ok) {
        setSewaMsg({
          type: "success",
          text: "Pengajuan sewa berhasil dikirim ke pemilik kost! Tunggu konfirmasi dari owner.",
        });
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
      kontrakHingga: null,
    };
    setKamarOwnerList([...kamarOwnerList, newKamar]);
    setAddKamarForm({ nomor: "", lantai: 1, harga: 1500000 });
    setShowAddKamar(false);
  };

  const handleEditKamar = (e) => {
    e.preventDefault();
    setKamarOwnerList(
      kamarOwnerList.map((k) =>
        k.id === editKamarId
          ? {
              ...k,
              nomor: editKamarForm.nomor,
              lantai: Number(editKamarForm.lantai),
              harga: Number(editKamarForm.harga),
            }
          : k,
      ),
    );
    setShowEditKamar(false);
    setEditKamarId(null);
  };

  const handleDeleteKamar = (id) => {
    setKamarOwnerList(kamarOwnerList.filter((k) => k.id !== id));
    setShowDeleteKamarId(null);
  };

  const handleUpdateKamarStatus = (id, newStatus) => {
    setKamarOwnerList(
      kamarOwnerList.map((k) =>
        k.id === id ? { ...k, status: newStatus } : k,
      ),
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("papikost_user");
    setCurrentUser(null);
    setCurrentRole("pencari");
    setProtectedError(null);
    setSelectedKamar(null);
    setUserPage("beranda");
  };

  // Pending invites for current user
  const pendingInvites = inviteList.filter(
    (i) => i.toUserId === currentUser?.id && i.status === "PENDING",
  );

  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(userData) => {
          setCurrentUser(userData);
          localStorage.setItem("papikost_user", JSON.stringify(userData));
          setCurrentRole(userData.role);
          setProtectedError(null);
        }}
      />
    );
  }

  // ── Guard: Owner belum terverifikasi → tampilkan halaman verifikasi ──────────
  if (currentRole === "pemilik") {
    const ownerStatus = currentUser.ownerVerifikasiStatus;
    if (ownerStatus !== "DISETUJUI") {
      return (
        <OwnerVerifikasiGate
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );
    }
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
              <h1 className="font-bold tracking-tight text-xl">
                PapiKost Medan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === "pencari" && pendingInvites.length > 0 && (
              <button
                onClick={() => {
                  setUserPage("notifikasi");
                  setCurrentRole("pencari");
                }}
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
                  {currentUser.role === "pencari"
                    ? "Penyewa"
                    : currentUser.role === "pemilik"
                      ? "Owner Kost"
                      : "Administrator"}
                </p>
                <p className="text-xs font-bold text-white leading-none">
                  {currentUser.name}
                </p>
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
            <motion.div
              key="pencari"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <UserDashboard currentUser={currentUser} />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              ROLE: ADMIN
          ═══════════════════════════════════════════════ */}
          {currentRole === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col lg:flex-row"
            >
              <AdminDashboard
                currentUser={currentUser}
                verifikasiDataDiriList={verifikasiDataDiriList}
                pengajuanOwnerList={pengajuanOwnerList}
                onBerkasUserAction={async (
                  userId,
                  jenisBerkas,
                  status,
                  komentar,
                ) => {
                  try {
                    const r = await fetch(
                      `/api/verifikasi-data-diri/${userId}/berkas`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ jenisBerkas, status, komentar }),
                      },
                    );
                    if (r.ok) {
                      const data = await r.json();
                      setVerifikasiDataDiriList((prev) =>
                        prev.map((v) =>
                          (v.userId || v.id) === userId ? data.data : v,
                        ),
                      );
                    } else {
                      const errData = await r.json().catch(() => ({}));
                      console.error("Gagal update berkas user:", errData);
                    }
                  } catch (err) {
                    console.error("Error network:", err);
                    setVerifikasiDataDiriList((prev) =>
                      prev.map((v) =>
                        (v.userId || v.id) === userId
                          ? {
                              ...v,
                              [`${jenisBerkas}Status`]: status,
                              [`${jenisBerkas}Komentar`]: komentar,
                            }
                          : v,
                      ),
                    );
                  }
                }}
                onBerkasOwnerAction={async (
                  id,
                  jenisBerkas,
                  status,
                  komentar,
                ) => {
                  try {
                    const r = await fetch(`/api/pengajuan-owner/${id}/berkas`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ jenisBerkas, status, komentar }),
                    });
                    if (r.ok) {
                      const data = await r.json();
                      // Update item yang berubah di list
                      setPengajuanOwnerList((prev) =>
                        prev.map((p) => (p.id === id ? data.data : p)),
                      );
                    } else {
                      const errData = await r.json().catch(() => ({}));
                      console.error("Gagal update berkas owner:", errData);
                    }
                  } catch (err) {
                    console.error("Error network:", err);
                    // Optimistic update sebagai fallback offline
                    setPengajuanOwnerList((prev) =>
                      prev.map((p) =>
                        p.id === id
                          ? {
                              ...p,
                              [`${jenisBerkas}Status`]: status,
                              [`${jenisBerkas}Komentar`]: komentar,
                            }
                          : p,
                      ),
                    );
                  }
                }}
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              ROLE: PEMILIK (OWNER DASHBOARD)
          ═══════════════════════════════════════════════ */}
          {currentRole === "pemilik" && (
            <motion.div
              key="pemilik"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col lg:flex-row"
            >
              <OwnerDashboard currentUser={currentUser} />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════
              ROLE: JAVA OOP INSPECTOR
          ═══════════════════════════════════════════════ */}
          {currentRole === "javabackend" && (
            <motion.div
              key="javabackend"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col lg:flex-row bg-[#1e1e24] text-neutral-300"
            >
              <aside className="w-full lg:w-72 bg-[#17171d] border-r border-neutral-800 p-5 flex flex-col gap-6 shrink-0 lg:sticky lg:top-0 h-auto lg:h-[calc(100vh-68px)]">
                <div>
                  <h3 className="text-zinc-200 font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-400" /> Java OOP
                    Explorer
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-mono tracking-widest mt-0.5">
                    Project Structure
                  </p>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">
                      📁 maven configuration
                    </span>
                    <button
                      onClick={() => setActiveJavaFile("pom.xml")}
                      className={`w-full px-3 py-1.5 rounded text-xs font-mono text-left flex items-center gap-2 transition ${activeJavaFile === "pom.xml" ? "bg-emerald-900/60 text-emerald-300 border-l-2 border-emerald-400" : "hover:bg-neutral-800"}`}
                    >
                      ⚙️ pom.xml
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">
                      📁 jpa entities
                    </span>
                    <div className="flex flex-col gap-1 pl-2">
                      {["Akun.java", "Penyewa.java"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveJavaFile(f)}
                          className={`px-3 py-1.5 rounded text-xs font-mono text-left block transition ${activeJavaFile === f ? "bg-[#2d2d3a] text-yellow-300 border-l-2 border-yellow-400 font-bold" : "hover:bg-[#25252f]"}`}
                        >
                          ☕ {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">
                      📁 oop models
                    </span>
                    <div className="flex flex-col gap-1 pl-2">
                      {[
                        "Reservasi.java",
                        "ReservasiSolo.java",
                        "ReservasiPatungan.java",
                      ].map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveJavaFile(f)}
                          className={`px-3 py-1.5 rounded text-xs font-mono text-left block transition ${activeJavaFile === f ? "bg-[#2d2d3a] text-blue-300 border-l-2 border-blue-400 font-bold" : "hover:bg-[#25252f]"}`}
                        >
                          ☕ {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a8a91] mb-2 block">
                      📁 controllers & seeders
                    </span>
                    <div className="flex flex-col gap-1 pl-2 font-mono">
                      {["DatabaseSeeder.java", "ReservasiController.java"].map(
                        (f) => (
                          <button
                            key={f}
                            onClick={() => setActiveJavaFile(f)}
                            className={`px-3 py-1.5 rounded text-xs text-left block transition ${activeJavaFile === f ? "bg-[#2d2d3a] text-[#a5d6a7]" : "hover:bg-[#25252f]"}`}
                          >
                            ☕ {f}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </aside>

              <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center bg-[#17171d] p-4 rounded-xl border border-neutral-800">
                  <div>
                    <h2 className="text-sm font-mono text-emerald-400 font-bold">
                      .../{activeJavaFile}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      {javaFiles[activeJavaFile]?.description}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <Copy className="h-4 w-4" />{" "}
                    {copied ? "Disalin!" : "Salin Kode"}
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
                    <span className="text-[10px] bg-emerald-500 text-emerald-950 font-bold self-start px-2 py-0.5 rounded uppercase tracking-wider">
                      REST API SIMULATOR
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      Simulasikan /api/reservasi/hitung
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-950/40 p-4 rounded-xl border border-emerald-900">
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">
                        Tipe Klas
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setCalcTipe("solo")}
                          className={`flex-1 py-1.5 px-2 rounded text-xs font-bold font-mono transition ${calcTipe === "solo" ? "bg-emerald-500 text-emerald-950" : "bg-emerald-900/60"}`}
                        >
                          Solo
                        </button>
                        <button
                          onClick={() => setCalcTipe("patungan")}
                          className={`flex-1 py-1.5 px-2 rounded text-xs font-bold font-mono transition ${calcTipe === "patungan" ? "bg-emerald-500 text-emerald-950" : "bg-emerald-900/60"}`}
                        >
                          Patungan
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">
                        Harga Dasar
                      </label>
                      <input
                        type="range"
                        min={1000000}
                        max={3000000}
                        step={10000}
                        value={calcHargaDasar}
                        onChange={(e) =>
                          setCalcHargaDasar(Number(e.target.value))
                        }
                        className="w-full accent-emerald-400"
                      />
                      <span className="text-xs font-mono font-bold mt-1 text-white block">
                        Rp {fmt(calcHargaDasar)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">
                        Jumlah Orang
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={calcJumlahOrang}
                        onChange={(e) =>
                          setCalcJumlahOrang(Number(e.target.value))
                        }
                        disabled={calcTipe === "solo"}
                        className="w-full accent-emerald-400"
                      />
                      <span className="text-xs font-mono font-bold mt-1 text-white block">
                        {calcTipe === "solo"
                          ? "1 (Solo)"
                          : `${calcJumlahOrang} Orang`}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#9dccaf] mb-1.5">
                        Durasi (Bulan)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={24}
                        step={1}
                        value={calcDurasi}
                        onChange={(e) => setCalcDurasi(Number(e.target.value))}
                        className="w-full accent-emerald-400"
                      />
                      <span className="text-xs font-mono font-bold mt-1 text-white block">
                        {calcDurasi} Bulan
                      </span>
                    </div>
                  </div>
                  {apiResult && (
                    <div className="bg-[#121c17] text-[#a9dfc0] rounded-xl p-4 font-mono text-xs border border-emerald-900/40">
                      <div className="flex justify-between items-center border-b border-emerald-900 pb-2 mb-2">
                        <span className="font-bold text-emerald-400">
                          📡 GET /api/reservasi/hitung
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold bg-[#1d3528] px-2 py-0.5 rounded">
                          HTTP 200 OK
                        </span>
                      </div>
                      <pre className="whitespace-pre overflow-x-auto text-[#b2ddbd]">
                        {JSON.stringify(apiResult, null, 2)}
                      </pre>
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
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
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
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Nomor Kamar
                </label>
                <input
                  type="text"
                  placeholder="Kamar 07"
                  required
                  value={editKamarForm.nomor}
                  onChange={(e) =>
                    setEditKamarForm({
                      ...editKamarForm,
                      nomor: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Lantai
                </label>
                <select
                  value={editKamarForm.lantai}
                  onChange={(e) =>
                    setEditKamarForm({
                      ...editKamarForm,
                      lantai: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value={1}>Lantai 1</option>
                  <option value={2}>Lantai 2</option>
                  <option value={3}>Lantai 3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Harga/Bulan
                </label>
                <input
                  type="number"
                  placeholder="1500000"
                  required
                  min={500000}
                  value={editKamarForm.harga}
                  onChange={(e) =>
                    setEditKamarForm({
                      ...editKamarForm,
                      harga: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditKamar(false);
                    setEditKamarId(null);
                  }}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Hapus Kamar Modal ── */}
      {showDeleteKamarId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-neutral-900">
              Hapus Kamar?
            </h3>
            <p className="text-sm text-neutral-600">
              Yakin ingin menghapus{" "}
              <strong>
                {kamarOwnerList.find((k) => k.id === showDeleteKamarId)?.nomor}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteKamarId(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteKamar(showDeleteKamarId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
