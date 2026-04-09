"use client";

import React, { useContext, useState } from "react";
import AuthContext from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { FiInfo } from "react-icons/fi";
import { ACTION_LABELS, DEFAULT_SHORTCUTS, loadShortcuts, saveShortcuts } from "@/utils/shortcutConfig";

export default function ShortcutsPage() {
  const { user } = useContext(AuthContext);
  const [shortcutConfig, setShortcutConfig] = useState(() => loadShortcuts());
  const [shortcutError, setShortcutError] = useState("");

  if (!user) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 md:p-10">
      <Card className="border border-default-200/60 bg-content1/70 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex items-center gap-4 p-8">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <FiInfo size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wide">Keyboard Shortcuts</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-default-400">Dashboard Navigation</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
            <div className="space-y-4">
              {Object.entries(ACTION_LABELS).map(([action, label]) => {
                const key = shortcutConfig[action as keyof typeof shortcutConfig] || "";
                return (
                  <div key={action} className="flex items-center justify-between rounded-2xl border border-default-200/50 bg-content2/30 p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{label}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400">Cmd/Ctrl + {key}</span>
                    </div>
                    <select
                      value={key}
                      onChange={(e) => {
                        const next = { ...shortcutConfig, [action]: e.target.value.toUpperCase() };
                        const values = Object.values(next);
                        const hasDuplicate = values.some((v, idx) => values.indexOf(v) !== idx);
                        if (hasDuplicate) {
                          setShortcutError("Duplicate shortcuts detected. Choose unique keys.");
                          return;
                        }
                        setShortcutError("");
                        setShortcutConfig(next);
                        saveShortcuts(next as any);
                      }}
                      className="rounded-xl border border-default-200/60 bg-content1/60 px-3 py-2 text-xs font-black uppercase tracking-widest"
                    >
                      {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                        <option key={letter} value={letter}>{letter}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-default-200/50 bg-content2/30 p-4">
                <p className="text-xs text-default-500 leading-relaxed">
                  Shortcuts work only inside the dashboard. On Mac use <strong>Command</strong>. On Windows use <strong>Ctrl</strong>.
                </p>
              </div>
              {shortcutError && (
                <div className="rounded-2xl border border-danger-200/60 bg-danger-50/20 p-4 text-xs text-danger-600">
                  {shortcutError}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setShortcutConfig(DEFAULT_SHORTCUTS);
                  saveShortcuts(DEFAULT_SHORTCUTS);
                  setShortcutError("");
                }}
                className="w-full rounded-2xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.3em] text-warning-600 hover:bg-warning-500/20 transition"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
