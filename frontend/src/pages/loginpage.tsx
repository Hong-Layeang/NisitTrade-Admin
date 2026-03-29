import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginFormModal from "../components/auth/loginFormModal.tsx";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Banner */}
      <div className="relative h-[60vh] w-full overflow-hidden"> 
        <img
          src="/login_banner.png"
          alt="Login banner"
          className="absolute inset-0 w-full h-full object-cover object-[50%_100%]"
        />

        {/* Bottom fade only */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-6 flex flex-col items-center text-center px-4">
        <p className="text-sm text-slate-400 mb-2">
          Welcome to NisitTrade
        </p>

        <h1 className="text-xl font-semibold">
          <span className="text-brand">Buy.</span>{" "}
          <span className="text-brand">Sell.</span>
        </h1>


        {/* Open popup */}
        <button
          onClick={() => setOpenForm(true)}
          className="
            mt-3 w-full max-w-sm
            rounded-full
            bg-gradient-to-r from-brand to-sky-500
            py-3 font-semibold text-white
            shadow-lg shadow-brand/30
            transition
            hover:brightness-105
            active:scale-[0.98]
          "
        >
          LOGIN
        </button>

        <div className="mt-4 text-xs text-slate-400 space-x-2">
          <span>Terms of use</span>
          <span>|</span>
          <span>Privacy policy</span>
        </div>
      </div>

      {/* Popup login form */}
      <LoginFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={() => navigate("/")}
      />
    </div>
  );
};

export default LoginPage;