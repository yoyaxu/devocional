"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAppStore, type Reflection } from "@/lib/store";
import reflexionesData from "@/data/reflexiones.json";
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
  BookMarked,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  Heart as HeartFilled,
  Share2,
  Bookmark,
  Calendar,
  Flame,
  X,
  Quote,
  Sun,
  Moon,
  PenLine,
  Sparkles,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

// Theme provider wrapper
import { ThemeProvider } from "next-themes";

const reflections: Reflection[] = reflexionesData as Reflection[];

// Get today's day of year (1-365)
function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.min(Math.floor(diff / oneDay), reflections.length);
}

// Get reflection for a given day of year
function getReflectionForDay(day: number): Reflection {
  const idx = Math.max(0, Math.min(day - 1, reflections.length - 1));
  return reflections[idx];
}

// Format date in Spanish
function formatDate(date: Date): string {
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============== NAV BAR ==============
function NavBar({
  currentView,
  onNavigate,
}: {
  currentView: string;
  onNavigate: (v: "home" | "reader" | "favorites" | "journal" | "progress") => void;
}) {
  const navItems = [
    { id: "home" as const, label: "Hoy", icon: Sun },
    { id: "reader" as const, label: "Leer", icon: BookOpen },
    { id: "favorites" as const, label: "Favoritos", icon: Heart },
    { id: "journal" as const, label: "Diario", icon: PenLine },
    { id: "progress" as const, label: "Progreso", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============== HOME / DAILY REFLECTION ==============
function DailyReflection({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const dayOfYear = getDayOfYear();
  const reflection = getReflectionForDay(dayOfYear);
  const { toggleFavorite, isFavorite, markAsRead } = useAppStore();
  const favorite = isFavorite(reflection.number);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    markAsRead(reflection.number);
  }, [reflection.number, markAsRead]);

  const handleShare = async () => {
    const text = `✨ Reflexión del día - #${reflection.number}\n\n📖 ${reflection.title}\n\n"${reflection.quote || reflection.body?.slice(0, 120) || ""}..."\n\n📖 365 Reflexiones - Una para cada día\nPastor Nicolás Abreu`;
    try {
      await navigator.clipboard.writeText(text);
      useToast.getState().toast({
        title: "¡Copiado!",
        description: "Reflexión copiada para compartir",
      });
    } catch {
      useToast.getState().toast({
        title: "Listo para compartir",
        description: text,
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 pb-8 mb-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-rose-200/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reflexión del día
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur rounded-full px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">
                  Día {dayOfYear}
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/70 backdrop-blur"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Cambiar tema
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <h1
            className="text-3xl font-bold leading-tight mb-2"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            {reflection.title}
          </h1>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-0"
          >
            Reflexión #{reflection.number} de {reflections.length}
          </Badge>
        </div>
      </div>

      {/* Quote Card */}
      {reflection.quote && (
        <Card className="mb-4 border-0 shadow-sm bg-gradient-to-r from-amber-50/50 to-transparent">
          <CardContent className="p-5">
            <div className="reflection-quote">
              <Quote className="h-4 w-4 text-primary/40 mb-2 -ml-1" />
              <p className="text-sm leading-relaxed text-foreground/90">
                {reflection.quote}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Body Preview */}
      {reflection.body && (
        <Card className="mb-4 border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed text-foreground/80 line-clamp-6">
              {reflection.body}
            </p>
            <Button
              variant="link"
              className="px-0 text-primary mt-2"
              onClick={() => onOpenReflection(reflection.number)}
            >
              Leer reflexión completa
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => toggleFavorite(reflection.number)}
        >
          <HeartFilled
            className={`h-4 w-4 ${
              favorite
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            }`}
          />
          {favorite ? "Guardado" : "Guardar"}
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
        <Button
          className="gap-2"
          onClick={() => onOpenReflection(reflection.number)}
        >
          <BookOpen className="h-4 w-4" />
          Leer
        </Button>
      </div>
    </div>
  );
}

// ============== READER ==============
function Reader({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;
  const scrollRef = useRef<HTMLDivElement>(null);

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
  const { isFavorite, isRead } = useAppStore();

  useEffect(() => {
    setPage(0);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [search]);

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Las 365 Reflexiones
        </h2>
        <p className="text-sm text-muted-foreground">
          {filtered.length} reflexiones encontradas
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, tema o contenido..."
          className="pl-10 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* List */}
      <div ref={scrollRef} className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
        {paginated.map((r) => (
          <Card
            key={r.number}
            className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm group"
            onClick={() => onOpenReflection(r.number)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {r.number}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    {isFavorite(r.number) && (
                      <HeartFilled className="h-3 w-3 fill-red-400 text-red-400 flex-shrink-0" />
                    )}
                    {isRead(r.number) && (
                      <Bookmark className="h-3 w-3 text-primary/40 flex-shrink-0 fill-primary/20" />
                    )}
                  </div>
                  {r.quote && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {r.quote.slice(0, 100)}...
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors mt-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
        {paginated.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No se encontraron reflexiones</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
          className="h-8 w-8"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ============== FAVORITES ==============
function Favorites({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const { favorites } = useAppStore();
  const favReflections = reflections.filter((r) => favorites.includes(r.number));

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Mis Favoritos
        </h2>
        <p className="text-sm text-muted-foreground">
          {favReflections.length} reflexiones guardadas
        </p>
      </div>

      {favReflections.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground text-sm">
            Aún no tienes favoritos
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Toca el corazón en cualquier reflexión para guardarla aquí
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
          {favReflections.map((r) => (
            <Card
              key={r.number}
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm group"
              onClick={() => onOpenReflection(r.number)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
                    <HeartFilled className="h-4 w-4 fill-red-400 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Reflexión #{r.number}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== JOURNAL ==============
function Journal({
  onOpenReflection,
}: {
  onOpenReflection: (num: number) => void;
}) {
  const { journal } = useAppStore();
  const entries = Object.values(journal).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Mi Diario
        </h2>
        <p className="text-sm text-muted-foreground">
          {entries.length} entradas escritas
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <PenLine className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground text-sm">
            Tu diario está vacío
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Abre cualquier reflexión y escribe tu pensamiento personal
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
          {entries.map((entry) => {
            const ref = reflections.find(
              (r) => r.number === entry.reflectionNumber
            );
            return (
              <Card
                key={entry.reflectionNumber}
                className="border-0 shadow-sm cursor-pointer group"
                onClick={() => onOpenReflection(entry.reflectionNumber)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      #{entry.reflectionNumber}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {ref?.title}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-3">
                    {entry.text}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    {new Date(entry.date).toLocaleDateString("es-DO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============== PROGRESS ==============
function ProgressView() {
  const { readReflections, favorites, journal } = useAppStore();
  const total = reflections.length;
  const readCount = readReflections.length;
  const favCount = favorites.length;
  const journalCount = Object.keys(journal).length;
  const readPercent = Math.round((readCount / total) * 100);

  // Calculate days read this week
  const daysRead = Math.min(readCount, 7);

  // Milestones
  const milestones = [
    { label: "Primera lectura", target: 1, icon: "🌱" },
    { label: "1 semana", target: 7, icon: "📖" },
    { label: "1 mes", target: 30, icon: "🌟" },
    { label: "100 reflexiones", target: 100, icon: "💯" },
    { label: "Mitad del camino", target: 182, icon: "🏔️" },
    { label: "¡Completado!", target: 365, icon: "🏆" },
  ];

  const nextMilestone =
    milestones.find((m) => readCount < m.target) || milestones[milestones.length - 1];
  const milestoneProgress = nextMilestone
    ? Math.min(
        100,
        Math.round(
          ((readCount - (nextMilestone.target > 1 ? milestones[milestones.indexOf(nextMilestone) - 1]?.target || 0 : 0)) /
            (nextMilestone.target - (nextMilestone.target > 1 ? milestones[milestones.indexOf(nextMilestone) - 1]?.target || 0 : 1))) *
            100
        )
      )
    : 100;

  return (
    <div className="animate-fade-in">
      <h2
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        Mi Progreso
      </h2>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-4">
            <BookOpen className="h-5 w-5 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{readCount}</p>
            <p className="text-[10px] text-muted-foreground">Leídas</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-4">
            <HeartFilled className="h-5 w-5 mx-auto text-red-400 mb-2" />
            <p className="text-2xl font-bold text-red-400">{favCount}</p>
            <p className="text-[10px] text-muted-foreground">Favoritas</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-4">
            <PenLine className="h-5 w-5 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-amber-500">{journalCount}</p>
            <p className="text-[10px] text-muted-foreground">Notas</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="border-0 shadow-sm mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Progreso total</h3>
            <span className="text-2xl font-bold text-primary">{readPercent}%</span>
          </div>
          <Progress value={readPercent} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground mt-2">
            {readCount} de {total} reflexiones leídas
          </p>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card className="border-0 shadow-sm mb-4">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{nextMilestone.icon}</span>
            <div>
              <h3 className="font-semibold text-sm">{nextMilestone.label}</h3>
              <p className="text-xs text-muted-foreground">
                {nextMilestone.target - readCount > 0
                  ? `Faltan ${nextMilestone.target - readCount} reflexiones`
                  : "¡Logrado!"}
              </p>
            </div>
          </div>
          <Progress value={milestoneProgress} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Milestones Grid */}
      <h3
        className="font-semibold text-sm mb-3"
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        Logros
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {milestones.map((m) => {
          const achieved = readCount >= m.target;
          return (
            <div
              key={m.label}
              className={`rounded-xl p-3 text-center transition-all ${
                achieved
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50"
                  : "bg-muted/50 opacity-50"
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <p className={`text-[10px] mt-1 font-medium ${achieved ? "text-foreground" : "text-muted-foreground"}`}>
                {m.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============== REFLECTION DETAIL DIALOG ==============
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
  const [journalText, setJournalText] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reflection) {
      markAsRead(reflection.number);
      const existing = getJournalEntry(reflection.number);
      if (existing) setJournalText(existing.text);
    }
  }, [reflection?.number, getJournalEntry, markAsRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [number]);

  if (!reflection) return null;

  const favorite = isFavorite(reflection.number);
  const dayOfYear = getDayOfYear();
  const isToday = reflection.number === dayOfYear;

  // Navigate to prev/next
  const prevRef = reflections.find((r) => r.number === number - 1);
  const nextRef = reflections.find((r) => r.number === number + 1);

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
    const text = `✨ ${reflection.title}\n\n"${reflection.quote || reflection.body?.slice(0, 200) || ""}"\n\n📖 365 Reflexiones - Pastor Nicolás Abreu`;
    try {
      await navigator.clipboard.writeText(text);
      useToast.getState().toast({
        title: "¡Copiado!",
        description: "Listo para compartir",
      });
    } catch {
      /* fallback */
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 pb-4 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  #{reflection.number}
                </Badge>
                {isToday && (
                  <Badge className="bg-primary text-primary-foreground border-0 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Hoy
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => toggleFavorite(reflection.number)}
                >
                  <HeartFilled
                    className={`h-4 w-4 ${
                      favorite
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogTitle
              className="text-xl font-bold mt-2"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              {reflection.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="overflow-y-auto custom-scrollbar max-h-[55vh] p-5 pt-4"
        >
          {/* Quote */}
          {reflection.quote && (
            <div className="reflection-quote mb-5">
              <p className="text-sm leading-relaxed text-foreground/90">
                {reflection.quote}
              </p>
            </div>
          )}

          {/* Body */}
          {reflection.body && (
            <div className="mb-6">
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                {reflection.body}
              </p>
            </div>
          )}

          <Separator className="mb-4" />

          {/* Journal Section */}
          <div>
            <button
              className="flex items-center gap-2 mb-3 w-full text-left"
              onClick={() => setShowJournal(!showJournal)}
            >
              <PenLine className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Mi reflexión personal</span>
              <ChevronDown
                className={`h-4 w-4 ml-auto text-muted-foreground transition-transform ${
                  showJournal ? "rotate-180" : ""
                }`}
              />
            </button>

            {showJournal && (
              <div className="animate-fade-in">
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-xl bg-muted/50 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Escribe tu reflexión personal, tu oración, o lo que Dios te habló hoy..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                />
                <Button
                  size="sm"
                  className="mt-2 gap-1"
                  onClick={handleSaveJournal}
                >
                  <Bookmark className="h-3 w-3" />
                  Guardar nota
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 border-t bg-card">
          <Button
            variant="ghost"
            size="sm"
            disabled={!prevRef}
            onClick={() => {
              if (prevRef) {
                useAppStore.getState().setCurrentReflection(prevRef.number);
              }
            }}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            {reflection.number} / {reflections.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!nextRef}
            onClick={() => {
              if (nextRef) {
                useAppStore.getState().setCurrentReflection(nextRef.number);
              }
            }}
            className="gap-1"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== SCROLL TO TOP ==============
function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-40 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

// ============== MAIN APP ==============
function AppContent() {
  const { currentView, setCurrentView, currentReflection, setCurrentReflection } =
    useAppStore();

  const handleOpenReflection = useCallback((num: number) => {
    setCurrentReflection(num);
  }, [setCurrentReflection]);

  const handleCloseReflection = useCallback(() => {
    setCurrentReflection(null);
  }, [setCurrentReflection]);

  const handleNavigate = useCallback((view: typeof currentView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setCurrentView]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Main Content */}
        <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-24">
          {currentView === "home" && (
            <DailyReflection onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "reader" && (
            <Reader onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "favorites" && (
            <Favorites onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "journal" && (
            <Journal onOpenReflection={handleOpenReflection} />
          )}
          {currentView === "progress" && <ProgressView />}
        </main>

        {/* Bottom Nav */}
        <NavBar currentView={currentView} onNavigate={handleNavigate} />

        {/* Reflection Detail Dialog */}
        {currentReflection !== null && (
          <ReflectionDetail
            number={currentReflection}
            onClose={handleCloseReflection}
          />
        )}

        {/* Scroll to top button */}
        <ScrollToTop />
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