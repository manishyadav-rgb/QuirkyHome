"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  q: string;
  a: string;
}

interface StorefrontCollapsibleContentClientProps {
  heading: string;
  faqs: FAQ[];
}

export function StorefrontCollapsibleContentClient({
  heading,
  faqs,
}: StorefrontCollapsibleContentClientProps) {
  // First item open by default, identical to product page behavior
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] lg:items-start">
      {/* Left Column - Card Header */}
      <div className="rounded-[22px] border border-[#E6E7E8]/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,245,253,0.9))] p-5 shadow-[0_14px_36px_rgba(67,47,131,0.04)] md:p-6 lg:sticky lg:top-24">
        <span className="inline-flex items-center rounded-full border border-[#432F83]/20 bg-[#432F83]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#432F83]">
          Help desk
        </span>
        <div className="relative inline-block pb-2 mt-3 mb-4 font-sans">
          <h2 className="font-sans text-[24px] font-black leading-[1.1] tracking-tight text-[#333333] md:text-[30px]">
            {heading || "FAQ's"}
          </h2>
          <span className="absolute bottom-0 left-0 h-[3px] w-[35px] rounded-full bg-[#5A31DD]" />
        </div>
        <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-[#575757] md:text-[13px] font-semibold">
          Quick answers for common shopping, delivery, return, and payment questions.
        </p>
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-[#E6E7E8]/80 bg-white/90 px-3.5 py-3 shadow-xs">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#432F83] text-sm font-black text-white">
            {faqs.length}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-black leading-4 text-[#333333]">Most asked answers</p>
            <p className="mt-0.5 text-[10.5px] leading-4 text-[#7D7E7F] font-semibold">Tap a question, get the answer fast.</p>
          </div>
        </div>
      </div>

      {/* Right Column - Accordion Items */}
      <div className="divide-y divide-[#E6E7E8] rounded-xl border border-[#E6E7E8] bg-white overflow-hidden shadow-xs">
        {faqs.map((faq, idx) => {
          const isOpen = faqOpen === idx;
          return (
            <div key={idx} className="bg-white">
              <button
                type="button"
                onClick={() => setFaqOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-[#333333] hover:bg-[#F9FAFC] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4.5 w-4.5 text-[#909090] transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-[#432F83]" : ""
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen ? "max-h-40 border-t border-[#E6E7E8] bg-[#F9FAFC]" : "max-h-0"
                }`}
              >
                <p className="px-5 py-4 text-xs font-semibold leading-relaxed text-[#575757] whitespace-pre-line">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
