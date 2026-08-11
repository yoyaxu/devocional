"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAppStore, type Reflection } from "@/lib/store";
import bookData from "@/data/reflexiones.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Heart,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  Heart as HeartFilled,
  Share2,
  Bookmark,
  Calendar,
  X,
  Quote,
  Sun,
  Moon,
  PenLine,
  Sparkles,
  ChevronDown,
  ArrowUp,
  Smile,
  BookText,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider, useTheme } from "next-themes";
import { LeafCorner, LeafDivider } from "@/components/LeafDecor";

// Data
const reflections: Reflection[] = bookData.reflexiones;
const prologo1 = bookData.prologo1;
const prologo2 = bookData.prologo2;
const introduccion = bookData.introduccion;

// Get day of year (1-365)
function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.min(Math.floor(diff / 86400000), reflections.length);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// =================== MOOD-BASED RECOMMENDATION ===================
const moodOptions = [
  {
    emoji: "\uD83D\uDE1E",
    label: "Triste",
    keywords: ["triste", "deprimido", "solo", "abatido", "llorando", "angustiado", "dolor", "sufrimiento", "perdida", "muerte", "pena", "desanimado", "melancolía", "vacío", "desesperanza"],
    topics: ["consuelo", "esperanza", "sanidad", "restauración", "Dios te ama", "fortaleza", "refugio"],
  },
  {
    emoji: "\uD83D\uDE21",
    label: "Enojado",
    keywords: ["enojado", "furioso", "molesto", "irritado", "rabia", "resentimiento", "rencor", "odio", "conflicto", "frustración"],
    topics: ["perdón", "paz", "amor", "mansedumbre", "gobernar la ira", "sanidad interior", "reconciliación"],
  },
  {
    emoji: "\uD83D\uDE30",
    label: "Ansioso",
    keywords: ["ansioso", "nervioso", "preocupado", "miedo", "temor", "angustia", "estrés", "inquieto", "pánico", "incertidumbre"],
    topics: ["paz", "confianza", "descanso", "provisión", "fe", "Dios está en control", "no temas"],
  },
  {
    emoji: "\uD83D\uDE0A",
    label: "Agradecido",
    keywords: ["agradecido", "feliz", "contento", "bendecido", "alegre", "gozo", "gratitud", "bien", "maravilloso"],
    topics: ["adoración", "alabanza", "gratitud", "bendición", "gozo", "celebración", "fidelidad de Dios"],
  },
  {
    emoji: "\uD83E\uDD16",
    label: "Confundido",
    keywords: ["confundido", "perdido", "no sé", "dudando", "inseguro", "incertidumbre", "desorientado", "buscando"],
    topics: ["dirección", "sabiduría", "guía", "propósito", "voluntad de Dios", "camino", "discernimiento"],
  },
  {
    emoji: "\uD83D\uDCAA",
    label: "Motivado",
    keywords: ["motivado", "fuerte", "listo", "entusiasmado", "animado", "determinado", "valiente", "esperanzado"],
    topics: ["propósito", "servicio", "obediencia", "fe en acción", "carrera", "perseverancia", "misión"],
  },
];

