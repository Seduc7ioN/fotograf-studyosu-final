import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  AtSign,
  Camera,
  ChevronRight,
  Film,
  LockKeyhole,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import BookingRequestForm from "@/components/site/BookingRequestForm";
import CinematicIntro from "@/components/site/CinematicIntro";
import SiteShowcaseGallery from "@/components/site/SiteShowcaseGallery";
import { studioBrand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${studioBrand.name} | Düğün Fotoğrafı ve Sinematik Film`,
  description:
    "Lume Art Wedding ile düğün hikayenizi zamansız fotoğraflar ve sinematik filmlerle yeniden yaşayın.",
};

const services = [
  {
    icon: Camera,
    title: "Düğün Hikayesi",
    text: "Hazırlıktan kutlamanın son anına kadar, doğal ve editoryal bir fotoğraf anlatısı.",
  },
  {
    icon: Film,
    title: "Sinematik Film",
    text: "Günün sesleri, hareketi ve müziğiyle kurgulanan zamansız bir düğün filmi.",
  },
  {
    icon: Sparkles,
    title: "Özel Çekimler",
    text: "Save the date, dış çekim ve çiftin hikayesine göre tasarlanan yaratıcı prodüksiyonlar.",
  },
];

const process = [
  ["Tanışma", "Hikayenizi ve günün ritmini birlikte planlarız."],
  ["Çekim", "Doğal anları yönlendirmeden, ışığı takip ederek kaydederiz."],
  ["Kurgu", "Fotoğraf seçimi, renk ve film kurgusunu Lume Art diliyle tamamlarız."],
  ["Teslim", "Özel müşteri galerinizden hikayenize güvenle ulaşırsınız."],
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#100a07] text-[#f7f0e8]">
      <CinematicIntro />

      <section className="lume-hero relative flex min-h-screen flex-col">
        <div className="cinematic-grain pointer-events-none absolute inset-0 opacity-25" />
        <header className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10 lg:px-16">
          <Link href="/" aria-label={studioBrand.name}>
            <Image
              src="/lumeart-mark.svg"
              alt={studioBrand.name}
              width={180}
              height={110}
              className="h-20 w-auto"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c4b2a3] md:flex">
            <a href="#hikaye" className="transition hover:text-[#ff8a45]">
              Hikayemiz
            </a>
            <a href="#isler" className="transition hover:text-[#ff8a45]">
              İşler
            </a>
            <a href="#iletisim" className="transition hover:text-[#ff8a45]">
              İletişim
            </a>
            <a href="#randevu" className="transition hover:text-[#ff8a45]">
              Randevu
            </a>
          </nav>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border border-[#5d4333] px-4 py-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#d8c7b8] transition hover:border-[#E8611A] hover:text-[#ff8a45]"
          >
            <LockKeyhole size={13} />
            Yönetim
          </Link>
        </header>

        <div className="relative z-10 flex flex-1 items-center px-5 pb-24 pt-10 md:px-10 lg:px-16">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.58em] text-[#E8611A]">
                Wedding photography & cinematic film
              </p>
              <h1 className="max-w-4xl font-display text-[clamp(4.4rem,11vw,10.5rem)] font-medium leading-[0.72] tracking-[-0.05em] text-[#f7f0e8]">
                Işığın
                <span className="block pl-[12%] text-[#E8611A]">ardında</span>
                <span className="block">bir hikaye.</span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <div className="relative overflow-hidden rounded-[2rem] border border-[#5d4333]/70 bg-[#211813]/70 p-7 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#E8611A]/20 blur-3xl" />
                <p className="font-display text-3xl leading-tight text-[#f7f0e8]">
                  Bir gün değil,
                  <br />
                  bir ömür hatırlansın.
                </p>
                <p className="mt-5 max-w-sm text-sm leading-7 text-[#b9a99b]">
                  Düğün gününüzü yalnızca kaydetmiyoruz. Onu ışık, hareket ve
                  müzikle yeniden hissedebileceğiniz bir filme dönüştürüyoruz.
                </p>
                <a
                  href="#randevu"
                  className="mt-8 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#ff8a45]"
                >
                  Çekim Talebi Oluştur
                  <ArrowDown size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="isler" className="border-y border-[#39281e] bg-[#17100b] py-20">
        <div className="mb-12 flex flex-col justify-between gap-5 px-5 md:flex-row md:items-end md:px-10 lg:px-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#E8611A]">
              Seçilmiş hikayeler
            </p>
            <h2 className="mt-4 font-display text-5xl md:text-7xl">Işıkla yazılan işler</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#9f8978]">
            Bu alan yönetim panelinden seçilecek gerçek düğün görselleriyle
            beslenmeye hazır bir vitrin olarak tasarlandı.
          </p>
        </div>

        <SiteShowcaseGallery />
      </section>

      <section id="hikaye" className="bg-[#100a07] px-5 py-28 md:px-10 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#E8611A]">
                Lume Art yaklaşımı
              </p>
              <h2 className="mt-5 font-display text-6xl leading-[0.95] md:text-8xl">
                Duyguyu
                <span className="block text-[#E8611A]">yönetmeden</span>
                yakalarız.
              </h2>
              <p className="mt-8 max-w-md text-sm leading-8 text-[#9f8978]">
                Her çiftin ritmi farklıdır. Biz o ritmi dinler, doğru ışığı
                bekler ve günün size ait kalmasına izin veririz.
              </p>
            </div>
            <div className="grid gap-5">
              {services.map((service, index) => (
                <article
                  key={service.title}
                  className="group grid gap-7 rounded-[2rem] border border-[#39281e] bg-[#17100b] p-7 transition hover:border-[#E8611A]/60 md:grid-cols-[auto_1fr_auto] md:items-center md:p-9"
                >
                  <span className="font-display text-5xl text-[#5d4333]">
                    0{index + 1}
                  </span>
                  <div>
                    <service.icon size={20} className="mb-4 text-[#E8611A]" />
                    <h3 className="font-display text-4xl">{service.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#9f8978]">
                      {service.text}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={24}
                    className="text-[#5d4333] transition group-hover:text-[#E8611A]"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#39281e] bg-[#1b120d] px-5 py-24 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.5em] text-[#E8611A]">
            Nasıl çalışıyoruz?
          </p>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-[#39281e] bg-[#39281e] md:grid-cols-2 lg:grid-cols-4">
            {process.map(([title, text], index) => (
              <article key={title} className="min-h-72 bg-[#17100b] p-7">
                <span className="text-[10px] font-bold tracking-[0.32em] text-[#E8611A]">
                  0{index + 1}
                </span>
                <h3 className="mt-16 font-display text-4xl">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#9f8978]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="randevu" className="relative overflow-hidden bg-[#100a07] px-5 py-28 md:px-10 lg:px-16 lg:py-36">
        <div className="cinematic-grain pointer-events-none absolute inset-0 opacity-20" />
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#E8611A]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#E8611A]">
              Randevu ve teklif
            </p>
            <h2 className="mt-5 font-display text-6xl leading-[0.9] md:text-8xl">
              Tarihiniz
              <span className="block text-[#E8611A]">uygunsa</span>
              hikayenizi planlayalım.
            </h2>
            <p className="mt-8 max-w-lg text-sm leading-8 text-[#9f8978]">
              Düğün, nişan, dış çekim veya özel prodüksiyon için talep formunu
              doldurun. Yönetim panelimize düşen başvuruyu inceleyip size uygun
              paket ve tarih bilgisiyle dönüş yaparız.
            </p>
          </div>
          <BookingRequestForm />
        </div>
      </section>

      <section id="iletisim" className="relative overflow-hidden bg-[#E8611A] px-5 py-28 text-[#170f0a] md:px-10 lg:px-16 lg:py-36">
        <div className="absolute -right-20 -top-44 font-display text-[32rem] leading-none text-[#170f0a]/5">
          LA
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em]">
              Hikayenizi konuşalım
            </p>
            <h2 className="mt-5 max-w-4xl font-display text-6xl leading-[0.9] md:text-8xl lg:text-9xl">
              Filminizin ilk sahnesi burada başlasın.
            </h2>
          </div>
          <div className="space-y-4">
            <a
              href={studioBrand.phoneHref}
              className="flex items-center justify-between rounded-full border border-[#170f0a]/30 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] transition hover:bg-[#170f0a] hover:text-[#f7f0e8]"
            >
              <span className="flex items-center gap-3">
                <Phone size={17} />
                {studioBrand.phone}
              </span>
              <ChevronRight size={17} />
            </a>
            <a
              href={studioBrand.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-full border border-[#170f0a]/30 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] transition hover:bg-[#170f0a] hover:text-[#f7f0e8]"
            >
              <span className="flex items-center gap-3">
                <AtSign size={17} />
                @{studioBrand.instagramHandle}
              </span>
              <ChevronRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#100a07] px-5 py-10 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-[#39281e] pt-10 md:flex-row md:items-center md:justify-between">
          <Image
            src="/lumeart-mark.svg"
            alt={studioBrand.name}
            width={160}
            height={98}
            className="h-20 w-auto"
          />
          <div className="flex flex-wrap items-center gap-6 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8d7462]">
            <span className="flex items-center gap-2">
              <MapPin size={13} />
              Türkiye
            </span>
            <span>© 2026 {studioBrand.name}</span>
            <Link href="/login" className="flex items-center gap-2 transition hover:text-[#ff8a45]">
              <LockKeyhole size={13} />
              Yönetim Paneli
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
