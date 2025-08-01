import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import dayjs from 'dayjs';
import { createBooking } from '../services/strapi';
import './Schedule.css';

/* ===== 常量 ===== */
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM',
];

/* ===== 輔助函式 ===== */
const sameMonth = (d1, d2) =>
  d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

const today = new Date();
const getDateKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// 🔧 產生月曆邏輯
const generateCalendar = (baseDate) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const days = [];

  const startDay = start.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), i - startDay + 1));
  }

  for (let d = 1; d <= end.getDate(); d++) {
    days.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), d));
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, i));
  }

  return days;
};

export default function Schedule() {
  const navigate = useNavigate();
  const location = useLocation();
// const selectedService = location.state?.selectedService;
const selectedService = location.state?.selectedService || location.state?.service;


  const [user, setUser] = useState(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // 👉 若沒帶入 service，自動導回 services 頁
  useEffect(() => {
    if (!selectedService) {
      alert('No service selected. Redirecting...');
      navigate('/services');
    }
  }, [selectedService, navigate]);

  // Firebase 登入
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // 建立預約
  const onBook = async () => {
    if (!selectedDate || !selectedTime || !user) return;
    setProcessing(true);
    setErrMsg('');

    try {
      // 使用 documentId 或 id，優先使用 documentId (Strapi v5的新格式)
      const serviceId = selectedService.documentId || selectedService.id;
      
      console.log('Creating booking with service ID:', serviceId); // Debug log
      
      await createBooking({
        service: serviceId, // 使用 documentId 或 id
        userEmail: user.email,
        scheduleTime: dayjs(
          `${dayjs(selectedDate).format('YYYY-MM-DD')} ${selectedTime}`
        ).toISOString(),
        bookingStatus: 'confirmed', // 改為 confirmed 狀態
      });

      alert(
        `Successfully booked "${selectedService.title}" on ` +
        `${dayjs(selectedDate).format('ddd, MMM D')} at ${selectedTime}!`
      );
      navigate('/my-bookings');
    } catch (err) {
      console.error('Booking error:', err);
      setErrMsg(err.message ?? 'Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const days = generateCalendar(viewMonth);
  const selectedKey = selectedDate && getDateKey(selectedDate);

  // 過濾掉過去的日期
  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="schedule-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/services')}>
          ← Back to Services
        </button>

        <header className="schedule-header">
          <h1>Schedule your service</h1>
          <p className="subtitle">
            Check our availability and book the date and time that works for you
          </p>
        </header>

        <div className="schedule-container">
          <div className="schedule-form">
            <div className="timezone-info">
              Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>

            <div className="month-navigation">
              <button onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))
              }>
                &#8249;
              </button>
              <h3 className="month-title">
                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))
              }>
                &#8250;
              </button>
            </div>

            <div className="calendar">
              <div className="calendar-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="calendar-day-header">{d}</div>
                ))}
              </div>
              <div className="calendar-body">
                {days.map((d) => {
                  const key = getDateKey(d);
                  const isCurrent = sameMonth(d, viewMonth);
                  const isToday = key === getDateKey(today);
                  const isSel = key === selectedKey;
                  const isDisabled = !isCurrent || isDateDisabled(d);
                  
                  return (
                    <button
                      key={key}
                      disabled={isDisabled}
                      className={[
                        'calendar-day',
                        !isCurrent ? 'other-month' : '',
                        isToday ? 'today' : '',
                        isSel ? 'selected' : '',
                        isDisabled ? 'disabled' : '',
                      ].join(' ')}
                      onClick={() => !isDisabled && setSelectedDate(d)}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="time-selection">
                <h3>Availability for {dayjs(selectedDate).format('dddd, MMM D')}</h3>
                <div className="time-slots">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      className={`time-slot ${selectedTime === t ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="service-details">
            <h2>Service Details</h2>
            <div className="selected-service">
              <h3>{selectedService?.title}</h3>

              <div className="detail-item">
                <span className="label">Date & Time:</span>
                <span className="value">
                  {selectedDate && selectedTime
                    ? `${dayjs(selectedDate).format('MMM D, YYYY')} • ${selectedTime}`
                    : 'Select date & time'}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">{selectedService?.duration} min</span>
              </div>

              <div className="detail-item price-item">
                <span className="label">Price:</span>
                <span className="price">${selectedService?.price}</span>
              </div>

              <div className="detail-item">
                <span className="label">Booking for:</span>
                <span className="value">{user?.email || 'Please sign in'}</span>
              </div>

              {errMsg && <p className="error-text">{errMsg}</p>}

              {selectedDate && selectedTime && user && (
                <button
                  className="next-btn"
                  onClick={onBook}
                  disabled={processing}
                >
                  {processing ? 'Processing…' : 'Book Now →'}
                </button>
              )}

              {(!user) && (
                <p className="login-notice">
                  Please sign in to make a booking
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}