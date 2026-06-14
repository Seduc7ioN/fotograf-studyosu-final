"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useActiveSiteMusic } from "@/hooks/useSiteMusic";

const notes = [196, 246.94, 293.66, 369.99, 293.66, 246.94];

export default function CinematicIntro() {
  const activeMusic = useActiveSiteMusic();
  const [introVisible, setIntroVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    setPlaying(false);
  };

  const playNote = (context: AudioContext, frequency: number) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.035, context.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.3);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 1.35);
  };

  const startBeatAnimation = () => {
    let index = 0;
    setBeat(index);
    intervalRef.current = setInterval(() => {
      index = (index + 1) % notes.length;
      setBeat(index);
    }, 900);
  };

  const startUploadedMusic = async () => {
    if (!activeMusic?.audioUrl || !audioRef.current) return false;

    try {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.48;
      await audioRef.current.play();
      startBeatAnimation();
      setPlaying(true);
      return true;
    } catch (err) {
      console.error("Uploaded site music could not be played:", err);
      return false;
    }
  };

  const startAmbient = () => {
    if (playing) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    audioContextRef.current = context;
    let index = 0;
    setBeat(index);
    playNote(context, notes[index]);
    intervalRef.current = setInterval(() => {
      index = (index + 1) % notes.length;
      setBeat(index);
      playNote(context, notes[index]);
    }, 900);
    setPlaying(true);
  };

  const startMusic = async () => {
    if (playing) return;
    const uploadedStarted = await startUploadedMusic();
    if (!uploadedStarted) startAmbient();
  };

  const enterSite = (withSound: boolean) => {
    if (withSound) void startMusic();
    setLeaving(true);
    window.setTimeout(() => setIntroVisible(false), 850);
  };

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) audioRef.current.pause();
      audioContextRef.current?.close().catch(() => undefined);
    },
    []
  );

  return (
    <>
      {activeMusic?.audioUrl && (
        <audio ref={audioRef} src={activeMusic.audioUrl} preload="auto" />
      )}

      {introVisible && (
        <div
          className={`cinematic-intro fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#100a07] px-6 ${
            leaving ? "cinematic-intro-leaving" : ""
          }`}
        >
          <div className="cinematic-grain absolute inset-0 opacity-40" />
          <div className="absolute left-1/2 top-0 h-44 w-px bg-gradient-to-b from-[#E8611A] to-transparent opacity-70" />
          <div className="absolute bottom-0 left-1/2 h-44 w-px bg-gradient-to-t from-[#E8611A] to-transparent opacity-70" />
          <div className="relative max-w-xl text-center">
            <div className="cinematic-logo-reveal">
              <Image
                src="/lumeart-mark.svg"
                alt="Lume Art Wedding"
                width={360}
                height={220}
                priority
                className="mx-auto h-48 w-auto"
              />
            </div>
            <p className="cinematic-copy mt-1 text-[10px] font-semibold uppercase tracking-[0.6em] text-[#b9a99b]">
              Bir düğün filmi deneyimi
            </p>
            <div className="cinematic-copy mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => enterSite(true)}
                className="group flex min-w-64 items-center justify-center gap-3 rounded-full bg-[#E8611A] px-7 py-4 text-xs font-bold uppercase tracking-[0.28em] text-[#170f0a] transition hover:bg-[#ff8140]"
              >
                <Volume2 size={17} />
                Tanıtımı Sesli İzle
              </button>
              <button
                type="button"
                onClick={() => enterSite(false)}
                className="flex min-w-48 items-center justify-center gap-3 rounded-full border border-[#5d4333] px-7 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c7b8] transition hover:border-[#E8611A]"
              >
                <VolumeX size={17} />
                Sessiz Gir
              </button>
            </div>
            <div className="cinematic-copy mt-10 flex items-end justify-center gap-1">
              {notes.map((_, index) => (
                <span
                  key={index}
                  className={`w-0.5 rounded-full bg-[#E8611A] transition-all duration-300 ${
                    beat === index ? "h-8 opacity-100" : "h-3 opacity-35"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!introVisible && (
        <button
          type="button"
          onClick={playing ? stopMusic : startMusic}
          className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-full border border-[#5d4333] bg-[#17100b]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f7f0e8] shadow-xl backdrop-blur transition hover:border-[#E8611A]"
          aria-label={playing ? "Müziği durdur" : "Müziği başlat"}
          title={activeMusic?.title || "Film Müziği"}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8611A] text-[#170f0a]">
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </span>
          <Music2 size={15} className={playing ? "text-[#ff8a45]" : "text-[#8d7462]"} />
          {playing ? "Film Müziği Açık" : "Film Müziği"}
        </button>
      )}
    </>
  );
}
