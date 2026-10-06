import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Trash2,
  AlertCircle,
  Briefcase,
  BookOpen,
  X,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { CalendarEvent, EventUrgency, EventType } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onToggleEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onConvertToGoal?: (title: string, category: any) => void;
}

const URGENCY_CONFIG: Record<
  EventUrgency,
  { label: string; bg: string; text: string; border: string; badgeBg: string }
> = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-[#FA5A50]/10',
    text: 'text-[#FA5A50]',
    border: 'border-[#FA5A50]/30',
    badgeBg: 'bg-[#FA5A50]',
  },
  penting: {
    label: 'Penting',
    bg: 'bg-[#FA5A50]/15',
    text: 'text-[#FA5A50]',
    border: 'border-[#FA5A50]/40',
    badgeBg: 'bg-[#FA5A50]',
  },
  sebentar_lagi: {
    label: 'Sebentar Lagi',
    bg: 'bg-[#FFB020]/10',
    text: 'text-[#FFB020]',
    border: 'border-[#FFB020]/30',
    badgeBg: 'bg-[#FFB020]',
  },
  masih_lama: {
    label: 'Masih Lama',
    bg: 'bg-[#3FB876]/10',
    text: 'text-[#3FB876]',
    border: 'border-[#3FB876]/30',
    badgeBg: 'bg-[#3FB876]',
  },
  karir: {
    label: 'Karier',
    bg: 'bg-[#6C5CE7]/10',
    text: 'text-[#6C5CE7]',
    border: 'border-[#6C5CE7]/30',
    badgeBg: 'bg-[#6C5CE7]',
  },
};

