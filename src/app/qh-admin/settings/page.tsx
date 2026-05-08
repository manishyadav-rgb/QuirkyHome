import { Settings, Store, CreditCard, Truck, Globe, Shield, Bell } from "lucide-react";

const sections = [
  { icon: Store, label: "Store details", desc: "Store name, contact, address" },
  { icon: CreditCard, label: "Payments", desc: "Payment providers and methods" },
  { icon: Truck, label: "Shipping", desc: "Shipping rates and zones" },
  { icon: Globe, label: "Domains", desc: "Custom domains and URLs" },
  { icon: Shield, label: "Policies", desc: "Return, privacy, terms policies" },
  { icon: Bell, label: "Notifications", desc: "Email and SMS notifications" },
];

export default function SettingsPage() {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold text-[#202223]">Settings</h2>
        <p className="mt-0.5 text-[13px] text-[#6d7175]">Manage your store preferences</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <div key={s.label} className="group cursor-pointer rounded-lg border border-[#e1e3e5] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-[#008060] hover:shadow-[0_1px_3px_rgba(63,63,68,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f6f8] text-[#6d7175] group-hover:bg-[#e3f1df] group-hover:text-[#008060]">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[#202223]">{s.label}</p>
                <p className="text-[12px] text-[#6d7175]">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
