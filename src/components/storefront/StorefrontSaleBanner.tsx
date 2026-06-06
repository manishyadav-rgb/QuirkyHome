"use client";

import { useEffect, useState } from "react";

type Settings = Record<string, any>;

export function StorefrontSaleBanner({ settings }: { settings: Settings }) {
  const endTime = new Date(settings.endDateTime || "").getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, endTime - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const radius = Math.max(0, Number(settings.radius || 20));

  return (
    <section className="qh-container qh-section-pad">
      <div
        className="overflow-hidden p-5 md:p-7"
        style={{
          borderRadius: `${radius}px`,
          background: `linear-gradient(120deg, ${settings.bgFrom || "#1b1f3b"}, ${settings.bgTo || "#ff6a3d"})`,
          color: settings.textColor || "#fff",
        }}
      >
        <h3 className="text-lg font-black md:text-2xl">{settings.title || "Mega Sale Ends Soon"}</h3>
        <p className="mt-1 text-xs md:text-sm">{settings.subtitle || "Grab your favorites before the timer runs out"}</p>
        <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
          {[{ l: "D", v: days }, { l: "H", v: hours }, { l: "M", v: mins }, { l: "S", v: secs }].map((item) => (
            <div key={item.l} className="rounded-lg bg-white/15 px-2 py-2 text-center backdrop-blur">
              <div className="text-base font-black md:text-2xl">{String(item.v).padStart(2, "0")}</div>
              <div className="text-[10px] font-bold">{item.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
