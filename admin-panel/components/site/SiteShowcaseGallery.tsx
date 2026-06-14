"use client";

import Image from "next/image";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { SiteShowcaseItem } from "@/lib/types";

const fallbackItems = [
  {
    id: "fallback-1",
    title: "Hazırlık",
    caption: "Günün ilk ışığı, ilk heyecan",
    gradient:
      "radial-gradient(circle at 68% 24%, rgba(255,175,110,.5), transparent 25%), linear-gradient(145deg, #5c2d16, #1c120d 68%)",
  },
  {
    id: "fallback-2",
    title: "Hikaye",
    caption: "Her bakışın kendine ait bir ritmi var",
    gradient:
      "radial-gradient(circle at 30% 36%, rgba(255,213,172,.32), transparent 26%), linear-gradient(145deg, #30221b, #0f0b09 70%)",
  },
  {
    id: "fallback-3",
    title: "Işık",
    caption: "Gün batımıyla yazılan portreler",
    gradient:
      "radial-gradient(circle at 60% 18%, rgba(232,97,26,.65), transparent 30%), linear-gradient(155deg, #8a3d18, #17100b 72%)",
  },
  {
    id: "fallback-4",
    title: "Kutlama",
    caption: "Hareketin ve neşenin içinde",
    gradient:
      "radial-gradient(circle at 35% 68%, rgba(255,148,73,.4), transparent 25%), linear-gradient(140deg, #3b2014, #110b08 70%)",
  },
  {
    id: "fallback-5",
    title: "Film",
    caption: "Yıllar sonra aynı duyguyla",
    gradient:
      "radial-gradient(circle at 70% 52%, rgba(247,240,232,.18), transparent 24%), linear-gradient(145deg, #241b17, #090706 72%)",
  },
];

export default function SiteShowcaseGallery() {
  const [items, setItems] = useState<SiteShowcaseItem[]>([]);

  useEffect(() => {
    const showcaseQuery = query(
      collection(db, "site_showcase"),
      where("published", "==", true),
      orderBy("order", "asc")
    );

    return onSnapshot(
      showcaseQuery,
      (snapshot) => {
        setItems(
          snapshot.docs.map(
            (item) => ({ id: item.id, ...item.data() } as SiteShowcaseItem)
          )
        );
      },
      (error) => {
        console.error("Public showcase could not be loaded:", error);
        setItems([]);
      }
    );
  }, []);

  const visibleItems =
    items.length > 0
      ? items.map((item) => ({ ...item, gradient: undefined }))
      : fallbackItems;
  const loopItems = [...visibleItems, ...visibleItems];

  return (
    <div className="lume-gallery-mask">
      <div className="lume-gallery-track">
        {loopItems.map((item, index) => (
          <article
            key={`${item.id}-${index}`}
            className="lume-gallery-card group relative h-[31rem] w-[19rem] shrink-0 overflow-hidden rounded-[1.8rem] border border-[#5d4333]/60 md:h-[38rem] md:w-[25rem]"
            style={"gradient" in item && item.gradient ? { backgroundImage: item.gradient } : undefined}
          >
            {"imageUrl" in item && item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 19rem, 25rem"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            )}
            <div className="cinematic-grain absolute inset-0 opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0705] via-transparent to-transparent" />
            <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 font-display text-lg">
              {String((index % visibleItems.length) + 1).padStart(2, "0")}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-[#ff8a45]">
                {item.caption}
              </p>
              <h3 className="mt-3 font-display text-5xl">{item.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
