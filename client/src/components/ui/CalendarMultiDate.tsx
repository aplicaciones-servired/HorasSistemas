import { useMemo, useState } from 'react';

interface CalendarMultiDateProps {
  selected: string[];
  onChange: (dates: string[]) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number): number => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

export const CalendarMultiDate = ({ selected, onChange }: CalendarMultiDateProps) => {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleDate = (day: number) => {
    const iso = toISODate(new Date(viewYear, viewMonth, day));
    if (selectedSet.has(iso)) {
      onChange(selected.filter((d) => d !== iso));
    } else {
      onChange([...selected, iso]);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const selectWeekdayRange = () => {
    const dates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(toISODate(date));
      }
    }
    onChange(dates);
  };

  const selectWeekends = () => {
    const dates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dates.push(toISODate(date));
      }
    }
    onChange(dates);
  };

  const formatChipDate = (iso: string): string => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  const sortedSelected = useMemo(
    () => [...selected].sort(),
    [selected]
  );

  return (
    <div className="cal-root">
      <div className="cal-header">
        <button type="button" className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
        <span className="cal-title" onClick={goToToday} title="Ir a hoy">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button type="button" className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
      </div>

      <div className="cal-weekdays">
        {DAY_LABELS.map((label) => (
          <span key={label} className="cal-weekday">{label}</span>
        ))}
      </div>

      <div className="cal-grid">
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`empty-${i}`} className="cal-day cal-day--empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = toISODate(new Date(viewYear, viewMonth, day));
          const isSelected = selectedSet.has(iso);
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();

          return (
            <button
              key={day}
              type="button"
              className={`cal-day ${isSelected ? 'cal-day--selected' : ''} ${isToday ? 'cal-day--today' : ''}`}
              onClick={() => toggleDate(day)}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="cal-actions">
        <button type="button" className="text-button" onClick={selectWeekdayRange}>
          Solo laborales
        </button>
        <button type="button" className="text-button" onClick={selectWeekends}>
          Solo fines de semana
        </button>
        {selected.length > 0 && (
          <button type="button" className="text-button text-button--danger" onClick={() => onChange([])}>
            Limpiar
          </button>
        )}
      </div>

      {sortedSelected.length > 0 && (
        <div className="cal-chips">
          <span className="cal-chips__label">{sortedSelected.length} fecha{sortedSelected.length !== 1 ? 's' : ''} seleccionada{sortedSelected.length !== 1 ? 's' : ''}:</span>
          <div className="cal-chips__list">
            {sortedSelected.map((iso) => (
              <span key={iso} className="cal-chip">
                {formatChipDate(iso)}
                <button type="button" className="cal-chip__remove" onClick={() => onChange(selected.filter((d) => d !== iso))}>
                  &#10005;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
