export interface KamarKost {
  id: number;
  namaKost: string;
  daerah: string;
  hargaDasar: number;
  status: string;
  rating: number;
  image: string;
  wifiCepat?: boolean;
  kamarMandiDalam?: boolean;
  ac?: boolean;
  mejaBelajar?: boolean;
  kasurSpringbed?: boolean;
  dapurBersama?: boolean;
  description?: string;
  availableRooms?: number;
}

export interface LaporanKerusakan {
  id: string;
  tanggal: string;
  kategori: string;
  kendala: string;
  status: "DIPROSES" | "SELESAI" | "BARU";
  detail: string;
}

export interface VerifikasiPemilik {
  id: number;
  namaPemilik: string;
  namaKost: string;
  lokasi: string;
  kecamatan: string;
  dokumen: string[];
  status: "PENDING" | "DISETUJUI" | "DITOLAK";
}

export interface PengajuanSewa {
  id: number;
  namaPenyewa: string[];
  isPatungan: boolean;
  kamar: string;
  masukHariIni: boolean;
  pekerjaan: string;
  asalKota: string;
  hargaSewaBulan: number;
  rencanaSewaBulan: number;
  status: "MENUNGGU" | "TERIMA" | "TOLAK";
}

export interface ReservasiResponse {
  idReservasi: string;
  tipe: string;
  hargaDasarSewa: number;
  durasiBulan: number;
  totalTagihanHasil: number;
  deskripsiKonsep: string;
  formulaPBO: string;
  isEmulatedFromJava?: boolean;
  javaClassSource?: string;
  jumlahOrangPatungan?: number;
  hargaPerOrangPerBulan?: number;
  jumlahOrang?: number;
}

export interface BiodataUser {
  userId: string;
  namaLengkap: string;
  tanggalLahir: string;
  tempatLahir: string;
  jenisKelamin: string;
  noHp: string;
  alamat: string;
  pekerjaan: string;
  // berkas
  ktpUrl: string;
  kkUrl: string;
  fotoUrl: string;
  isLengkap: boolean;
}

export interface InvitePatungan {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  kamarId: number;
  namaKost: string;
  hargaDasar: number;
  jumlahOrang: number;
  durasi: number;
  status: "PENDING" | "DITERIMA" | "DITOLAK";
  createdAt: string;
}

export interface PengajuanOwner {
  id: string;
  userId: string;
  namaLengkap: string;
  email: string;
  namaKost: string;
  alamatKost: string;
  daerah: string;
  ktpUrl: string;
  suratKepemilikanUrl: string;
  fotoKostUrl: string;
  status: "PENDING" | "DISETUJUI" | "DITOLAK";
  createdAt: string;
}

export interface VerifikasiBerkasPenyewa {
  id: string;
  userId: string;
  namaLengkap: string;
  email: string;
  kamarId: number;
  namaKost: string;
  isPatungan: boolean;
  rekanPatungan?: string[];
  ktpUrl: string;
  kkUrl: string;
  fotoUrl: string;
  status: "PENDING" | "DISETUJUI" | "DITOLAK";
  createdAt: string;
}
