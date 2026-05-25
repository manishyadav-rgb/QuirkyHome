import Image from "next/image";
import Link from "next/link";
import { collections } from "@/data/collections";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function CollectionSection() {
  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow="Mood-led shopping" title="Collections for every little corner" description="Shop by story when you know the feeling before you know the product." />
      <div className="grid gap-4 rounded-2xl border border-[rgba(212,180,131,0.30)] bg-[rgba(212,180,131,0.10)] p-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {collections.map((collection) => (
          <Link key={collection.slug} href={`/search?q=${encodeURIComponent(collection.title)}`} className="group relative overflow-hidden rounded-2xl border border-[rgba(212,180,131,0.40)] bg-[rgba(255,255,255,0.94)] p-5 text-text-inverse shadow-[0_4px_14px_rgba(212,180,131,0.24)]">
            <Image src={collection.image} alt={collection.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-slow group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(45,36,23,0.72)] via-[rgba(45,36,23,0.35)] to-[rgba(212,180,131,0.18)]" />
            <div className="relative z-base flex h-full flex-col justify-end">
              <h3 className="font-display text-2xl font-semibold">{collection.title}</h3>
              <p className="mt-2 text-sm text-text-inverse">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

