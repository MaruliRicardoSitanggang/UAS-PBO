export const javaFiles: Record<string, { description: string; content: string; language: string }> = {
  "pom.xml": {
    description: "Definisi ketergantungan maven (Maven POM) yang mengkonfigurasi Spring Boot Starter, JPA, dan Database H2.",
    language: "xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>
    <groupId>com.papikost</groupId>
    <artifactId>backend</artifactId>
    <version>1.0.0</version>
    <name>PapiKost Java Backend</name>
    <description>REST API PapiKost - Tugas Pemrograman Berorientasi Objek (PBO)</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>`
  },
  "Akun.java": {
    description: "Abstract class dasar JPA Entity (Generalisasi) yang memetakan akun sistem dengan proteksi data Kapsulisasi (@Entity, @Inheritance).",
    language: "java",
    content: `package com.papikost.api.entity;

import jakarta.persistence.*;

// ==========================================
// 1. ABSTRACTION & INHERITANCE (PBO)
// ==========================================
// Class ini dideklarasikan sebagai abstract, bertindak sebagai cetak biru model akun.
// Menggunakan pewarisan JPA JOINED untuk memetakan subclass ke dalam tabel-tabel terpisah.

@Entity
@Table(name = "akun")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Akun {

    // ==========================================
    // 2. ENCAPSULATION (PBO)
    // ==========================================
    // Menyembunyikan atribut penting menggunakan keyword 'private' agar aman.
    // Membuka akses manipulasi yang aman secara tidak langsung melalui Getter & Setter publik.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // "ADMIN", "PEMILIK", "PENYEWA"

    // Constructor Default wajib untuk JPA
    public Akun() {}

    // Overloaded Constructor
    public Akun(String email, String password, String role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // ==========================================
    // GETTERS & SETTERS (Akses Mutator Terpadu)
    // ==========================================
    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return this.password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return this.role; }
    public void setRole(String role) { this.role = role; }
}`
  },
  "Penyewa.java": {
    description: "Subclass khusus Penyewa yang mewarisi class Akun, menambah enkapsulasi data spesifik penyewa.",
    language: "java",
    content: `package com.papikost.api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

// ==========================================
// INHERITANCE (PBO)
// ==========================================
// Penyewa secara mutlak mewarisi (extends) seluruh fungsionalitas dari kelas induk 'Akun'.
// Menambahkan field tambahan yang bersifat spesifik untuk penyewa kost.

@Entity
@Table(name = "penyewa")
@PrimaryKeyJoinColumn(name = "id_akun")
public class Penyewa extends Akun {

    private String namaPenyewa;
    private String pekerjaan;
    private String kotaAsal;

    public Penyewa() {
        super();
        this.setRole("PENYEWA");
    }

    public Penyewa(String email, String password, String namaPenyewa, String pekerjaan, String kotaAsal) {
        super(email, password, "PENYEWA");
        this.namaPenyewa = namaPenyewa;
        this.pekerjaan = pekerjaan;
        this.kotaAsal = kotaAsal;
    }

    // ==========================================
    // ENCAPSULATION (Getter & Setters Khusus)
    // ==========================================
    public String getNamaPenyewa() { return namaPenyewa; }
    public void setNamaPenyewa(String namaPenyewa) { this.namaPenyewa = namaPenyewa; }

    public String getPekerjaan() { return pekerjaan; }
    public void setPekerjaan(String pekerjaan) { this.pekerjaan = pekerjaan; }

    public String getKotaAsal() { return kotaAsal; }
    public void setKotaAsal(String kotaAsal) { this.kotaAsal = kotaAsal; }
}`
  },
  "Reservasi.java": {
    description: "Abstract model Reservasi yang mendeklarasikan abstract method hitungTotalTagihan untuk di-override.",
    language: "java",
    content: `package com.papikost.api.model;

// ==========================================
// ABSTRACTION (PBO)
// ==========================================
// Kelas ini melarang instansiasi eksplisit (abstract class). 
// Berfungsi untuk mendefinisikan operasi dasar sewa kost tanpa mengekspos formula spesifik.

public abstract class Reservasi {

    private String idReservasi;
    private double hargaKostDasar; // Harga sewa dasar per bulan
    private int durasiBulan;

    public Reservasi() {}

    public Reservasi(String idReservasi, double hargaKostDasar, int durasiBulan) {
        this.idReservasi = idReservasi;
        this.hargaKostDasar = hargaKostDasar;
        this.durasiBulan = durasiBulan;
    }

    // ==========================================
    // ABSTRACTION - ABSTRACT METHOD (PBO)
    // ==========================================
    // Metode tanpa body yang WAJIB diimplementasikan secara spesifik oleh kelas turunannya.
    public abstract double hitungTotalTagihan();

    // ENCAPSULATION Getters & Setters
    public String getIdReservasi() { return idReservasi; }
    public void setIdReservasi(String idReservasi) { this.idReservasi = idReservasi; }

    public double getHargaKostDasar() { return hargaKostDasar; }
    public void setHargaKostDasar(double hargaKostDasar) { this.hargaKostDasar = hargaKostDasar; }

    public int getDurasiBulan() { return durasiBulan; }
    public void setDurasiBulan(int durasiBulan) { this.durasiBulan = durasiBulan; }
}`
  },
  "ReservasiSolo.java": {
    description: "Turunan Reservasi untuk sewa mandiri yang mengimplementasikan polimorfisme metode hitungTotalTagihan dasar.",
    language: "java",
    content: `package com.papikost.api.model;

// ==========================================
// INHERITANCE & POLYMORPHISM (PBO)
// ==========================================
// 'extends' menandakan pewarisan dari template abstrak 'Reservasi'.
// '@Override' melambangkan polimorfisme untuk merealisasikan formula hitungTotalTagihan.

public class ReservasiSolo extends Reservasi {

    public ReservasiSolo() {
        super();
    }

    public ReservasiSolo(String idReservasi, double hargaKostDasar, int durasiBulan) {
        super(idReservasi, hargaKostDasar, durasiBulan);
    }

    // ==========================================
    // POLYMORPHISM - OVERRIDING (PBO)
    // ==========================================
    // Menghitung tagihan tunggal: Total = Harga Dasar Kost * Durasi Bulan sewa.
    @Override
    public double hitungTotalTagihan() {
        return this.getHargaKostDasar() * this.getDurasiBulan();
    }
}`
  },
  "ReservasiPatungan.java": {
    description: "Turunan Reservasi dengan modifikasi formula tagihan patungan. Membagi tarif merata di antara pemesan.",
    language: "java",
    content: `package com.papikost.api.model;

// ==========================================
// INHERITANCE & POLYMORPHISM (PBO)
// ==========================================
// Kelas anak ReservasiPatungan mengimplementasikan metode abstract dengan formula kelompok.

public class ReservasiPatungan extends Reservasi {

    private int jumlahOrang;

    public ReservasiPatungan() {
        super();
        this.jumlahOrang = 1;
    }

    public ReservasiPatungan(String idReservasi, double hargaKostDasar, int durasiBulan, int jumlahOrang) {
        super(idReservasi, hargaKostDasar, durasiBulan);
        this.jumlahOrang = Math.max(1, jumlahOrang);
    }

    // ==========================================
    // POLYMORPHISM - OVERRIDING (PBO)
    // ==========================================
    // Di-override agar membagi rata harga kost dasar per bulan dengan jumlah orang patungan.
    // Tagihan per Bulan = Harga Kost Dasar / Jumlah Orang
    // Total Tagihan = Tagihan per Bulan * Durasi Bulan
    @Override
    public double hitungTotalTagihan() {
        double hargaPatunganPerOrang = this.getHargaKostDasar() / this.jumlahOrang;
        return hargaPatunganPerOrang * this.getDurasiBulan();
    }

    // ENCAPSULATION Getter & Setter
    public int getJumlahOrang() { return this.jumlahOrang; }
    public void setJumlahOrang(int jumlahOrang) { this.jumlahOrang = Math.max(1, jumlahOrang); }
}`
  },
  "DatabaseSeeder.java": {
    description: "CommandLineRunner Spring Boot untuk menginisialisasi database in-memory H2 dengan data Rio Johanes, Andreas, Maruli dkk saat server menyala.",
    language: "java",
    content: `package com.papikost.api.seeder;

import com.papikost.api.entity.KamarKost;
import com.papikost.api.entity.Penyewa;
import com.papikost.api.repository.KamarKostRepository;
import com.papikost.api.repository.PenyewaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final PenyewaRepository penyewaRepository;
    private final KamarKostRepository kamarKostRepository;

    public DatabaseSeeder(PenyewaRepository penyewaRepository, KamarKostRepository kamarKostRepository) {
        this.penyewaRepository = penyewaRepository;
        this.kamarKostRepository = kamarKostRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Memulai Seeding Database...");

        // 1. Data Penyewa (Mewakili data Rio Johanes, Andreas Pegri Damanik, Maruli Ricardo)
        if (penyewaRepository.count() == 0) {
            penyewaRepository.save(new Penyewa("riojohanes@email.com", "pass1", "Rio Johanes", "Mahasiswa", "Medan"));
            penyewaRepository.save(new Penyewa("andreas@email.com", "pass2", "Andreas Pegri Damanik", "Karyawan", "Medan"));
            penyewaRepository.save(new Penyewa("maruli@email.com", "pass3", "Maruli Ricardo", "Karyawan", "Medan"));
        }

        // 2. Data Kamar Kost Medan (daerah Padang Bulan, Dr. Mansyur, Setia Budi)
        if (kamarKostRepository.count() == 0) {
            kamarKostRepository.save(new KamarKost("Kost Putra Padang Bulan", "Padang Bulan", 1500000.0, "Tersedia 2 Kamar"));
            kamarKostRepository.save(new KamarKost("Kost Eksklusif Setia Budi", "Setia Budi", 2200000.0, "Tersedia"));
            kamarKostRepository.save(new KamarKost("Kost Putri Dr. Mansyur", "Dr. Mansyur", 1300000.0, "Sisa 1 Kamar"));
        }
        System.out.println("Database Seeding Berhasil!");
    }
}`
  },
  "ReservasiController.java": {
    description: "Spring Boot Rest Controller dengan endpoint pencocokan runtime polimorfisme @CrossOrigin /api/reservasi/hitung.",
    language: "java",
    content: `package com.papikost.api.controller;

import com.papikost.api.model.Reservasi;
import com.papikost.api.model.ReservasiPatungan;
import com.papikost.api.model.ReservasiSolo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reservasi")
@CrossOrigin(origins = "*") // Mengaktifkan akses CORS untuk dipanggil oleh React Frontend
public class ReservasiController {

    @GetMapping("/hitung")
    public ResponseEntity<Map<String, Object>> hitungReservasi(
            @RequestParam(defaultValue = "solo") String tipe,
            @RequestParam(defaultValue = "1500000") double hargaDasar,
            @RequestParam(defaultValue = "6") int durasi,
            @RequestParam(defaultValue = "2") int jumlahOrang
    ) {
        // ==========================================
        // POLYMORPHISM - RUNTIME POLYMORPHISM (PBO)
        // ==========================================
        // Kami mendeklarasikan variabel referensi bertipe kelas induk/parent 'Reservasi'.
        // Dinamis diinisiasi ke objek turunan spesifik berdasarkan string 'tipe'.
        // Panggilan 'reservasi.hitungTotalTagihan()' memanggil metode kelas anak yang sesuai secara runtime.
        
        Reservasi reservasi;

        if (tipe.equalsIgnoreCase("patungan")) {
            reservasi = new ReservasiPatungan("RES-PTG-100", hargaDasar, durasi, jumlahOrang);
        } else {
            reservasi = new ReservasiSolo("RES-SLO-200", hargaDasar, durasi);
        }

        // Eksekusi kode secara polimorfisme
        double totalTagihan = reservasi.hitungTotalTagihan();

        Map<String, Object> response = new HashMap<>();
        response.put("idReservasi", reservasi.getIdReservasi());
        response.put("tipe", tipe);
        response.put("hargaDasarSewa", hargaDasar);
        response.put("durasiBulan", durasi);
        response.put("totalTagihanHasil", totalTagihan);

        if (reservasi instanceof ReservasiPatungan) {
            ReservasiPatungan p = (ReservasiPatungan) reservasi;
            response.put("jumlahOrangPatungan", p.getJumlahOrang());
            response.put("formulaPBO", "Total = (hargaDasar / " + p.getJumlahOrang() + ") * " + durasi);
            response.put("deskripsiKonsep", "Mengeksekusi ReservasiPatungan.hitungTotalTagihan() -> [Polymorphism]");
        } else {
            response.put("jumlahOrang", 1);
            response.put("formulaPBO", "Total = hargaDasar * " + durasi);
            response.put("deskripsiKonsep", "Mengeksekusi ReservasiSolo.hitungTotalTagihan() -> [Polymorphism]");
        }

        return ResponseEntity.ok(response);
    }
}`
  }
};
