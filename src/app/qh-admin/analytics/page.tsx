import { BarChart3, TrendingUp, Eye, ShoppingBag } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold text-[#202223]">Analytics</h2>
        <p className="mt-0.5 text-[13px] text-[#6d7175]">Track your store performance</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total sessions", value: "—", icon: Eye, color: "#5c6ac4" },
          { label: "Total orders", value: "—", icon: ShoppingBag, color: "#008060" },
          { label: "Conversion rate", value: "—", icon: TrendingUp, color: "#b98900" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[#e1e3e5] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}12`, color: stat.color }}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#202223]">{stat.value}</p>
                <p className="text-[13px] text-[#6d7175]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-[#e1e3e5] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-10 w-10 text-[#c9cccf]" />
          <p className="mt-3 text-[14px] font-medium text-[#6d7175]">Analytics will appear once you have store traffic</p>
          <p className="mt-1 text-[13px] text-[#8c9196]">Visit your store to start generating data</p>
        </div>
      </div>
    </div>
  );
}
