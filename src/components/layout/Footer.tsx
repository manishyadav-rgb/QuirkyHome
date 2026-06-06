import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck, ArrowRight } from "lucide-react";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-slate-600 transition-colors duration-200 hover:text-brand-primary">
        {children}
      </Link>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-800">
      <div className="qh-container py-12">
        {/* Top Section: Brand & Link Directories */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 pb-10">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="qh-logo inline-block self-start" aria-label="QuirkyHome">
              <img
                src="https://res.cloudinary.com/dd4hmahlm/image/upload/v1774697521/rw9xm5nnegmsigzcke5q.png"
                alt="QuirkyHome Logo"
                className="h-14 w-auto object-contain mix-blend-multiply"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-600 max-w-sm">
              Warm, premium, playful decor for Indian homes that refuse to be boring.
            </p>
            
            {/* Interactive Contact Anchors */}
            <div className="space-y-3 text-sm text-slate-600 border-l border-slate-200 pl-4">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <a 
                  href="https://maps.google.com/?q=Plot+No.+263,+Sector+25+Part+2,+HUDA,+Panipat,+Haryana+-+132103" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-brand-primary transition-colors leading-relaxed"
                >
                  Plot No. 263, Sector 25 Part 2, HUDA, Panipat, Haryana - 132103
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <a href="tel:+917678099909" className="hover:text-brand-primary transition-colors font-medium">
                  +91 7678099909
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <a href="mailto:support@quirkyhome.in" className="hover:text-brand-primary transition-colors font-medium">
                  support@quirkyhome.in
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { label: "Instagram", path: "M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm8.5 1.8h-8.5A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2a3.2 3.2 0 0 0 0-6.4Zm5.3-.95a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" },
                { label: "Pinterest", path: "M12 2a10 10 0 0 0-3.64 19.32c-.05-.82-.1-2.08.02-2.98l1.26-5.37s-.32-.64-.32-1.58c0-1.48.86-2.58 1.93-2.58.9 0 1.34.68 1.34 1.49 0 .9-.58 2.25-.88 3.5-.25 1.04.52 1.88 1.54 1.88 1.84 0 3.25-1.94 3.25-4.75 0-2.48-1.78-4.22-4.33-4.22-2.95 0-4.68 2.21-4.68 4.5 0 .9.35 1.86.78 2.38a.31.31 0 0 1 .07.3l-.3 1.22c-.05.2-.16.24-.36.15-1.35-.63-2.2-2.6-2.2-4.18 0-3.4 2.47-6.52 7.12-6.52 3.73 0 6.63 2.66 6.63 6.22 0 3.71-2.34 6.7-5.58 6.7-1.09 0-2.12-.57-2.47-1.24l-.67 2.56c-.24.93-.9 2.1-1.34 2.82A10 10 0 1 0 12 2Z" },
                { label: "YouTube", path: "M23 12s0-3.1-.4-4.6a3.2 3.2 0 0 0-2.2-2.2C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.4.4a3.2 3.2 0 0 0-2.2 2.2C1 8.9 1 12 1 12s0 3.1.4 4.6a3.2 3.2 0 0 0 2.2 2.2c1.5.4 8.4.4 8.4.4s6.9 0 8.4-.4a3.2 3.2 0 0 0 2.2-2.2C23 15.1 23 12 23 12ZM10 15.5v-7l6 3.5-6 3.5Z" },
                { label: "Facebook", path: "M22 12a10 10 0 1 0-11.56 9.88V14.9H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.9h-2.33v6.98A10 10 0 0 0 22 12Z" },
                { label: "LinkedIn", path: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.03-1.84-3.03-1.85 0-2.14 1.45-2.14 2.95v5.65H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.84 3.37-1.84 3.6 0 4.26 2.37 4.26 5.46v6.27ZM5.33 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.11 20.45H3.55V9h3.56v11.45Z" }
              ].map((social) => (
                <Link 
                  key={social.label} 
                  href="#" 
                  aria-label={social.label} 
                  className="qh-focus inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-brand-primary hover:text-brand-primary hover:bg-slate-100 bg-white transition-colors duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d={social.path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Column 2: Bedroom Decor */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Bedroom
            </h3>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/bedding">All Bedding</FooterLink>
              <FooterLink href="/search?q=Bedsheet">Bedsheets</FooterLink>
              <FooterLink href="/search?q=Comforter">{"Comforters & AC Quilts"}</FooterLink>
              <FooterLink href="/search?q=Dohar">{"Dohars, Razai & Blankets"}</FooterLink>
              <FooterLink href="/search?q=Duvet">Duvet Covers</FooterLink>
              <FooterLink href="/search?q=Bedcover">Bedcovers</FooterLink>
              <FooterLink href="/search?q=Pillow">{"Pillow & Bolster Covers"}</FooterLink>
              <FooterLink href="/search?q=Protector">Mattress Protectors</FooterLink>
              <FooterLink href="/search?q=Bedding%20Set">Bedding Set</FooterLink>
            </ul>
          </div>
          
          {/* Column 3: Living Room Decor */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Living Room
            </h3>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/search?q=Cushion%20Filler">Cushion Fillers</FooterLink>
              <FooterLink href="/search?q=Floor%20Cushion">Floor Cushions</FooterLink>
              <FooterLink href="/search?q=Curtain">Curtains</FooterLink>
              <FooterLink href="/search?q=Throw">Throws</FooterLink>
              <FooterLink href="/search?q=Diwan">Diwan Sets</FooterLink>
              <FooterLink href="/search?q=Rugs">{"Rugs & Carpets"}</FooterLink>
              <FooterLink href="/search?q=Sofa%20Cover">{"Sofa & Chair Covers"}</FooterLink>
              <FooterLink href="/search?q=Carpet">Living Room Carpets</FooterLink>
            </ul>
          </div>
          
          {/* Column 4: Bath Accessories */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Bath Essentials
            </h3>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/bath">All Bath Essentials</FooterLink>
              <FooterLink href="/search?q=Bath%20Linens">Bath Linens</FooterLink>
              <FooterLink href="/search?q=Bath%20Mat">Bath Mats</FooterLink>
              <FooterLink href="/search?q=Bath%20Towel">Bath Towels</FooterLink>
              <FooterLink href="/search?q=Bathroom%20Set">Bathroom Accessories</FooterLink>
              <FooterLink href="/search?q=Soap%20Dispenser">{"Soap Dish & Dispensers"}</FooterLink>
            </ul>
          </div>
          
          {/* Column 5: Gifts */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Gifts Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/search?q=Gifts">Gifts By Special Days</FooterLink>
              <FooterLink href="/search?q=Gifts%20Occasion">Gifts By Occasion</FooterLink>
              <FooterLink href="/search?q=Gift%20Women">Gifts For Women</FooterLink>
              <FooterLink href="/search?q=Gift%20Men">Gifts For Men</FooterLink>
              <FooterLink href="/search?q=Gifts%20Festival">Gifts By Festivals</FooterLink>
              <FooterLink href="/search?q=Gifts%20Budget">Gifts By Budget</FooterLink>
              <FooterLink href="/gifts">All Gifts</FooterLink>
            </ul>
          </div>
          
        </div>

        {/* Middle Section: Unified Editorial Newsletter Banner */}
        <div className="border-t border-slate-200 pt-8 pb-8">
          <div className="rounded-2xl bg-slate-100 border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-sm md:text-base font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-5 w-5 text-brand-primary" />
                <span>Stay Cozy, Get Quirky!</span>
              </h4>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Subscribe to our newsletter for weekly styling tips, product releases, and exclusive member-only discounts.
              </p>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch gap-2 max-w-md shrink-0">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-lg bg-white border border-slate-300 px-4 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="group/btn rounded-lg bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2 text-xs md:text-sm font-bold transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <span>Subscribe</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section: Copyright, Quick Links & Payment Methods */}
        <div className="border-t border-slate-200 pt-6 flex flex-col items-center justify-between gap-4 lg:flex-row text-xs md:text-sm">
          <p className="text-slate-500 text-center lg:text-left font-medium">
            {"©"} 2026 QuirkyHome. All rights reserved.
          </p>
          
          {/* Quick links at the bottom */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px] md:text-xs">
            <Link href="/about-us" className="hover:text-brand-primary transition-colors">About Us</Link>
            <Link href="/shipping" className="hover:text-brand-primary transition-colors">Shipping Policy</Link>
            <Link href="/returns" className="hover:text-brand-primary transition-colors">{"Returns & Exchanges"}</Link>
            <Link href="/track-order" className="hover:text-brand-primary transition-colors">Track Order</Link>
          </div>
          
          {/* Secured Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-450 mr-1 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Secure Payments</span>
            </span>
            
            {/* UPI Badge */}
            <div className="flex h-7 w-12 items-center justify-center rounded bg-white border border-slate-200 hover:border-brand-primary transition-colors cursor-pointer" title="UPI">
              <img src="/uploads/upi.png" alt="UPI" className="max-h-[16px] max-w-[40px] object-contain" />
            </div>
            
            {/* RuPay Badge */}
            <div className="flex h-7 w-12 items-center justify-center rounded bg-white border border-slate-200 hover:border-brand-primary transition-colors cursor-pointer" title="RuPay">
              <img src="/uploads/rupay.png" alt="RuPay" className="max-h-[14px] max-w-[40px] object-contain" />
            </div>
            
            {/* Visa Badge */}
            <div className="flex h-7 w-12 items-center justify-center rounded bg-white border border-slate-200 hover:border-brand-primary transition-colors cursor-pointer" title="Visa">
              <img src="/uploads/visa.png" alt="Visa" className="max-h-[14px] max-w-[40px] object-contain" />
            </div>
            
            {/* Mastercard Badge */}
            <div className="flex h-7 w-12 items-center justify-center rounded bg-white border border-slate-200 hover:border-brand-primary transition-colors cursor-pointer" title="Mastercard">
              <img src="/uploads/mastercard.png" alt="Mastercard" className="max-h-[18px] max-w-[40px] object-contain" />
            </div>
            
            {/* COD Badge */}
            <div className="flex h-7 w-12 items-center justify-center rounded bg-white border border-slate-200 hover:border-brand-primary transition-colors cursor-pointer" title="Cash on Delivery">
              <img src="/uploads/cod.png" alt="COD" className="max-h-[18px] max-w-[40px] object-contain" />
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