function getRecommendations(feeling: string): Reflection[] {
  const lower = feeling.toLowerCase();
  const scored = reflections.map((r) => {
    let score = 0;
    const searchText = `${r.title} ${r.quote} ${r.body}`.toLowerCase();
    for (const mood of moodOptions) {
      const moodMatch =
        mood.keywords.some((k) => lower.includes(k)) ||
        mood.label.toLowerCase().includes(lower);
      if (!moodMatch) continue;
      for (const topic of mood.topics) {
        if (searchText.includes(topic.toLowerCase())) score += 3;
      }
      // Broader keyword matching
      for (const kw of mood.keywords) {
        if (searchText.includes(kw.toLowerCase())) score += 1;
      }
    }
    return { reflection: r, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.reflection);
}

// =================== NAV BAR ===================
function NavBar({
  currentView,
  onNavigate,
}: {
  currentView: string;
  onNavigate: (v: "home" | "reader" | "favorites" | "journal" | "progress" | "about" | "mood") => void;
}) {
  const navItems = [
    { id: "home" as const, label: "Hoy", icon: Sun },
    { id: "mood" as const, label: " ánimo", icon: Smile },
    { id: "reader" as const, label: "Leer", icon: BookOpen },
    { id: "favorites" as const, label: "Favoritos", icon: Heart },
    { id: "about" as const, label: "Libro", icon: BookText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span
                className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// =================== HEADER ===================
function AppHeader() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="flex items-center justify-between mb-4">
      <div>
        <h1
          className="text-lg font-bold text-foreground leading-tight"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          365 Reflexiones
        </h1>
        <p className="text-[11px] text-muted-foreground">
          Pastor Nicolás Abreu
        </p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cambiar tema</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  );
}

// =================== DAILY REFLECTION ===================
function DailyReflection({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const dayOfYear = getDayOfYear();
  const reflection = reflections[dayOfYear - 1];
  const { toggleFavorite, isFavorite, markAsRead } = useAppStore();
  const favorite = isFavorite(reflection.number);
  const mounted = useRef(true);
  useEffect(() => { markAsRead(reflection.number); }, [reflection.number, markAsRead]);

  const handleShare = async () => {
    const quote = reflection.quote || reflection.body.slice(0, 140);
    const text = `\u2728 Reflexión del día — ${reflection.title}\n\n\u201C${quote}\u201D\n\n\uD83D\uDCD6 365 Reflexiones — Pastor Nicolás Abreu`;
    try {
      await navigator.clipboard.writeText(text);
      useToast.getState().toast({ title: "\u00A1Copiado!", description: "Listo para compartir" });
    } catch { /* */ }
  };

  if (!mounted) return null;

  return (
    <div className="animate-fade-in-up">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EDF2EB] via-[#F5F3ED] to-[#E8E2D0] p-6 pb-7 mb-4 leaf-pattern">
        <LeafCorner position="top-right" className="w-32 h-32" />
        <LeafCorner position="bottom-left" className="w-24 h-24" />
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#5B7C5A10] to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Reflexión del día
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur rounded-full px-3 py-1">
              <Calendar className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-bold text-primary">
                Día {dayOfYear}
              </span>
            </div>
          </div>

          <h2
            className="text-2xl font-bold leading-tight mb-3 text-foreground"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            {reflection.title}
          </h2>

          {reflection.quote && (
            <div className="reflection-quote mb-4">
              <p className="text-sm leading-relaxed text-foreground/80">
                {reflection.quote}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => toggleFavorite(reflection.number)}
            >
              <HeartFilled className={`h-3.5 w-3.5 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
              {favorite ? "Guardado" : "Guardar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      <LeafDivider className="my-4" />
      {/* Read Full Button */}
      <Button
        className="w-full gap-2"
        onClick={() => onOpenReflection(reflection.number)}
      >
        <BookOpen className="h-4 w-4" />
        Leer reflexión completa
        <ChevronRight className="h-4 w-4 ml-auto" />
      </Button>
    </div>
  );
}

// =================== MOOD RECOMMENDER ===================
function MoodRecommender({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Reflection[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMood = (mood: (typeof moodOptions)[0]) => {
    setSelectedMood(mood.label);
    const recs = getRecommendations(mood.label);
    setResults(recs);
    setInput(mood.label);
  };

  const handleSearch = () => {
    if (!input.trim()) return;
    const recs = getRecommendations(input);
    setResults(recs);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-5">
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          ¿Cómo te sientes hoy?
        </h2>
        <p className="text-sm text-muted-foreground">
          Cuéntanos y te recomendaremos una lectura
        </p>
      </div>

      {/* Mood Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {moodOptions.map((mood) => (
          <button
            key={mood.label}
            onClick={() => handleMood(mood)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
              selectedMood === mood.label
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[11px] font-medium">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Text Input */}
      <div className="flex gap-2 mb-5">
        <Input
          placeholder="O escribe cómo te sientes..."
          className="flex-1 bg-card"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} className="gap-1.5">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Reflexiones recomendadas para ti
          </p>
          <div className="space-y-2">
            {results.map((r) => (
              <Card
                key={r.number}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm group"
                onClick={() => onOpenReflection(r.number)}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{r.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      {r.quote && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {r.quote.slice(0, 80)}...
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {input && results.length === 0 && selectedMood && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No encontramos reflexiones exactas para ese sentimiento.</p>
          <p className="text-xs mt-1">Intenta con otra descripción.</p>
        </div>
      )}
    </div>
  );
}

// =================== READER ===================
function Reader({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 18;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isFavorite, isRead } = useAppStore();

  const filtered = useMemo(() => {
    if (!search.trim()) return reflections;
    const q = search.toLowerCase();
    return reflections.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.quote?.toLowerCase().includes(q) ||
        r.body?.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="animate-fade-in">
      <div className="mb-3">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Las 365 Reflexiones
        </h2>
        <p className="text-xs text-muted-foreground">
          {filtered.length} reflexiones {search && `encontradas para "${search}"`}
        </p>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título o contenido..."
          className="pl-10 bg-card h-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setSearch("")}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="space-y-1.5 max-h-[58vh] overflow-y-auto custom-scrollbar pr-1">
        {paginated.map((r) => (
          <Card
            key={r.number}
            className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm group"
            onClick={() => onOpenReflection(r.number)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-primary">{r.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-[13px] truncate group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    {isFavorite(r.number) && (
                      <HeartFilled className="h-2.5 w-2.5 fill-red-400 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

// =================== FAVORITES ===================
function Favorites({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const { favorites } = useAppStore();
  const favReflections = reflections.filter((r) => favorites.includes(r.number));

  return (
    <div className="animate-fade-in">
      <h2
        className="text-xl font-bold mb-3"
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        Mis Favoritos
      </h2>
      {favReflections.length === 0 ? (
        <div className="text-center py-14">
          <Heart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground">Aún no tienes favoritos</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Toca el corazón en cualquier reflexión
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
          {favReflections.map((r) => (
            <Card
              key={r.number}
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm group"
              onClick={() => onOpenReflection(r.number)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <HeartFilled className="h-3.5 w-3.5 fill-red-400 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[13px] group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      #{r.number}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== ABOUT THE BOOK ===================
function AboutBook({
  onOpenSection,
}: {
  onOpenSection: (type: "prologo1" | "prologo2" | "intro") => void;
}) {
  const sections = [
    {
      key: "prologo1" as const,
      title: "Prólogo del Pastor José Arturo Esteves",
      preview: prologo1.text.slice(0, 120) + "...",
      icon: BookOpen,
    },
    {
      key: "prologo2" as const,
      title: "Prólogo de Julia Muñoz de López",
      preview: prologo2.text.slice(0, 120) + "...",
      icon: BookOpen,
    },
    {
      key: "intro" as const,
      title: "Introducción del Pastor Nicolás Abreu",
      preview: introduccion.text.slice(0, 120) + "...",
      icon: PenLine,
    },
  ];

  return (
    <div className="animate-fade-in">
      <h2
        className="text-xl font-bold mb-1"
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        Sobre el Libro
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        Conoce los prólogos y la introducción de 365 Reflexiones
      </p>

      <div className="space-y-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.key}
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm group"
              onClick={() => onOpenSection(s.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mt-0.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                      {s.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                      {s.preview}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <LeafDivider className="mt-5 mb-4" />
      <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/20 overflow-hidden">
        <LeafCorner position="top-right" className="w-20 h-20" />
        <p className="relative z-10 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">365 Reflexiones — una para cada día</span> es un
          devocional nacido de la experiencia y la revelación divina del pastor Nicolás de Jesús Abreu.
          Cada reflexión ofrece consejos prácticos, verdades bíblicas y enseñanzas aplicables
          a la vida cotidiana.
        </p>
      </div>
    </div>
  );
}

// =================== REFLECTION DETAIL DIALOG ===================
function ReflectionDetail({
  number,
  onClose,
}: {
  number: number;
  onClose: () => void;
}) {
  const reflection = reflections.find((r) => r.number === number);
  const { toggleFavorite, isFavorite, saveJournalEntry, getJournalEntry, markAsRead } =
    useAppStore();
  const existingEntry = typeof number === 'number' ? getJournalEntry(number) : null;
  const [journalText, setJournalText] = useState(existingEntry?.text || "");
  const [showJournal, setShowJournal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (reflection) markAsRead(reflection.number); }, [number, reflection, markAsRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [number]);

  if (!reflection) return null;

  const favorite = isFavorite(reflection.number);
  const isToday = reflection.number === getDayOfYear();
  const prevRef = reflection.number > 1 ? reflections[reflection.number - 2] : null;
  const nextRef = reflection.number < reflections.length ? reflections[reflection.number] : null;

  const handleSaveJournal = () => {
    if (journalText.trim()) {
      saveJournalEntry(reflection.number, journalText.trim());
      useToast.getState().toast({
        title: "Nota guardada",
        description: "Tu reflexión personal ha sido guardada",
      });
    }
  };

  const handleShare = async () => {
    const text = `\u2728 ${reflection.title}\n\n"${reflection.quote || reflection.body.slice(0, 200)}"\n\n\uD83D\uDCD6 365 Reflexiones — Pastor Nicolás Abreu`;
    try {
      await navigator.clipboard.writeText(text);
      useToast.getState().toast({ title: "\u00A1Copiado!", description: "Listo para compartir" });
    } catch { /* */ }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-lg max-h-[92vh] p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#EDF2EB] via-[#F5F3ED] to-[#E8E2D0] p-5 pb-4 relative leaf-pattern overflow-hidden">
          <LeafCorner position="top-right" className="w-28 h-28" />
          <LeafCorner position="bottom-left" className="w-20 h-20" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-0 text-[10px]"
                >
                  #{reflection.number}
                </Badge>
                {isToday && (
                  <Badge className="bg-primary text-primary-foreground border-0 text-[10px] gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    Hoy
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mr-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => toggleFavorite(reflection.number)}
                >
                  <HeartFilled className={`h-4 w-4 ${favorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-5 bg-border/60 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogTitle
              className="text-lg font-bold mt-2 leading-snug"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              {reflection.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="overflow-y-auto custom-scrollbar max-h-[52vh] px-5 py-4"
        >
          {reflection.quote && (
            <div className="reflection-quote mb-4">
              <p className="text-sm leading-relaxed text-foreground/85">
                {reflection.quote}
              </p>
            </div>
          )}

          {reflection.body && (
            <p className="text-sm leading-[1.8] text-foreground/75 whitespace-pre-line">
              {reflection.body}
            </p>
          )}

          <Separator className="my-4" />

          {/* Journal */}
          <button
            className="flex items-center gap-2 mb-2.5 w-full text-left"
            onClick={() => setShowJournal(!showJournal)}
          >
            <PenLine className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-xs">Mi reflexión personal</span>
            <ChevronDown className={`h-3.5 w-3.5 ml-auto text-muted-foreground transition-transform ${showJournal ? "rotate-180" : ""}`} />
          </button>
          {showJournal && (
            <div className="animate-fade-in">
              <textarea
                className="w-full min-h-[90px] p-3 rounded-xl bg-muted/40 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Escribe tu oración o lo que Dios te habló hoy..."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
              />
              <Button size="sm" className="mt-2 gap-1 text-xs" onClick={handleSaveJournal}>
                <Bookmark className="h-3 w-3" />
                Guardar nota
              </Button>
            </div>
          )}
        </div>

        {/* Footer Nav */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
          <Button
            variant="ghost"
            size="sm"
            disabled={!prevRef}
            onClick={() => useAppStore.getState().setCurrentReflection(prevRef!.number)}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <span className="text-[10px] text-muted-foreground">
            {reflection.number} / {reflections.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!nextRef}
            onClick={() => useAppStore.getState().setCurrentReflection(nextRef!.number)}
            className="gap-1 text-xs"
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =================== TEXT SECTION DIALOG (Prologues/Intro) ===================
function TextSectionDialog({
  type,
  onClose,
}: {
  type: "prologo1" | "prologo2" | "intro";
  onClose: () => void;
}) {
  const data = type === "prologo1" ? prologo1 : type === "prologo2" ? prologo2 : introduccion;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [type]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-lg max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl">
        <div className="relative bg-gradient-to-br from-[#EDF2EB] to-[#E8E2D0] p-5 pb-4 pr-12 leaf-pattern overflow-hidden">
          <LeafCorner position="top-right" className="w-24 h-24" />
          <DialogHeader className="relative z-10">
            <DialogTitle
              className="text-lg font-bold leading-snug pr-6"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              {data.title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{data.author}</p>
          </DialogHeader>
        </div>
        <div
          ref={scrollRef}
          className="overflow-y-auto custom-scrollbar max-h-[65vh] px-5 py-5"
        >
          <p className="text-sm leading-[1.85] text-foreground/80 whitespace-pre-line">
            {data.text}
          </p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-white/60 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}

// =================== SCROLL TO TOP ===================
function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-40 h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
    >
      <ArrowUp className="h-3.5 w-3.5" />
    </button>
  );
}

// =================== MAIN APP ===================
function AppContent() {
  const {
    currentView,
    setCurrentView,
    currentReflection,
    setCurrentReflection,
  } = useAppStore();
  const [textSection, setTextSection] = useState<"prologo1" | "prologo2" | "intro" | null>(null);

  const handleOpenReflection = useCallback((num: number) => setCurrentReflection(num), [setCurrentReflection]);
  const handleCloseReflection = useCallback(() => setCurrentReflection(null), [setCurrentReflection]);
  const handleNavigate = useCallback((view: typeof currentView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setCurrentView]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24">
          <AppHeader />

          {currentView === "home" && (
            <DailyReflection onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "mood" && (
            <MoodRecommender onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "reader" && (
            <Reader onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "favorites" && (
            <Favorites onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "about" && (
            <AboutBook onOpenSection={setTextSection} />
          )}
        </main>

        <NavBar currentView={currentView} onNavigate={handleNavigate} />
        <ScrollToTop />

        {currentReflection !== null && (
          <ReflectionDetail number={currentReflection} onClose={handleCloseReflection} />
        )}
        {textSection && (
          <TextSectionDialog type={textSection} onClose={() => setTextSection(null)} />
        )}
      </div>
    </TooltipProvider>
  );
}

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AppContent />
    </ThemeProvider>
  );
}