import React, { useState } from "react";
import { Layers, ShieldAlert, Key, UserPlus, ArrowLeft, Eye, EyeOff, User, Mail, Lock, Home, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState("pencari"); // "pencari" | "pemilik"
  const [showRegPass, setShowRegPass] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Terjadi kesalahan sistem login.");
      if (data.success) onLoginSuccess(data);
    } catch (err) {
      setErrorMsg(err.message || "Gagal tersambung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (regPassword !== regConfirm) {
      setRegError("Password dan konfirmasi password tidak cocok!");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password minimal 6 karakter!");
      return;
    }

    setRegLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          name: regName,
          email: regEmail,
          role: regRole,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mendaftar.");
      if (data.success) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setRegError(err.message || "Gagal tersambung ke server.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-emerald-950 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full opacity-20 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-700 rounded-full opacity-15 -ml-8 -mb-8"></div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <span className="p-2.5 bg-emerald-800 rounded-xl text-emerald-300 shadow">
              <Layers className="h-7 w-7" />
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-2">PapiKost Medan</h1>
            <p className="text-xs text-emerald-300/90 font-mono tracking-wider">
              {mode === "login" ? "Sistem Sewa Kost" : "Daftar Akun Baru"}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8"
            >
              <h2 className="text-lg font-bold text-neutral-800 text-center mb-1">Silakan Masuk</h2>
              <p className="text-xs text-neutral-500 text-center mb-6">
                Masuk ke akun PapiKost Anda
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex gap-2 items-start">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username..."
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password..."
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Key className="h-4 w-4" />
                  {loading ? "Memproses..." : "Masuk Aplikasi"}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-500 mb-3">Belum punya akun?</p>
                <button
                  onClick={() => { setMode("register"); setErrorMsg(""); }}
                  className="w-full py-2.5 border-2 border-emerald-700 text-emerald-800 font-bold rounded-xl text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" /> Daftar Akun Baru
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => { setMode("login"); setRegError(""); setRegSuccess(""); }}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-neutral-800">Buat Akun Baru</h2>
                  <p className="text-xs text-neutral-500">Daftar sebagai pengguna PapiKost</p>
                </div>
              </div>

              {regError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex gap-2 items-start">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                  {regSuccess}
                </div>
              )}

              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                    Daftar Sebagai
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole("pencari")}
                      className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl border-2 transition-all ${
                        regRole === "pencari"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      }`}
                    >
                      <Search className="h-5 w-5" />
                      <span className="text-xs font-bold">Pencari Kost</span>
                      <span className="text-[10px] text-center leading-tight opacity-70">Cari & sewa kamar kost</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole("pemilik")}
                      className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl border-2 transition-all ${
                        regRole === "pemilik"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      }`}
                    >
                      <Home className="h-5 w-5" />
                      <span className="text-xs font-bold">Pemilik Kost</span>
                      <span className="text-[10px] text-center leading-tight opacity-70">Kelola & sewakan kost</span>
                    </button>
                  </div>
                  {regRole === "pemilik" && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                      ⚠ Akun owner perlu diverifikasi admin sebelum bisa mengelola kost.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nama lengkap Anda..."
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Buat username unik..."
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type={showRegPass ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 karakter..."
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      placeholder="Ulangi password..."
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full mt-2 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  {regLoading ? "Mendaftarkan..." : `Daftar sebagai ${regRole === "pencari" ? "Pencari Kost" : "Pemilik Kost"}`}
                </button>
              </form>

              <p className="text-center text-xs text-neutral-400 mt-4">
                Sudah punya akun?{" "}
                <button
                  onClick={() => { setMode("login"); setRegError(""); }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
