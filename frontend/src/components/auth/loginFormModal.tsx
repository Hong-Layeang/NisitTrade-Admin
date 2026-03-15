import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const LoginFormModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl relative">
        {/* Back / Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img src="/NisitTrade_Logo.png" alt="NisitTrade" className="h-10" />
        </div>

        <p className="mb-6 text-center text-sm text-slate-500">
          If you are already a member you can login with your email address and password.
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Options */}
        <div className="mb-6 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="rounded border-slate-300" />
            I accept the terms of service.
          </label>

          <button className="text-brand hover:underline">
            Forgot Password
          </button>
        </div>

        {/* Login */}
        <button
          onClick={onSubmit}
          className="w-full rounded-lg bg-brand py-3 font-semibold text-white hover:opacity-95 transition"
        >
          LOGIN
        </button>
      </div>
    </div>
  );
};

export default LoginFormModal;