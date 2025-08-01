import React, { useEffect, useState } from 'react';
import { fetchBookingsForUser } from '../services/strapi';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './MyBookings.css';

export default function MyBookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const fetchedBookings = await fetchBookingsForUser(firebaseUser.email);
          console.log('Fetched bookings:', fetchedBookings); // Debug log
          setBookings(fetchedBookings || []);
        } catch (err) {
          console.error('Failed to fetch bookings:', err);
          setError('Failed to load bookings.');
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setBookings([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (service) => {
    if (!service) return 'https://via.placeholder.com/80';
    
    // Handle different image formats from Strapi
    let imageUrl = 'https://via.placeholder.com/80';
    
    if (service.image) {
      if (typeof service.image === 'string') {
        imageUrl = service.image;
      } else if (service.image.url) {
        imageUrl = service.image.url;
      } else if (service.image.data && service.image.data.attributes && service.image.data.attributes.url) {
        imageUrl = service.image.data.attributes.url;
      } else if (service.image.attributes && service.image.attributes.url) {
        imageUrl = service.image.attributes.url;
      }
    }

    // Add Strapi base URL if needed
    if (imageUrl && !imageUrl.startsWith('http')) {
      const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
      imageUrl = `${strapiUrl}${imageUrl}`;
    }

    return imageUrl;
  };

  // Filter bookings by date
  const now = dayjs();
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = dayjs(booking.scheduleTime || booking.date);
    return bookingDate.isAfter(now);
  });
  
  const pastBookings = bookings.filter(booking => {
    const bookingDate = dayjs(booking.scheduleTime || booking.date);
    return bookingDate.isBefore(now);
  });

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleManageBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleBookAgain = (booking) => {
    if (booking.service) {
      // Navigate to schedule page with the service data
      navigate('/schedule', { 
        state: { 
          service: {
            id: booking.service.id || booking.service.documentId, // Handle both numeric and string IDs
            title: booking.service.name || booking.service.title,
            duration: booking.service.duration,
            price: booking.service.price,
            backgroundColor: booking.service.backgroundColor || 'yellow'
          } 
        } 
      });
    } else {
      alert('Service information not available');
    }
  };

  const getStatusBadge = (booking) => {
    const status = booking.bookingStatus || booking.status || 'pending';
    return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="container">
          <div className="bookings-loading">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bookings-page">
        <div className="container">
          <div className="bookings-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="bookings-header">
          <button className="back-btn" onClick={() => navigate('/services')}>
            ← Back to Services
          </button>
          
          <div className="header-content">
            <h1>My Bookings</h1>
            <p className="subtitle">
              Manage your appointments and view booking history
            </p>
          </div>
        </div>

        <div className="bookings-tabs">
          <button 
            className={activeTab === 'upcoming' ? 'active' : ''}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button 
            className={activeTab === 'past' ? 'active' : ''}
            onClick={() => setActiveTab('past')}
          >
            Past ({pastBookings.length})
          </button>
        </div>

        <div className="timezone-info">
          All times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </div>

        <div className="bookings-list">
          {currentBookings.length === 0 ? (
            <div className="no-bookings">
              <h3>No {activeTab} bookings</h3>
              <p>
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments." 
                  : "You don't have any past bookings yet."}
              </p>
              <button onClick={() => navigate('/services')}>
                Book a Service
              </button>
            </div>
          ) : (
            currentBookings.map((booking) => (
              <div key={booking.id || booking.documentId} className="booking-card">
                <img 
                  src={getImageUrl(booking.service)}
                  alt={booking.service?.name || booking.service?.title || 'Service'}
                  className="booking-thumb"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80';
                  }}
                />
                
                <div className="booking-info">
                  <h3>{booking.service?.name || booking.service?.title || 'No Service Info'}</h3>
                  <p>
                    {dayjs(booking.scheduleTime || booking.date).format('dddd, MMMM D, YYYY [at] h:mm A')}
                  </p>
                  <p>Duration: {booking.service?.duration || 'N/A'} minutes</p>
                  <p>Price: ${booking.service?.price || 'N/A'}</p>
                  <p>Booked by: {booking.userEmail}</p>
                  {getStatusBadge(booking)}
                </div>

                <div className="booking-actions">
                  {activeTab === 'upcoming' ? (
                    <button onClick={() => handleManageBooking(booking)}>
                      Manage
                    </button>
                  ) : (
                    <button 
                      className="book-again-btn"
                      onClick={() => handleBookAgain(booking)}
                    >
                      Book Again
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Manage Booking Modal */}
        {showModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="manage-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Manage Booking</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <h4>{selectedBooking.service?.name || selectedBooking.service?.title}</h4>
                <p>
                  {dayjs(selectedBooking.scheduleTime || selectedBooking.date).format('dddd, MMMM D, YYYY [at] h:mm A')}
                </p>

                <div className="manage-actions">
                  <button onClick={() => {
                    alert('Rescheduling feature coming soon!');
                    setShowModal(false);
                  }}>
                    📅 Reschedule Appointment
                  </button>
                  
                  <button onClick={() => {
                    alert('Modification feature coming soon!');
                    setShowModal(false);
                  }}>
                    ✏️ Modify Details
                  </button>
                  
                  <button onClick={() => {
                    if (confirm('Are you sure you want to cancel this booking?')) {
                      alert('Cancellation feature coming soon!');
                      setShowModal(false);
                    }
                  }}>
                    ❌ Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}