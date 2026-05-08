import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold text-[#202223]">Customers</h2>
        <p className="mt-0.5 text-[13px] text-[#6d7175]">Manage your customer accounts</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#e1e3e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f6f8]">
            <Users className="h-8 w-8 text-[#8c9196]" />
          </div>
          <h3 className="mt-4 text-[16px] font-semibold text-[#202223]">Customer accounts</h3>
          <p className="mt-1.5 max-w-xs text-center text-[13px] text-[#6d7175]">
            Phone-login customers from PostgreSQL will appear here once users start registering.
          </p>
          <a
            href="/qh-admin"
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52]"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
