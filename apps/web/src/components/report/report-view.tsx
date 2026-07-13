'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Locale } from '@/lib/i18n/config';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useLocaleStore } from '@/stores/locale-store';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function getWeekdayLabels(locale: Locale): string[] {
  const formatter = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2024, 0, index + 7);
    return formatter.format(date);
  });
}

function getMonthLabel(year: number, month: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));
}

type CalendarCell =
  | { type: 'empty'; key: string }
  | { type: 'day'; key: string; date: Date; day: number };

function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const leadingEmpty = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < leadingEmpty; index += 1) {
    cells.push({ type: 'empty', key: `empty-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({
      type: 'day',
      key: toDateKey(date),
      date,
      day,
    });
  }

  return cells;
}

export function ReportView() {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const PreviousMonthIcon = locale === 'ar' ? ChevronRight : ChevronLeft;
  const NextMonthIcon = locale === 'ar' ? ChevronLeft : ChevronRight;
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(today));

  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const monthLabel = getMonthLabel(
    visibleMonth.year,
    visibleMonth.month,
    locale,
  );
  const calendarCells = buildCalendarCells(
    visibleMonth.year,
    visibleMonth.month,
  );

  function goToPreviousMonth() {
    setVisibleMonth((current) => {
      const date = new Date(current.year, current.month - 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function goToNextMonth() {
    setVisibleMonth((current) => {
      const date = new Date(current.year, current.month + 1, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  return (
    <section className="pb-report">
      <header className="pb-report__header">
        <p className="pb-report__badge">{t.report.badge}</p>
        <h1 className="pb-report__title">{t.report.title}</h1>
        <p className="pb-report__subtitle">{t.report.subtitle}</p>
      </header>

      <div className="pb-report__panel">
        <div className="pb-report-calendar">
          <div className="pb-report-calendar__toolbar">
            <button
              type="button"
              className="pb-report-calendar__nav"
              onClick={goToPreviousMonth}
              aria-label={t.report.calendar.previousMonth}
            >
              <PreviousMonthIcon aria-hidden size={20} />
            </button>

            <h2 className="pb-report-calendar__month">{monthLabel}</h2>

            <button
              type="button"
              className="pb-report-calendar__nav"
              onClick={goToNextMonth}
              aria-label={t.report.calendar.nextMonth}
            >
              <NextMonthIcon aria-hidden size={20} />
            </button>
          </div>

          <div className="pb-report-calendar__weekdays">
            {weekdayLabels.map((label) => (
              <span key={label} className="pb-report-calendar__weekday">
                {label}
              </span>
            ))}
          </div>

          <div className="pb-report-calendar__grid">
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return (
                  <span
                    key={cell.key}
                    className="pb-report-calendar__cell pb-report-calendar__cell--empty"
                    aria-hidden
                  />
                );
              }

              const isSelected = isSameDay(cell.date, selectedDate);
              const isToday = isSameDay(cell.date, today);

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={[
                    'pb-report-calendar__cell',
                    'pb-report-calendar__cell--day',
                    isSelected ? 'pb-report-calendar__cell--selected' : '',
                    isToday ? 'pb-report-calendar__cell--today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedDate(cell.date)}
                  aria-pressed={isSelected}
                  aria-label={cell.date.toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="pb-cart-summary__btn pb-cart-summary__btn--primary pb-report__generate"
        >
          {t.report.generateReport}
        </button>
      </div>
    </section>
  );
}
