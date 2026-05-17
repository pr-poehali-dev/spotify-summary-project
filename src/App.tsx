import { useState, useEffect, useRef, useCallback } from "react";

const TRACKS = {
  intro: "https://files.catbox.moe/ra0xhn.mp3",
  slide2: "https://files.catbox.moe/hgsy8q.mp3",
  slide3: "https://files.catbox.moe/mva19x.mp3",
  slide4: "https://files.catbox.moe/m3vya8.mp3",
  slide5: "https://files.catbox.moe/taqsn0.mp3",
};

const PARTY_DATE = new Date("2026-06-27T17:30:00");

function useCountdown() {
  const calc = () => {
    const diff = PARTY_DATE.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function NeonParticles() {
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 5.7 + 3) % 100}%`,
      height: `${40 + (i * 13) % 80}px`,
      duration: `${4 + (i * 0.7) % 8}s`,
      delay: `${(i * 0.4) % 6}s`,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.current.map((p) => (
        <div
          key={p.id}
          className="absolute w-px bg-gradient-to-t from-transparent via-[#1fdf64] to-transparent opacity-0"
          style={{ left: p.left, height: p.height, bottom: "-100px", animation: `float-particle ${p.duration} linear ${p.delay} infinite` }}
        />
      ))}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1fdf64] to-transparent opacity-10" style={{ animation: "scan-line 8s linear infinite" }} />
      <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-[#1fdf64] to-transparent opacity-60" />
      <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-[#1fdf64] to-transparent opacity-60" />
      <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-[#1fdf64] to-transparent opacity-60" />
      <div className="absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-[#1fdf64] to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-16 h-px bg-gradient-to-r from-[#1fdf64] to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-px h-16 bg-gradient-to-t from-[#1fdf64] to-transparent opacity-60" />
      <div className="absolute bottom-0 right-0 w-16 h-px bg-gradient-to-l from-[#1fdf64] to-transparent opacity-60" />
      <div className="absolute bottom-0 right-0 w-px h-16 bg-gradient-to-t from-[#1fdf64] to-transparent opacity-60" />
    </div>
  );
}

function MusicBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5].map((speed, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-[#1fdf64]"
          style={{
            height: playing ? `${4 + i * 3}px` : "4px",
            animation: playing ? `bar-dance ${0.4 + speed * 0.3}s ease-in-out ${i * 0.1}s infinite` : "none",
            boxShadow: playing ? "0 0 4px #1fdf64" : "none",
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function Slide({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-start px-5 overflow-y-auto"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
        pointerEvents: visible ? "auto" : "none",
        zIndex: visible ? 10 : 0,
      }}
    >
      <div className="w-full max-w-[390px] mx-auto flex flex-col items-center min-h-full justify-center py-16">
        {children}
      </div>
    </div>
  );
}

function CountdownBlock() {
  const { days, hours, minutes, seconds } = useCountdown();
  const units = [
    { val: days, label: "дней" },
    { val: hours, label: "часов" },
    { val: minutes, label: "минут" },
    { val: seconds, label: "секунд" },
  ];
  return (
    <div className="w-full">
      <p className="text-white/40 text-xs uppercase tracking-widest text-center mb-3">до праздника</p>
      <div className="grid grid-cols-4 gap-2 w-full">
        {units.map(({ val, label }) => (
          <div
            key={label}
            className="flex flex-col items-center py-3 rounded-xl"
            style={{ background: "rgba(31,223,100,0.05)", border: "1px solid rgba(31,223,100,0.2)" }}
          >
            <span
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: "#1fdf64", textShadow: "0 0 12px rgba(31,223,100,0.5)" }}
            >
              {String(val).padStart(2, "0")}
            </span>
            <span className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [slide, setSlide] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = useCallback((src: string) => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = src;
    audioRef.current.volume = 0.75;
    audioRef.current.loop = true;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  const stopTrack = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => { audioRef.current?.pause(); };
  }, []);

  const handleStart = () => {
    setMusicStarted(true);
    playTrack(TRACKS.intro);
  };

  const goToSlide = (n: number, track?: string) => {
    if (track) playTrack(track);
    else stopTrack();
    setSlide(n);
  };

  return (
    <div
      className="relative bg-black overflow-hidden select-none"
      style={{ width: "100vw", height: "100dvh" }}
    >
      <NeonParticles />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
        <span
          className="font-display text-xl font-bold tracking-[0.3em] uppercase neon-flicker"
          style={{ color: "#1fdf64", textShadow: "0 0 10px rgba(31,223,100,0.6), 0 0 30px rgba(31,223,100,0.3)" }}
        >
          spotIRA
        </span>
        <MusicBars playing={isPlaying} />
      </div>

      {/* ─── Slide 1 ─── */}
      <Slide visible={slide === 0}>
        <div className="flex flex-col items-center text-center gap-5 w-full">
          <div className="animate-fade-in-up animate-delay-1 font-display text-xs tracking-[0.5em] uppercase" style={{ color: "#1fdf64" }}>
            2026 год
          </div>

          <div className="animate-fade-in-up animate-delay-2">
            <div className="font-display text-[clamp(2.5rem,12vw,3.5rem)] font-black tracking-tight leading-none">не просто</div>
            <div className="font-display text-[clamp(2.5rem,12vw,3.5rem)] font-black tracking-tight leading-none">музыкальные</div>
            <div
              className="font-display text-[clamp(2.5rem,12vw,3.5rem)] font-black tracking-tight leading-none neon-flicker"
              style={{ color: "#1fdf64" }}
            >
              итоги
            </div>
          </div>

          <p className="animate-fade-in-up animate-delay-3 text-sm text-white/60 leading-relaxed max-w-[260px]">
            а приглашение отметить мои 30
          </p>

          <div
            className="animate-fade-in-up animate-delay-4 w-full py-3 px-5 rounded-xl text-left"
            style={{ background: "rgba(31,223,100,0.06)", border: "1px solid rgba(31,223,100,0.2)" }}
          >
            <span className="text-white/40 text-xs uppercase tracking-widest block mb-1">Для кого</span>
            <span className="text-white font-semibold text-lg">Привет, Илья — это для тебя</span>
          </div>

          <div className="animate-fade-in-up animate-delay-5 w-full">
            {!musicStarted ? (
              <button onClick={handleStart} className="neon-btn w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase">
                ▶ Нажми сюда
              </button>
            ) : (
              <button
                onClick={() => goToSlide(1, TRACKS.slide2)}
                className="neon-btn-solid w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase"
              >
                Смотреть итоги →
              </button>
            )}
          </div>

          {musicStarted && (
            <p className="animate-fade-in-up text-xs tracking-widest" style={{ color: "#1fdf64", animation: "pulse-neon 2s infinite" }}>
              ♪ музыка включена
            </p>
          )}
        </div>
      </Slide>

      {/* ─── Slide 2 ─── */}
      <Slide visible={slide === 1}>
        <div className="flex flex-col items-center text-center gap-5 w-full">
          <div className="animate-fade-in-up animate-delay-1 font-display text-xs tracking-[0.5em] uppercase" style={{ color: "#1fdf64" }}>
            трек года
          </div>

          <div
            className="animate-fade-in-up animate-delay-2 relative rounded-full flex items-center justify-center shrink-0"
            style={{
              width: "clamp(120px, 35vw, 160px)",
              height: "clamp(120px, 35vw, 160px)",
              background: "radial-gradient(circle at 35% 35%, #2a2a2a, #0a0a0a)",
              border: "3px solid rgba(31,223,100,0.3)",
              boxShadow: "0 0 30px rgba(31,223,100,0.2), inset 0 0 20px rgba(0,0,0,0.5)",
              animation: isPlaying ? "spin 4s linear infinite" : "none",
            }}
          >
            <div className="w-10 h-10 rounded-full z-10" style={{ background: "radial-gradient(circle, #1fdf64 20%, #0a0a0a 21%)", boxShadow: "0 0 10px rgba(31,223,100,0.5)" }} />
            {[50, 42, 34].map((size) => (
              <div key={size} className="absolute rounded-full" style={{ width: `${size}%`, height: `${size}%`, border: "1px solid rgba(255,255,255,0.05)" }} />
            ))}
          </div>

          <div className="animate-fade-in-up animate-delay-3">
            <div className="font-display text-[clamp(1.6rem,8vw,2.2rem)] font-bold leading-tight">Что связывает</div>
            <div className="font-display text-[clamp(1.6rem,8vw,2.2rem)] font-bold leading-tight" style={{ color: "#1fdf64" }}>нас с тобой</div>
          </div>

          <div
            className="animate-fade-in-up animate-delay-4 w-full py-4 px-5 rounded-xl text-left"
            style={{ background: "rgba(31,223,100,0.05)", border: "1px solid rgba(31,223,100,0.15)" }}
          >
            <p className="text-white/70 text-sm leading-relaxed">
              Мы познакомились на вечеринке и продолжаем создавать общие воспоминания вместе. Спасибо, что поддерживаешь наш общий вайб.
            </p>
            <p className="text-white/40 text-xs mt-2 italic">Дальше — больше</p>
          </div>

          <button
            onClick={() => goToSlide(2, TRACKS.slide3)}
            className="animate-fade-in-up animate-delay-5 neon-btn-solid w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase"
          >
            Далее →
          </button>
        </div>
      </Slide>

      {/* ─── Slide 3 ─── */}
      <Slide visible={slide === 2}>
        <div className="flex flex-col items-center text-center gap-5 w-full">
          <div className="animate-fade-in-up animate-delay-1 font-display text-xs tracking-[0.5em] uppercase" style={{ color: "#1fdf64" }}>
            момент года
          </div>

          <div
            className="animate-fade-in-up animate-delay-2 w-full rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(31,223,100,0.1) 0%, rgba(0,0,0,0) 60%)",
              border: "1px solid rgba(31,223,100,0.25)",
              boxShadow: "0 0 40px rgba(31,223,100,0.1)",
            }}
          >
            <div className="p-6">
              <div className="font-display text-[clamp(2rem,10vw,2.8rem)] font-black mb-4 leading-tight">
                Момент<br /><span style={{ color: "#1fdf64" }}>с тобой</span>
              </div>
              <div className="h-px w-full mb-4" style={{ background: "linear-gradient(to right, #1fdf64, transparent)" }} />
              <p className="text-white/70 text-sm leading-relaxed">
                Помнишь, как мы делились секретами на диване у меня дома или как ты молниеносно прошёл квиз по Блэкпинк?
              </p>
            </div>
          </div>

          <div
            className="animate-fade-in-up animate-delay-3 text-center py-3 px-5 rounded-xl w-full"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-white/60 text-sm italic">Спасибо тебе за эти моменты</p>
          </div>

          <button
            onClick={() => goToSlide(3, TRACKS.slide4)}
            className="animate-fade-in-up animate-delay-4 neon-btn-solid w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase"
          >
            Что там дальше?
          </button>
        </div>
      </Slide>

      {/* ─── Slide 4 ─── */}
      <Slide visible={slide === 3}>
        <div className="flex flex-col items-center text-center gap-4 w-full">
          <div className="animate-fade-in-up animate-delay-1 font-display text-xs tracking-[0.5em] uppercase" style={{ color: "#1fdf64" }}>
            твоя статистика
          </div>

          <div className="font-display text-[clamp(1.8rem,8vw,2.4rem)] font-black animate-fade-in-up animate-delay-2">Наши цифры</div>

          <div className="animate-fade-in-up animate-delay-2 w-full space-y-2">
            {[
              { label: "Сколько мы дружим", value: "950", unit: "дней", desc: "", color: "#1fdf64" },
              { label: "Ты был(а) на моём ДР", value: "1-й", unit: "раз", desc: "это будет твой первый раз", color: "#fff" },
              { label: "Как сильно я дорожу тобой", value: "♨", unit: "", desc: "как самая высокая температура приготовленного тобой мяса", color: "#ff6b6b" },
            ].map((stat, i) => (
              <div
                key={i}
                className="w-full py-3 px-4 rounded-xl text-left flex items-center justify-between gap-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  animation: `counter-up 0.5s ease ${0.2 + i * 0.15}s both`,
                }}
              >
                <div className="flex-1">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{stat.label}</p>
                  {stat.desc && <p className="text-white/55 text-xs italic">{stat.desc}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display text-2xl font-black" style={{ color: stat.color, textShadow: stat.color === "#1fdf64" ? "0 0 20px rgba(31,223,100,0.5)" : "none" }}>
                    {stat.value}
                  </span>
                  {stat.unit && <div className="text-white/40 text-[10px]">{stat.unit}</div>}
                </div>
              </div>
            ))}
          </div>

          <p className="animate-fade-in-up animate-delay-3 text-white/50 text-xs leading-relaxed px-2">
            Я хочу разделить с тобой свои 30 лет и переход в новое десятилетие
          </p>

          <button
            onClick={() => goToSlide(4, TRACKS.slide5)}
            className="animate-fade-in-up animate-delay-4 neon-btn-solid w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase"
          >
            Подробности →
          </button>
        </div>
      </Slide>

      {/* ─── Slide 5 ─── */}
      <Slide visible={slide === 4}>
        <div className="flex flex-col items-center text-center gap-4 w-full">
          <div className="animate-fade-in-up animate-delay-1 font-display text-xs tracking-[0.5em] uppercase" style={{ color: "#1fdf64" }}>
            ты приглашён
          </div>

          <div
            className="animate-fade-in-up animate-delay-2 w-full rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(31,223,100,0.08) 0%, rgba(0,0,0,0) 100%)",
              border: "1px solid rgba(31,223,100,0.3)",
              boxShadow: "0 0 60px rgba(31,223,100,0.12)",
            }}
          >
            <div className="font-display text-[clamp(2rem,9vw,2.8rem)] font-black mb-1">Жду тебя</div>
            <div className="font-display text-[clamp(1.3rem,6vw,1.8rem)] font-bold mb-4" style={{ color: "#1fdf64" }}>
              27 июня в 17:30
            </div>
            <div className="h-px w-full mb-3" style={{ background: "linear-gradient(to right, transparent, #1fdf64, transparent)" }} />
            <p className="text-white/70 text-sm leading-relaxed mb-1">Московский проспект 139А</p>
            <p className="text-white/50 text-xs mb-3">м. Электросила · вход с торца через железную калитку</p>
            <div
              className="inline-block py-1 px-3 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{ background: "rgba(31,223,100,0.15)", border: "1px solid rgba(31,223,100,0.4)", color: "#1fdf64" }}
            >
              🎤 Тематика: Eurovision
            </div>
          </div>

          {/* Countdown */}
          <div className="animate-fade-in-up animate-delay-3 w-full">
            <CountdownBlock />
          </div>

          <div
            className="animate-fade-in-up animate-delay-3 w-full rounded-xl p-4 text-left space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Что тебя ждёт?</p>
            {[
              { time: "17:30–18:30", desc: "сбор, лёгкий перекус, первые тосты" },
              { time: "18:30–20:30", desc: "вкусно кушаем, пьём и проходим квиз по Иришке" },
              { time: "20:30–22:00", desc: "слушаем музыку, общаемся" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="font-display text-[10px] font-bold shrink-0 mt-0.5" style={{ color: "#1fdf64" }}>{item.time}</span>
                <span className="text-white/60 text-xs leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>

          <p className="animate-fade-in-up animate-delay-3 text-white/35 text-xs">Мой номер знаешь!</p>

          <div className="animate-fade-in-up animate-delay-4 w-full space-y-3 pb-2">
            <a
              href="https://docs.google.com/document/d/19nD4DwoFk2GaUhR5G1j0_YAmeqTiTXoMtmebOjLU_JA/edit?tab=t.0"
              target="_blank"
              rel="noopener noreferrer"
              className="neon-btn block w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase text-center"
            >
              Нажми, чтобы узнать подробности
            </a>
            <a
              href="https://docs.google.com/spreadsheets/d/1Ku3rdanulnFMoDGRRYnycAnj4sJThtFrm7mCLC-oufE/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="neon-btn-solid block w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase text-center"
            >
              🎁 Wishlist
            </a>
          </div>
        </div>
      </Slide>

      {/* Slide dots */}
      {slide > 0 && (
        <div className="fixed bottom-5 left-0 right-0 flex justify-center gap-2 z-50">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? "20px" : "6px",
                height: "6px",
                background: i === slide ? "#1fdf64" : "rgba(255,255,255,0.2)",
                boxShadow: i === slide ? "0 0 8px #1fdf64" : "none",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
