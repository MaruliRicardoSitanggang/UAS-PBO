## UAS PBO
Proyek ini merupakan Tugas Mata Kuliah Pemrograman Berorientasi Objek.

Dikembangkan oleh Kelompok PAPI KOST :

241401005 Maruli Ricardo Sitanggang

241401017 Fadly Hudaya Simanjuntak

241401020 Rio Johanes

241401041 Jonathan Linggom Nainggolan

Kami akan mendemonstrasikan aplikasi PapiKost. Aplikasi ini adalah platform manajemen sewa kost berbasis web yang dirancang untuk memudahkan pencari kost menemukan hunian, memfasilitasi pengajuan sewa, serta membantu pemilik kost dalam mengelola kamar dan verifikasi data penyewa secara efisien.

Sebagai bagian dari penerapan konsep Pemrograman Berorientasi Objek (PBO), sistem kami dibangun dengan fondasi 4 Pilar OOP:

1. Encapsulation: Menjaga keamanan data pengguna dan entitas kost, di mana field sensitif seperti password dan detail biodata disimpan dengan proteksi akses, serta manipulasi data dilakukan melalui getter/setter yang terdefinisi untuk menjaga integritas objek.

2. Inheritance: Menerapkan pewarisan dari abstract class Akun ke Penyewa, serta Reservasi ke ReservasiSolo dan ReservasiPatungan, sehingga atribut dan logika dasar dapat diwariskan secara efisien.

3. Polymorphism: Implementasi runtime polymorphism pada metode hitungTotalTagihan() yang mampu menangani objek ReservasiSolo maupun ReservasiPatungan secara dinamis, mengembalikan perhitungan tagihan yang berbeda berdasarkan tipe reservasi tanpa perlu mengetahui tipe pastinya di runtime.

4. Abstraction: Menyembunyikan kerumitan sistem di balik antarmuka yang mudah digunakan, sehingga pengguna cukup mengeklik "Ajukan Sewa" atau "Setujui Pengajuan" tanpa perlu memikirkan proses validasi, penyimpanan ke database, maupun mekanisme CORS di balik layar.

Komponen & Teknologi yang Dipakai:

1. Frontend: React.js & Vite & Tailwind CSS

2. Backend: Java Spring Boot 3.2.5

3. Database: H2 Database (file-based, embedded)

Link GitHub:
https://github.com/MaruliRicardoSitanggang/UAS-PBO-Backend.git
https://github.com/MaruliRicardoSitanggang/UAS-PBO.git

