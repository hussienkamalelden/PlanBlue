'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Locale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/dictionary';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useLocaleStore } from '@/stores/locale-store';

type SelectionField = 'from' | 'to';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function formatReportDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
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

function normalizeRange(fromDate: Date, toDate: Date): { from: Date; to: Date } {
  const from = startOfDay(fromDate).getTime();
  const to = startOfDay(toDate).getTime();

  if (from <= to) {
    return { from: startOfDay(fromDate), to: startOfDay(toDate) };
  }

  return { from: startOfDay(toDate), to: startOfDay(fromDate) };
}

function isBetweenRange(date: Date, fromDate: Date, toDate: Date): boolean {
  const { from, to } = normalizeRange(fromDate, toDate);
  const time = startOfDay(date).getTime();
  return time > from.getTime() && time < to.getTime();
}

export function ReportView() {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const PreviousMonthIcon = locale === 'ar' ? ChevronRight : ChevronLeft;
  const NextMonthIcon = locale === 'ar' ? ChevronLeft : ChevronRight;
  const today = useMemo(() => startOfDay(new Date()), []);
  const [activeField, setActiveField] = useState<SelectionField>('from');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

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

  const rangeSummary =
    fromDate && toDate
      ? interpolate(t.report.rangeSummary, {
          from: formatReportDate(fromDate, locale),
          to: formatReportDate(toDate, locale),
        })
      : null;

  const selectingHint =
    activeField === 'from'
      ? t.report.calendar.selectingFrom
      : t.report.calendar.selectingTo;

  function focusField(field: SelectionField) {
    setActiveField(field);
    const targetDate = field === 'from' ? fromDate : toDate;

    if (targetDate) {
      setVisibleMonth({
        year: targetDate.getFullYear(),
        month: targetDate.getMonth(),
      });
    }
  }

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

  function handleDaySelect(date: Date) {
    const picked = startOfDay(date);

    if (activeField === 'from') {
      setFromDate(picked);

      if (toDate && picked.getTime() > startOfDay(toDate).getTime()) {
        setToDate(picked);
      }

      setActiveField('to');
      return;
    }

    setToDate(picked);

    if (fromDate && picked.getTime() < startOfDay(fromDate).getTime()) {
      setFromDate(picked);
    }
  }

  return (
    <section className="pb-report">
      <header className="pb-report__header">
        <h1 className="pb-report__title">{t.report.title}</h1>
      </header>

      <div className="pb-report__panel">
        <div className="pb-report-range">
          <button
            type="button"
            className={[
              'pb-report-range__field',
              activeField === 'from' ? 'pb-report-range__field--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => focusField('from')}
          >
            <span className="pb-report-range__label">{t.report.from}</span>
            <span className="pb-report-range__value">
              {fromDate
                ? formatReportDate(fromDate, locale)
                : t.report.selectFrom}
            </span>
          </button>

          <button
            type="button"
            className={[
              'pb-report-range__field',
              activeField === 'to' ? 'pb-report-range__field--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => focusField('to')}
          >
            <span className="pb-report-range__label">{t.report.to}</span>
            <span className="pb-report-range__value">
              {toDate ? formatReportDate(toDate, locale) : t.report.selectTo}
            </span>
          </button>
        </div>

        {rangeSummary ? (
          <p className="pb-report-range__summary">{rangeSummary}</p>
        ) : (
          <p className="pb-report-range__hint">{selectingHint}</p>
        )}

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

              const isFrom = fromDate ? isSameDay(cell.date, fromDate) : false;
              const isTo = toDate ? isSameDay(cell.date, toDate) : false;
              const isInRange =
                fromDate && toDate
                  ? isBetweenRange(cell.date, fromDate, toDate)
                  : false;
              const isToday = isSameDay(cell.date, today);

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={[
                    'pb-report-calendar__cell',
                    'pb-report-calendar__cell--day',
                    isFrom ? 'pb-report-calendar__cell--from' : '',
                    isTo ? 'pb-report-calendar__cell--to' : '',
                    isInRange ? 'pb-report-calendar__cell--in-range' : '',
                    isToday ? 'pb-report-calendar__cell--today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleDaySelect(cell.date)}
                  aria-pressed={isFrom || isTo}
                  aria-label={formatReportDate(cell.date, locale)}
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
