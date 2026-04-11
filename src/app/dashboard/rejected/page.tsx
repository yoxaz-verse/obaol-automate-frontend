"use client";

import { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { LuShieldOff, LuAlertTriangle, LuMail, LuPhone } from "react-icons/lu";

export default function RejectedPage() {
  const { user, logout } = useContext(AuthContext);
  const roleLabel = String(user?.role || "User").toUpperCase();
  const rejectionReason = (user as any)?.rejectionReason || "";

  return (
    <div className="min-h-screen px-6 py-16 md:px-12 lg:px-20 bg-[#04070f]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end">
          <Button
            size="sm"
            radius="full"
            variant="bordered"
            className="border-default-200 text-default-500"
            onPress={() => logout()}
          >
            Sign Out
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 rounded-[3rem] border border-danger-500/30 bg-danger-500/5 p-10 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-danger-500/15 border border-danger-500/30 flex items-center justify-center text-danger-400">
              <LuShieldOff size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-danger-400">Account Rejected</p>
              <h1 className="text-3xl md:text-4xl font-black text-foreground mt-2">{roleLabel} Access Denied</h1>
            </div>
          </div>

          <p className="mt-6 text-sm text-default-400 leading-relaxed">
            Your account was reviewed by the admin team and marked as rejected. If you believe this is a mistake,
            please contact support to request a review.
          </p>

          {rejectionReason ? (
            <div className="mt-6 rounded-2xl border border-danger-500/30 bg-danger-500/10 p-4">
              <div className="flex items-center gap-3 text-danger-300">
                <LuAlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Rejection Note</span>
              </div>
              <p className="mt-2 text-xs text-danger-200 leading-relaxed">{rejectionReason}</p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3 text-default-300">
                <LuMail size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Support Email</span>
              </div>
              <p className="mt-2 text-xs text-default-400">support@obaol.com</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3 text-default-300">
                <LuPhone size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Support Phone</span>
              </div>
              <p className="mt-2 text-xs text-default-400">+91 00000 00000</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