const DAYS_HEADER = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEvent,
  onToggleEvent,
  onDeleteEvent,
  onConvertToGoal,
}) => {
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  // Calendar navigation state
  const [currentYear, setCurrentYear] = useState(todayObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayObj.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDate);
  const [eventTime, setEventTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<EventUrgency>('penting');
  const [eventType, setEventType] = useState<EventType>('tugas');
  const [description, setDescription] = useState('');

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // Get starting day index: Monday=0, Sunday=6
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysGrid: ({ dateStr: string; dayNum: number; isCurrentMonth: boolean })[] = [];

  // Previous month trailing days
  const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDaysCount - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month leading days to complete row
  const remaining = (7 - (daysGrid.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Events map by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach((ev) => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  // Filtered events for display
  const selectedDateEvents = events.filter((ev) => {
    const matchesDate = !selectedDate || ev.date === selectedDate;
    const matchesUrgency = filterUrgency === 'all' || ev.urgency === filterUrgency;
    return matchesDate && matchesUrgency;
  });

  const allFilteredEvents = events.filter((ev) => {
    return filterUrgency === 'all' || ev.urgency === filterUrgency;
  });

  const handleOpenAdd = (dateTarget?: string) => {
    setEventDate(dateTarget || selectedDate || todayStr);
    setTitle('');
    setLocation('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      date: eventDate,
      time: eventTime,
      location: location.trim(),
      urgency,
      type: eventType,
      description: description.trim(),
      completed: false,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-[#6C5CE7] mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Agenda & Tenggat
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
            Kalender Aktivitas
          </h1>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAdd()}
          className="p-2.5 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white flex items-center gap-1.5 text-xs font-bold shadow-md shadow-[#6C5CE7]/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Agenda</span>
        </button>
      </div>

      {/* Month Navigator & Calendar Grid (Design System Spec) */}
      <div className="bg-white p-4 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
        {/* Month Header Switch */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-[#1A1A2E]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-[#F5F5F9] text-[#6B7280] hover:text-[#1A1A2E]"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentMonth(todayObj.getMonth());
                setCurrentYear(todayObj.getFullYear());
                setSelectedDate(todayStr);
              }}
              className="text-xs font-bold text-[#6C5CE7] px-2 py-1 hover:bg-[#6C5CE7]/10 rounded-lg"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-[#F5F5F9] text-[#6B7280] hover:text-[#1A1A2E]"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_HEADER.map((d, i) => (
            <span
              key={d}
              className={`text-[11px] font-bold ${
                i >= 5 ? 'text-[#FA5A50]' : 'text-[#6B7280]'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-1">
          {daysGrid.map((dayItem) => {
            const isToday = dayItem.dateStr === todayStr;
            const isSelected = dayItem.dateStr === selectedDate;
            const dayEvents = eventsByDate[dayItem.dateStr] || [];
            const hasEvents = dayEvents.length > 0;

            // Highest urgency color if has events
            const hasUrgent = dayEvents.some((e) => e.urgency === 'urgent');
            const hasPenting = dayEvents.some((e) => e.urgency === 'penting');
            const hasKarir = dayEvents.some((e) => e.urgency === 'karir');

            return (
              <button
                key={dayItem.dateStr}
                type="button"
                onClick={() => setSelectedDate(dayItem.dateStr)}
                className={`relative flex flex-col items-center justify-center h-10 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-[#6C5CE7] text-white font-bold shadow-md shadow-[#6C5CE7]/30 scale-105 z-10'
                    : isToday
                    ? 'bg-[#FFB020] text-[#1A1A2E] font-bold ring-2 ring-[#FFB020]/25'
                    : dayItem.isCurrentMonth
                    ? 'hover:bg-[#F5F5F9] text-[#1A1A2E]'
                    : 'text-[#6B7280]/40'
                }`}
              >
                <span className="text-xs">{dayItem.dayNum}</span>

                {/* Event Indicator dot / badge */}
                {hasEvents && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {isSelected ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    ) : hasUrgent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FA5A50]" />
                    ) : hasPenting ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FA5A50]" />
                    ) : hasKarir ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FB876]" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgency Filter Pills Bar */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setFilterUrgency('all')}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              filterUrgency === 'all'
                ? 'bg-[#1A1A2E] text-white shadow-xs'
                : 'bg-white border border-black/[0.06] text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            Semua ({events.length})
          </button>

          {(Object.keys(URGENCY_CONFIG) as EventUrgency[]).map((urg) => {
            const count = events.filter((e) => e.urgency === urg).length;
            const config = URGENCY_CONFIG[urg];
            const active = filterUrgency === urg;

            return (
              <button
                key={urg}
                type="button"
                onClick={() => setFilterUrgency(urg)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                  active
                    ? `${config.badgeBg} text-white shadow-xs`
                    : 'bg-white border border-black/[0.06] text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Header for Selected Day */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <span className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wider">
            {selectedDate === todayStr ? 'Hari Ini' : 'Tanggal Terpilih'}
          </span>
          <h3 className="text-sm font-bold text-[#1A1A2E]">
            {selectedDate}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAdd(selectedDate)}
          className="text-xs font-bold text-[#6C5CE7] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Agenda & Deadline List for Selected Date */}
      <div className="space-y-3 mb-6">
        {selectedDateEvents.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-black/[0.05] text-center shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center mx-auto mb-2">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#1A1A2E]">
              Tidak ada agenda di tanggal ini
            </h4>
            <p className="text-[11px] text-[#6B7280] mt-0.5 mb-3">
              Jadwalmu kosong atau belum dicatat.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAdd(selectedDate)}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-[#6C5CE7] text-white font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Agenda Baru</span>
            </button>
          </div>
        ) : (
          selectedDateEvents.map((ev) => {
            const urgencyConfig = URGENCY_CONFIG[ev.urgency] || URGENCY_CONFIG.penting;

            return (
              <motion.div
                key={ev.id}
                layout
                className={`p-4 rounded-3xl border transition-all ${
                  ev.completed
                    ? 'bg-white/60 border-black/[0.04]'
                    : 'bg-white border-black/[0.06] shadow-xs hover:border-[#6C5CE7]/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleEvent(ev.id)}
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                        ev.completed
                          ? 'bg-[#3FB876] text-white animate-check-bounce'
                          : 'border-2 border-black/20 hover:border-[#6C5CE7]'
                      }`}
                    >
                      {ev.completed ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 opacity-0" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Urgency Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${urgencyConfig.bg} ${urgencyConfig.text}`}
                        >
                          {urgencyConfig.label}
                        </span>

                        {ev.type && (
                          <span className="text-[10px] font-semibold text-[#6B7280]">
                            · {ev.type}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-xs font-bold leading-snug ${
                          ev.completed
                            ? 'line-through text-[#6B7280]'
                            : 'text-[#1A1A2E]'
                        }`}
                      >
                        {ev.title}
                      </h4>

                      {/* Time & Location */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6B7280] mt-1.5">
                        {ev.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#6C5CE7]" />
                            <span>{ev.time} WIB</span>
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-[#FA5A50]" />
                            <span>{ev.location}</span>
                          </span>
                        )}
                      </div>

                      {ev.description && (
                        <p className="text-[11px] text-[#6B7280] mt-1.5 leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Convert to goal & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!ev.completed && onConvertToGoal && (
                      <button
                        type="button"
                        onClick={() => onConvertToGoal(ev.title, 'study')}
                        title="Jadikan target harian"
                        className="p-1.5 rounded-lg text-[#6C5CE7] hover:bg-[#6C5CE7]/10"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#FA5A50] hover:bg-black/5"
                      title="Hapus agenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal / Sheet Form: Tambah Agenda Baru */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-black/[0.05] pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#6C5CE7]" />
                  <h3 className="text-base font-bold text-[#1A1A2E]">
                    Buat Agenda / Tenggat Baru
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-[#6B7280]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                    Judul Tugas / Aktivitas *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Deadline Pengumpulan Bab 3 Skripsi..."
                    className="w-full px-3.5 py-2.5 bg-[#F5F5F9] rounded-xl text-xs font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F5F9] rounded-xl text-xs font-semibold text-[#1A1A2E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                      Jam / Waktu
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F5F9] rounded-xl text-xs font-semibold text-[#1A1A2E] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Urgency Selector (Penting, Urgent, Sebentar Lagi, Masih Lama, Karier) */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                    Tingkat Urgensi & Prioritas
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(URGENCY_CONFIG) as EventUrgency[]).map((urg) => {
                      const config = URGENCY_CONFIG[urg];
                      const isSelected = urgency === urg;
                      return (
                        <button
                          key={urg}
                          type="button"
                          onClick={() => setUrgency(urg)}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                            isSelected
                              ? `${config.badgeBg} text-white shadow-xs scale-102`
                              : 'border-black/[0.06] bg-[#F5F5F9] text-[#6B7280] hover:text-[#1A1A2E]'
                          }`}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                    Kategori Aktivitas
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['skripsi', 'tugas', 'magang', 'ujian', 'aktivitas'] as EventType[]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setEventType(type)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                            eventType === type
                              ? 'bg-[#1A1A2E] text-white'
                              : 'bg-[#F5F5F9] text-[#6B7280]'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Location / Platform */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                    Lokasi / Platform
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: SIAKAD Kampus / Ruang Dosen / Google Meet..."
                    className="w-full px-3.5 py-2.5 bg-[#F5F5F9] rounded-xl text-xs font-medium text-[#1A1A2E] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Catatan detail persiapan, dokumen yang harus dibawa..."
                    className="w-full px-3.5 py-2 bg-[#F5F5F9] rounded-xl text-xs font-medium text-[#1A1A2E] focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#6C5CE7]/25"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Simpan Agenda & Tenggat</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
