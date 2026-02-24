// src/pages/MyBookings.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaCar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaFilter,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUser,
  FaCreditCard,
  FaReceipt,
  FaArrowRight,
} from "react-icons/fa";
import { myBookingsStyles as s } from "../assets/FRONTEND/dummyStyles";

const API_BASE = process.env.NODE_ENV === 'production' 
  ? "https://explorecar-backend.onrender.com" 
  : "http://localhost:5000";
const TIMEOUT = 15000;

// ---------- Helpers ----------
const safeAccess = (fn, fallback = "") => {
  try {
    const v = fn();
    return v === undefined || v === null ? fallback : v;
  } catch {
    return fallback;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? String(dateString)
    : d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const formatPrice = (price) => {
  const num = typeof price === "number" ? price : Number(price) || 0;
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const daysBetween = (start, end) => {
  try {
    const a = new Date(start);
    const b = new Date(end);
    if (Number.isNaN(a) || Number.isNaN(b)) return 0;
    return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

const normalizeBooking = (booking) => {
  console.log('Normalizing booking:', booking);
  
  const getCarData = () => {
    if (!booking) return {};
    if (typeof booking.car === "string") return { name: booking.car };
    if (booking.car && typeof booking.car === "object") {
      const snapshot = { ...booking.car };
      if (snapshot.id && typeof snapshot.id === "object") {
        const populated = { ...snapshot.id };
        delete snapshot.id;
        return { ...snapshot, ...populated };
      }
      return snapshot;
    }
    return {};
  };
  
  const carObj = getCarData();
  console.log('Car object:', carObj);
  
  const details = booking.details || {};
  const address = booking.address || {};

  // Handle image URL properly - use same logic as admin
  const buildImageSrc = (image) => {
    console.log('buildImageSrc input:', image);
    if (!image) return "";
    if (Array.isArray(image)) image = image[0];
    if (typeof image !== "string") return "";

    const trimmed = image.trim();
    console.log('trimmed image:', trimmed);
    
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      console.log('Full URL detected:', trimmed);
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      const result = `${API_BASE}${trimmed}`;
      console.log('Relative path with slash:', result);
      return result;
    }
    // Remove any leading 'uploads/' to avoid duplication
    const cleanPath = trimmed.replace(/^uploads\//, '');
    const result = `${API_BASE}/uploads/${cleanPath}`;
    console.log('Filename only, building URL:', result);
    return result;
  };
  
  const image = (() => {
    // Try different possible image field names in correct priority
    const possibleImages = [
      booking.carImage,           // Direct carImage field from booking
      booking.car?.image,         // Image from car object
      carObj.image,              // Image from processed car object
      booking.image              // Fallback image field
    ];
    
    console.log('Checking images:', possibleImages);
    
    for (const img of possibleImages) {
      const processed = buildImageSrc(img);
      if (processed) {
        console.log('Using image:', img, '-> processed:', processed);
        return processed;
      }
    }
    
    console.log('No valid image found, using placeholder');
    return "https://placehold.co/800x450/e5e7eb/6b7280?text=No+Image";
  })();
  
  console.log('Final image URL:', image);

  const pickupDate =
    safeAccess(() => booking.pickupDate) ||
    safeAccess(() => booking.dates?.pickup) ||
    booking.pickup ||
    null;

  const returnDate =
    safeAccess(() => booking.returnDate) ||
    safeAccess(() => booking.dates?.return) ||
    booking.return ||
    null;

  const normalized = {
    id: booking._id || booking.id || String(Math.random()).slice(2, 8),
    car: {
      name: (() => {
        const make = carObj.make || "";
        const model = carObj.model || "";
        const name = carObj.name || "";
        
        // If we have a complete name, use it
        if (name && name !== "") {
          return name;
        }
        // If we have both make and model, combine them
        if (make && make !== "" && model && model !== "") {
          return `${make} ${model}`;
        }
        // Use make or model individually
        if (make && make !== "") {
          return make;
        }
        if (model && model !== "") {
          return model;
        }
        // If car data is missing but we have an ID, show a meaningful fallback
        if (carObj.id) {
          return `Car (${carObj.category || 'Vehicle'})`;
        }
        return "Car";
      })(),
      make: carObj.make || "",
      model: carObj.model || "",
      image,
      year: carObj.year || carObj.modelYear || "",
      category: carObj.category,
      seats: details.seats || carObj.seats || 4,
      transmission:
        details.transmission || carObj.transmission || carObj.gearbox || "",
      fuelType:
        details.fuelType ||
        details.fuel ||
        carObj.fuelType ||
        carObj.fuel ||
        carObj.fuel_type ||
        "",
      mileage:
        details.mileage || carObj.mileage || carObj.kmpl || carObj.mpg || "",
    },
    user: {
      name: booking.customer || safeAccess(() => booking.user?.name) || "Guest",
      email: booking.email || safeAccess(() => booking.user?.email) || "",
      phone: booking.phone || safeAccess(() => booking.user?.phone) || "",
      address:
        address.street || address.city || address.state
          ? `${address.street || ""}${address.city ? ", " + address.city : ""}${
              address.state ? ", " + address.state : ""
            }`
          : safeAccess(() => booking.user?.address) || "",
    },
    dates: { pickup: pickupDate, return: returnDate },
    location:
      address.city || booking.location || carObj.location || "Pickup location",
    price: Number(booking.amount || booking.price || booking.total || 0),
    status:
      booking.status ||
      (booking.paymentStatus === "paid" ? "active" : "") ||
      (booking.paymentStatus === "pending" ? "pending" : "") ||
      "pending",
    bookingDate:
      booking.bookingDate ||
      booking.createdAt ||
      booking.updatedAt ||
      Date.now(),
    paymentMethod: booking.paymentMethod || booking.payment?.method || "",
    paymentId:
      booking.paymentIntentId || booking.paymentId || booking.sessionId || "",
    raw: booking,
  };

  // derive completed/upcoming from return date
  try {
    const now = new Date();
    const _return = new Date(normalized.dates.return);
    if (normalized.status === "active" || normalized.status === "pending") {
      normalized.status = _return > now ? "upcoming" : "completed";
    }
  } catch {
    normalized.status = normalized.status || "upcoming";
  }

  return normalized;
};

// ---------- Small presentational components ----------
const FilterButton = ({ filterKey, currentFilter, icon, label, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(filterKey)}
    className={s.filterButton(currentFilter === filterKey, filterKey)}
  >
    {icon} {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    completed: {
      text: "Completed",
      color: "bg-green-500",
      icon: <FaCheckCircle />,
    },
    upcoming: { text: "Upcoming", color: "bg-blue-500", icon: <FaClock /> },
    cancelled: {
      text: "Cancelled",
      color: "bg-red-500",
      icon: <FaTimesCircle />,
    },
    default: { text: "Unknown", color: "bg-gray-500", icon: null },
  };
  const { text, color, icon } = map[status] || map.default;
  return (
    <div
      className={`${color} text-white px-3 py-1 rounded-full inline-flex items-center gap-2 text-sm`}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};

const BookingCard = ({ booking, onViewDetails }) => {
  const days = daysBetween(booking.dates.pickup, booking.dates.return);
  
  const handleImageError = (e) => {
    const img = e?.target;
    if (!img) return;
    // prevent infinite loop if fallback also fails
    img.onerror = null;
    img.src = "https://placehold.co/800x450/e5e7eb/6b7280?text=Car+Image";
    img.alt = img.alt || "Image not available";
    img.style.objectFit = img.style.objectFit || "cover";
  };
  
  return (
    <div className={s.bookingCard}>
      <div className={s.cardImageContainer}>
        <img
          src={booking.car.image || "https://placehold.co/800x450/e5e7eb/6b7280?text=Car+Image"}
          alt={booking.car.name}
          className={s.cardImage}
          onError={handleImageError}
        />
      </div>

      <div className={s.cardContent}>
        <div className={s.cardHeader}>
          <div>
            <h3 className={s.carTitle}>{booking.car.name}</h3>
            <p className={s.carSubtitle}>
              {booking.car.category} â€¢ {booking.car.year}
            </p>
          </div>
          <div className="text-right">
            <p className={s.priceText}>{formatPrice(booking.price)}</p>
            <p className={s.daysText}>
              for {days} {days > 1 ? "days" : "day"}
            </p>
          </div>
        </div>

        <StatusBadge status={booking.status} />

        <div className={s.detailSection}>
          <div className={s.detailItem}>
            <div className={s.detailIcon}>
              <FaCalendarAlt />
            </div>
            <div>
              <p className={s.detailLabel}>Dates</p>
              <p className={s.detailValue}>
                {formatDate(booking.dates.pickup)} -{" "}
                {formatDate(booking.dates.return)}
              </p>
            </div>
          </div>

          <div className={s.detailItem}>
            <div className={s.detailIcon}>
              <FaMapMarkerAlt />
            </div>
            <div>
              <p className={s.detailLabel}>Pickup Location</p>
              <p className={s.detailValue}>{booking.location}</p>
            </div>
          </div>
        </div>

        <div className={s.cardActions}>
          <button
            type="button"
            onClick={() => onViewDetails(booking)}
            className={s.viewDetailsButton}
          >
            <FaReceipt /> View Details
          </button>
          <Link to="/cars" className={s.bookAgainButton}>
            <FaCar />
            {booking.status === "upcoming" ? "Modify" : "Book Again"}
          </Link>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ booking, onClose, onCancel }) => {
  const days = daysBetween(booking.dates.pickup, booking.dates.return);
  const pricePerDay = days > 0 ? booking.price / days : booking.price;
  
  const handleImageError = (e) => {
    const img = e?.target;
    if (!img) return;
    img.onerror = null;
    img.src = "https://placehold.co/800x450/e5e7eb/6b7280?text=Car+Image";
    img.alt = img.alt || "Image not available";
    img.style.objectFit = img.style.objectFit || "cover";
  };

  return (
    <div className={s.modalOverlay}>
      <div className={s.modalContainer}>
        <div className={s.modalContent}>
          <div className={s.modalHeader}>
            <h2 className={s.modalTitle}>
              <FaReceipt className="text-orange-400" /> Booking Details
            </h2>
            <div className="flex items-center gap-2">
              {booking.status === "upcoming" && (
                <button
                  type="button"
                  onClick={() => onCancel(booking.id)}
                  className={s.cancelButton}
                >
                  Cancel Booking
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className={s.modalCloseButton}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className={s.modalGrid}>
            <div>
              <img
                src={booking.car.image || "https://placehold.co/800x450/e5e7eb/6b7280?text=Car+Image"}
                alt={booking.car.make}
                className={s.carImageModal}
                onError={handleImageError}
              />
            </div>

            <div>
              <h3 className={s.carTitle}>{booking.car.name}</h3>
              <div className={s.carTags}>
                <span className={s.carTag}>{booking.car.category}</span>
                <span className={s.carTag}>{booking.car.year}</span>
                <span className={s.carTag}>{booking.car.seats} seats</span>
                <span className={s.carTag}>{booking.car.transmission}</span>
              </div>

              <div className={s.infoGrid}>
                <div>
                  <p className={s.infoLabel}>Fuel Type</p>
                  <p className={s.infoValue}>{booking.car.fuelType}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Mileage</p>
                  <p className={s.infoValue}>{booking.car.mileage}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Price per day</p>
                  <p className={s.infoValue}>{formatPrice(pricePerDay)}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Total Price</p>
                  <p className={s.priceValue}>{formatPrice(booking.price)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={s.modalGrid}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaCalendarAlt className="text-orange-400" /> Booking Dates
              </h3>
              <div className={s.infoCard}>
                <div className={s.infoRow}>
                  <p className={s.infoLabel}>Pickup Date:</p>
                  <p className={s.infoValue}>
                    {formatDate(booking.dates.pickup)}
                  </p>
                </div>
                <div className={s.infoRow}>
                  <p className={s.infoLabel}>Return Date:</p>
                  <p className={s.infoValue}>
                    {formatDate(booking.dates.return)}
                  </p>
                </div>
                <div className={`${s.infoRow} ${s.infoDivider}`}>
                  <p className={s.infoLabel}>Duration:</p>
                  <p className={s.infoValue}>{days} days</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
                <FaMapMarkerAlt className="text-orange-400" /> Location Details
              </h3>
              <div className={s.infoCard}>
                <p className={s.infoLabel}>Pickup Location:</p>
                <p className={s.infoValue}>{booking.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
                <FaUser className="text-orange-400" /> User Information
              </h3>
              <div className={s.infoCard}>
                <div className="mb-3">
                  <p className={s.infoLabel}>Full Name:</p>
                  <p className={s.infoValue}>{booking.user.name}</p>
                </div>
                <div className="mb-3">
                  <p className={s.infoLabel}>Email:</p>
                  <p className={s.infoValue}>{booking.user.email}</p>
                </div>
                <div className="mb-3">
                  <p className={s.infoLabel}>Phone:</p>
                  <p className={s.infoValue}>{booking.user.phone}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Address:</p>
                  <p className={s.infoValue}>{booking.user.address}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
                <FaCreditCard className="text-orange-400" /> Payment Details
              </h3>
              <div className={s.infoCard}>
                <div className="mb-3">
                  <p className={s.infoLabel}>Payment Method:</p>
                  <p className={s.infoValue}>
                    {booking.paymentMethod || "â€”"}
                  </p>
                </div>
                <div>
                  <p className={s.infoLabel}>Transaction ID:</p>
                  <p className={s.infoValue}>
                    {booking.paymentId || booking.raw?.sessionId || "â€”"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={s.infoCard}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={s.infoLabel}>Booking Status:</p>
                <StatusBadge status={booking.status} />
              </div>
              <div>
                <p className={s.infoLabel}>Booking Date:</p>
                <p className={s.infoValue}>{formatDate(booking.bookingDate)}</p>
              </div>
            </div>
          </div>

          <div className={s.modalActions}>
            <button type="button" onClick={onClose} className={s.closeButton}>
              Close
            </button>
            <Link to="/cars" onClick={onClose} className={s.modalBookButton}>
              Book Again <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Main page ----------
const StatsCard = ({ value, label, color }) => (
  <div className={s.statsCard}>
    <div className={s.statsValue(color)}>{value}</div>
    <p className={s.statsLabel}>{label}</p>
  </div>
);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  useEffect(() => () => (isMounted.current = false), []);

  const fetchBookings = useCallback(async () => {
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }
      
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log('Fetching bookings from:', `${API_BASE}/api/bookings/mybookings`);
      const response = await axios.get(`${API_BASE}/api/bookings/mybookings`, {
        headers,
        signal: controller.signal,
      });

      console.log('Response received:', response.data);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ||
          response.data?.bookings ||
          response.data?.rows ||
          response.data ||
          [];

      console.log('Raw booking data:', rawData);
      const normalized = (Array.isArray(rawData) ? rawData : []).map(
        normalizeBooking
      );
      console.log('Normalized bookings:', normalized);

      if (!isMounted.current) return;
      setBookings(normalized);
      setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      console.error('Booking fetch error:', err);
      
      if (err?.name === "CanceledError" || err?.message === "canceled") {
        setError("Request cancelled / timed out");
      } else if (err.response?.status === 404) {
        setError("Booking endpoint not found. Please check if the backend server is running on http://localhost:5000");
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError("Cannot connect to server. Please ensure the backend is running on http://localhost:5000");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load bookings"
        );
      }
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = useCallback(
    async (bookingId) => {
      if (!window.confirm("Are you sure you want to cancel this booking?"))
        return;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Authentication required. Please login first.");
          return;
        }
        
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        
        const response = await axios.patch(
          `${API_BASE}/api/bookings/${bookingId}/status`,
          { status: "cancelled" },
          { headers }
        );

        const updated = normalizeBooking(
          response.data ||
            response.data?.data || { _id: bookingId, status: "cancelled" }
        );
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? updated : b))
        );
        if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
      } catch (err) {
        console.error('Cancel booking error:', err);
        alert(
          err.response?.data?.message ||
            err.message ||
            "Failed to cancel booking"
        );
      }
    },
    [selectedBooking]
  );

  const filteredBookings = useMemo(
    () =>
      filter === "all" ? bookings : bookings.filter((b) => b.status === filter),
    [bookings, filter]
  );

  const filterButtons = [
    { key: "all", label: "All Bookings", icon: <FaFilter /> },
    { key: "upcoming", label: "Upcoming", icon: <FaClock /> },
    { key: "completed", label: "Completed", icon: <FaCheckCircle /> },
    { key: "cancelled", label: "Cancelled", icon: <FaTimes /> },
  ];

  const openDetails = (b) => {
    setSelectedBooking(b);
    setShowModal(true);
  };
  const closeModal = () => {
    setSelectedBooking(null);
    setShowModal(false);
  };

  return (
    <div className={s.pageContainer}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={s.title}>My Bookings</h1>
          <p className={s.subtitle}>
            View and manage all your current and past car rental bookings
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filterButtons.map((btn) => (
            <FilterButton
              key={btn.key}
              filterKey={btn.key}
              currentFilter={filter}
              icon={btn.icon}
              label={btn.label}
              onClick={setFilter}
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className={s.loadingSpinner} />
          </div>
        )}

        {!loading && error && (
          <div className={s.errorContainer}>
            <p className={s.errorText}>{error}</p>
            <button
              type="button"
              onClick={fetchBookings}
              className={s.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredBookings.length === 0 && (
          <div className={s.emptyState}>
            <div className={s.emptyIconContainer}>
              <FaCar className={s.emptyIcon} />
            </div>
            <h3 className={s.emptyTitle}>No bookings found</h3>
            <p className={s.emptyText}>
              {filter === "all"
                ? "You haven't made any bookings yet. Browse our collection to get started!"
                : `You don't have any ${filter} bookings.`}
            </p>
            <Link to="/cars" className={s.browseButton}>
              <FaCar /> Browse Cars
            </Link>
          </div>
        )}

        {!loading && !error && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={openDetails}
              />
            ))}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            value={bookings.length}
            label="Total Bookings"
            color="text-orange-400"
          />
          <StatsCard
            value={bookings.filter((b) => b.status === "completed").length}
            label="Completed Trips"
            color="text-green-400"
          />
          <StatsCard
            value={bookings.filter((b) => b.status === "upcoming").length}
            label="Upcoming Trips"
            color="text-blue-400"
          />
        </div>
      </div>

      {showModal && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={closeModal}
          onCancel={cancelBooking}
        />
      )}
    </div>
  );
};

export default MyBookings;