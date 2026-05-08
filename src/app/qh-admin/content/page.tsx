import { FileText } from "lucide-react";

export default function ContentPage() {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold text-[#202223]">Content</h2>
        <p className="mt-0.5 text-[13px] text-[#6d7175]">Manage your store pages and blog posts</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e1e3e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f6f8]">
            <FileText className="h-8 w-8 text-[#8c9196]" />
          </div>
          <h3 className="mt-4 text-[16px] font-semibold text-[#202223]">Create pages and blog posts</h3>
          <p className="mt-1.5 max-w-xs text-center text-[13px] text-[#6d7175]">
            Add pages like About Us, Contact, FAQs and manage blog content.
          </p>
        </div>
      </div>
    </div>
  );
}
