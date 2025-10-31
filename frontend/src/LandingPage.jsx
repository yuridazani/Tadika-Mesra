import React from 'react';
import { Link } from 'react-router-dom';
const teamMembers = ['Yurida Zani', 'Aulia Zamaira', 'Muhammad Dwiki Ramadani', 'Dimas Hammam Abdillah', 'Ali Sofyan'];

function LandingPage() {
  return (
    <div className="relative w-full min-h-screen font-lato text-white-smoke">
      <img 
        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070" 
        alt="Mountain background"
        className="absolute top-0 left-0 object-cover w-full h-full"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black-custom opacity-60"></div>
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen p-8 text-center">
        <h1 className="text-6xl font-bold md:text-8xl font-playfair">
          Tadika Mesra
        </h1>
        <p className="max-w-2xl mt-4 text-lg md:text-xl text-white-smoke/80">
          Sebuah proyek website untuk memenuhi tugas mata kuliah Pemrograman Aplikasi Berbasis Web (PABW).
        </p>
        <div className="flex flex-col gap-4 mt-10 sm:flex-row">
          <Link to="/register" className="px-8 py-3 font-bold text-center text-white transition-transform duration-300 transform bg-chocolate-cosmos rounded-full hover:scale-105">
            Register
          </Link>
          <Link to="/login" className="px-8 py-3 font-semibold text-center transition-colors duration-300 border-2 border-white rounded-full hover:bg-white hover:text-black-custom">
            Sign In
          </Link>
        </div>
        <div className="mt-16">
          <h3 className="tracking-widest uppercase text-beaver">DIBANGUN OLEH</h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-3">
            {teamMembers.map((member) => (
              <span key={member} className="text-lg font-semibold">
                {member}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LandingPage;