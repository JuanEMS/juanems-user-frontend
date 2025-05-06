import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../css/JuanScope/ModernDatePicker.css';

function ModernDatePicker({
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate = new Date(),
  maxDate = null
}) {
  // Initialize with current month or selected date's month
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  // Update current month when selected date changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  // Calculate days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Format date as string
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle date selection
  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Check if previous month button should be disabled
  const isPrevMonthDisabled = () => {
    if (!minDate) return false;

    const prevMonthDate = new Date(currentMonth);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    return prevMonthDate < new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  };

  // Check if next month button should be disabled
  const isNextMonthDisabled = () => {
    if (!maxDate) return false;

    const nextMonthDate = new Date(currentMonth);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    return nextMonthDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  };

  // Data for calendar rendering
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Current date to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calendar header
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });

  // Generate calendar days
  const calendarDays = [];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-empty-cell"></div>);
  }

  // Add the actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isAvailable = availableDates.some(
      d => d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );
    const isPast = date < today;

    // Check if date is within min and max bounds
    const isBeforeMinDate = minDate && date < minDate;
    const isAfterMaxDate = maxDate && date > maxDate;
    const isDisabled = isPast || isBeforeMinDate || isAfterMaxDate || (!isAvailable && availableDates.length > 0);

    let dayClass = "calendar-day";

    if (isSelected) {
      dayClass += " bg-blue-600 text-white font-bold";
    } else if (isDisabled) {
      dayClass += " text-gray-300 cursor-not-allowed";
    } else if (isAvailable) {
      dayClass += " bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer";
    } else {
      dayClass += " text-gray-600 hover:bg-gray-100 cursor-pointer";
    }

    calendarDays.push(
      <div
        key={day}
        className="calendar-day-wrapper"
        onClick={() => !isDisabled && handleDateClick(day)}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={(e) => !isDisabled && e.key === 'Enter' && handleDateClick(day)}
      >
        <div className={dayClass}>
          {day}
        </div>
      </div>
    );
  }

  return (
    <div className="modern-datepicker">
      <div className="selected-date">
        <Calendar className="w-5 h-5 text-gray-500" />
        <div>
          <p className="label">Selected Date</p>
          <p className="date">
            {selectedDate ? formatDate(selectedDate) : 'Please select a date'}
          </p>
        </div>
      </div>
      <div className="calendar-container">
        <div className="month-navigation">
          <button
            disabled={isPrevMonthDisabled()}
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2>{monthName} {year}</h2>
          <button
            disabled={isNextMonthDisabled()}
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid-cols-7">
          {dayNames.map(day => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}
        </div>
        <div className="grid-cols-7">
          {calendarDays}
        </div>
      </div>
      <div className="legend">
        <div className="item">
          <div className="dot bg-green-100"></div>
          <span>Available</span>
        </div>
        <div className="item">
          <div className="dot bg-blue-600"></div>
          <span>Selected</span>
        </div>
        <div className="item passed">
          <div className="dot passed"></div>
          <span>Passed</span>
        </div>
        <div className="item">
          <div className="dot bg-gray-300"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}

export default ModernDatePicker;