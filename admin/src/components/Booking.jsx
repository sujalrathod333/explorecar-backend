import React, { useEffect, useState, useCallback, useMemo } from "react";
import { BookingPageStyles, statusConfig } from "../assets/dummyStyles";
import axios from "axios";
import {
  FaCalendarAlt,
  FaCar,
  FaCheckCircle,
  FaChevronDown,
  FaCity,
  FaCreditCard,
  FaEdit,
  FaEnvelope,
  FaFilter,
  FaGasPump,
  FaGlobeAsia,
  FaMapMarkerAlt,
  FaMapPin,
  FaPhone,
  FaSearch,
  FaSync,
  FaTachometerAlt,
  FaUser,
  FaUserFriends,
} from "react-icons/fa";

const baseURL = "https://explorecar-backend.onrender.com";
const api = axios.create({ baseURL, headers: { Accept: "application/json" } });

const formatDate = (s) => {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d)
    ? ""
    : `${d.getDate()}`.padStart(2, "0") +
        "/" +
        `${d.getMonth() + 1}`.padStart(2, "0") +
        "/" +
        d.getFullYear();
};

const makeImageUrl = (filename) => {
  if (!filename) return "";
  // If it's already a full URL, return as is
  if (filename.startsWith('http')) return filename;
  // Otherwise, construct the URL
  return `${baseURL}/uploads/${filename}`;
};

const normalizeDetails = (d = {}, car = {}) => ({
  seats: d.seats ?? d.numSeats ?? car.seats ?? "",
  fuel: String(d.fuelType ?? d.fuel ?? car.fuelType ?? car.fuel ?? ""),
  mileage: d.mileage ?? d.miles ?? car.mileage ?? car.miles ?? "",
  transmission: String(d.transmission ?? car.transmission ?? d.trans ?? ""),
});

const extractCarInfo = (b) => {
  const snap =
    b.carSnapshot &&
    typeof b.carSnapshot === "object" &&
    Object.keys(b.carSnapshot).length
      ? b.carSnapshot
      : null;
  const car = snap || (b.car && typeof b.car === "object" ? b.car : null);

  if (car)
    return {
      title:
        `${car.make || ""} ${car.model || ""}`.trim() ||
        car.make ||
        car.model ||
        "",
      make: car.make || "",
      model: car.model || "",
      year: car.year ?? "",
      dailyRate: car.dailyRate ?? 0,
      seats: car.seats ?? "",
      transmission: car.transmission ?? "",
      fuel: car.fuelType ?? car.fuel ?? "",
      mileage: car.mileage ?? "",
      image: car.image || b.carImage || b.image || "",
    };

  return typeof b.car === "string"
    ? { title: b.car, image: b.carImage || b.image || "" }
    : {
        title: b.carName || b.vehicle || "",
        image: b.carImage || b.image || "",
      };
};

const Panel = ({ title, icon, children }) => (
  <div className={BookingPageStyles.panel}>
    <h3 className={BookingPageStyles.panelTitle}>
      {icon}
      <span className={BookingPageStyles.panelIcon}>{title}</span>
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Detail = ({ icon, label, value }) => (
  <div className={BookingPageStyles.detailContainer}>
    <div className={BookingPageStyles.detailIcon}>{icon}</div>
    <div className="flex-1">
      <div className={BookingPageStyles.detailLabel}>{label}</div>
      <div className={BookingPageStyles.detailValue}>{value ?? ""}</div>
    </div>
  </div>
);

const Spec = ({ icon, label, value }) => (
  <div className={BookingPageStyles.specContainer}>
    <div className={BookingPageStyles.specIcon}>{icon}</div>
    <div className={BookingPageStyles.specLabel}>{label}</div>
    <div className={BookingPageStyles.specValue}>{value ?? ""}</div>
  </div>
);

const StatusIndicator = ({ status, isEditing, newStatus, onStatusChange }) => {
  return isEditing ? (
    <select
      value={newStatus}
      onChange={onStatusChange}
      className="bg-gray-800/50 text-sm px-2 py-1 rounded focus:outline-none
         focus:ring-1 focus:ring-orange-500"
    >
      {Object.keys(statusConfig)
        .filter((k) => k !== "default")
        .map((opt) => (
          <option value={opt} key={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
    </select>
  ) : (
    <span className={BookingPageStyles.statusIndicator(status)}>
      <div className={BookingPageStyles.statusIcon(status)} />
      {String(status || "uknown")
        .charAt(0)
        .toUpperCase() + String(status || "unknown").slice(1)}
    </span>
  );
};

const BookingCardHeader = ({ booking, onToggleDetails, isExpanded }) => (
  <div className={BookingPageStyles.bookingCardHeader}>
    <div className={BookingPageStyles.bookingIconContainer}>
      <FaCalendarAlt className={BookingPageStyles.bookingIcon} />
    </div>
    <div>
      <div className={BookingPageStyles.bookingCustomer}>
        {booking.customer || ""}
      </div>
      <div className={BookingPageStyles.bookingEmail}>
        {booking.email || ""}
      </div>
    </div>
    <div className={BookingPageStyles.bookingExpandIcon} onClick={onToggleDetails}>
      <FaChevronDown
        className={`transition-transform duration-300 
        ${isExpanded ? "rotate-180" : ""}`}
      />
      <span className="ml-2 text-sm">
        Show Details
      </span>
    </div>
  </div>
);

const BookingCardInfo = ({ booking, isEditing, newStatus, onStatusChange }) => (
  <div className={BookingPageStyles.bookingInfoGrid}>
    <div className="text-center">
      <div className={BookingPageStyles.bookingInfoLabel}>Car</div>
      <div className={BookingPageStyles.bookingInfoValue}>
        {booking.car || ""}
      </div>
    </div>
    <div className="text-center">
      <div className={BookingPageStyles.bookingInfoLabel}>Pickup</div>
      <div className={BookingPageStyles.bookingInfoValue}>
        {formatDate(booking.pickupDate)}
      </div>
    </div>
    <div className="text-center">
      <div className={BookingPageStyles.bookingInfoLabel}>Amount</div>
      <div className={BookingPageStyles.bookingAmount}>${booking.amount}</div>
    </div>
    <div className="text-center">
      <div className={BookingPageStyles.bookingInfoLabel}>Status</div>
      <StatusIndicator
        status={booking.status}
        isEditing={isEditing}
        newStatus={newStatus}
        onStatusChange={onStatusChange}
      />
    </div>
  </div>
);

const BookingCarActions = ({
  isEditing,
  onEditStatus,
  onSaveStatus,
  onCancelEdit,
  onToggleDetails,
  isExpanded,
}) => (
  <div className={BookingPageStyles.bookingActions}>
    <div className="items-center text-orange-400 hidden md:flex cursor-pointer" onClick={onToggleDetails}>
      <FaChevronDown
        className={`transition-transform duration-300 
        ${isExpanded ? "rotate-180" : ""}`}
      />
      <span className="ml-2 text-sm">
        Show Details
      </span>
    </div>
    <div className="flex space-x-3 ml-auto">
      {isEditing ? (
        <>
          <button
            className={BookingPageStyles.bookingActionButton("green")}
            onClick={onSaveStatus}
          >
            Save
          </button>

          <button
            className={BookingPageStyles.bookingActionButton("gray")}
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          className={BookingPageStyles.bookingEditButton}
          title="Edit Status"
          onClick={onEditStatus}
        >
          <FaEdit className="inline mr-1" /> Edit
        </button>
      )}
    </div>
  </div>
);

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Booking Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Customer Details" icon={<FaUser className="text-orange-400" />}>
              <Detail icon={<FaUser />} label="Full Name" value={booking.customer || "N/A"} />
              <Detail icon={<FaEnvelope />} label="Email" value={booking.email || "N/A"} />
              <Detail icon={<FaPhone />} label="Phone" value={booking.phone || "N/A"} />
            </Panel>

            <Panel title="Booking Details" icon={<FaCalendarAlt className="text-orange-400" />}>
              <Detail icon={<FaCalendarAlt />} label="Pickup Date" value={formatDate(booking.pickupDate) || "N/A"} />
              <Detail icon={<FaCalendarAlt />} label="Return Date" value={formatDate(booking.returnDate) || "N/A"} />
              <Detail icon={<FaCreditCard />} label="Total Amount" value={`$${booking.amount || 0}`} />
            </Panel>

            <Panel title="Address Details" icon={<FaMapMarkerAlt className="text-orange-400" />}>
              <Detail icon={<FaMapMarkerAlt />} label="Street" value={booking.address?.street || "N/A"} />
              <Detail icon={<FaCity />} label="City" value={booking.address?.city || "N/A"} />
              <Detail icon={<FaGlobeAsia />} label="State" value={booking.address?.state || "N/A"} />
            </Panel>

            <Panel title="Car Details" icon={<FaCar className="text-orange-400" />}>
              <div className="flex items-center mb-4">
                <img src={makeImageUrl(booking.carImage) || 'https://via.placeholder.com/150x100?text=No+Image'} alt={booking.car} className="w-20 h-12 object-cover rounded" />
                <div className="ml-4 text-white font-semibold">{booking.car || "N/A"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Spec icon={<FaUserFriends />} label="Seats" value={booking.details?.seats || "N/A"} />
                <Spec icon={<FaGasPump />} label="Fuel" value={booking.details?.fuel || "N/A"} />
                <Spec icon={<FaTachometerAlt />} label="Mileage" value={booking.details?.mileage || "N/A"} />
                <Spec icon={<FaCheckCircle />} label="Transmission" value={booking.details?.transmission || "N/A"} />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingCard = ({
  booking,
  isExpanded,
  isEditing,
  newStatus,
  onToggleDetails,
  onEditStatus,
  onStatusChange,
  onSaveStatus,
  onCancelEdit,
}) => (
  <div className={BookingPageStyles.bookingCard}>
    <div className="p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <BookingCardHeader
          booking={booking}
          isExpanded={isExpanded}
          onToggleDetails={onToggleDetails}
        />

        <BookingCardInfo
          booking={booking}
          isEditing={isEditing}
          newStatus={newStatus}
          onStatusChange={onStatusChange}
        />
      </div>
      <BookingCarActions
        isEditing={isEditing}
        onEditStatus={onEditStatus}
        onSaveStatus={onSaveStatus}
        onCancelEdit={onCancelEdit}
        onToggleDetails={onToggleDetails}
        isExpanded={isExpanded}
      />
    </div>
  </div>
);

const SearchFilterBar = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  totalBookings,
}) => (
  <div className={BookingPageStyles.searchFilterContainer}>
    <div className={BookingPageStyles.searchFilterGrid}>
      <div>
        <label className={BookingPageStyles.filterLabel}>Search Bookings</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer, car, or email..."
            value={searchTerm}
            onChange={onSearchChange}
            className={BookingPageStyles.filterInput}
          />
          <div className={BookingPageStyles.filterIconContainer}>
            <FaSearch />
          </div>
        </div>
      </div>

      <div>
        <label className={BookingPageStyles.filterLabel}>
          Filter by Status
        </label>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={onStatusChange}
            className={BookingPageStyles.filterInput}
          >
            <option value="all">All Statuses</option>
            {Object.keys(statusConfig)
              .filter((k) => k !== "default")
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
          </select>
          <div className={BookingPageStyles.filterIconContainer}>
            <FaFilter />
          </div>
        </div>
      </div>

      <div className={BookingPageStyles.totalBookingsContainer}>
        <div className="text-center">
          <div className={BookingPageStyles.totalBookingsLabel}>
            Total Bookings
          </div>
          <div className={BookingPageStyles.totalBookingsValue}>
            {totalBookings}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NoBookingsView = ({ onResetFilters }) => (
  <div className={BookingPageStyles.noBookingsContainer}>
    <div className={BookingPageStyles.noBookingsIconContainer}>
      <div className={BookingPageStyles.noBookingsIcon}>
        <FaSearch className={BookingPageStyles.noBookingsIconSvg} />
      </div>
    </div>
    <h3 className={BookingPageStyles.noBookingsTitle}>No Bookings Found</h3>
    <p className={BookingPageStyles.noBookingsText}>
      Try adjusting your search or filter criteria.
    </p>
    <button
      onClick={onResetFilters}
      className={BookingPageStyles.noBookingsButton}
    >
      <FaSync className="mr02" />
    </button>
  </div>
);

const BackgroundGradient = () => (
  <div className={BookingPageStyles.fixedBackground}>
    <div className={BookingPageStyles.gradientBlob1}></div>
    <div className={BookingPageStyles.gradientBlob2}></div>
    <div className={BookingPageStyles.gradientBlob3}></div>
  </div>
);

const PageHeader = () => (
  <div className={BookingPageStyles.headerContainer}>
    <div className={BookingPageStyles.headerDivider}>
      <div className={BookingPageStyles.headerDividerLine}></div>
    </div>
    <h1 className={BookingPageStyles.title}>
      <span className={BookingPageStyles.titleGradient}>Booking Dashboard</span>
    </h1>
    <p className={BookingPageStyles.subtitle}>
      Manage all bookings with detailed information and status updates.
    </p>
  </div>
);

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get("/api/bookings?limit=200");
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.bookings || [];
      
      console.log('Raw booking data:', raw[0]); // Debug log
      
      const mapped = raw.map((b, i) => {
        const id = b._id || b.id || `local-${i + 1}`;
        const carInfo = extractCarInfo(b);
        
        console.log('Car info extracted:', carInfo); // Debug log
        console.log('Original car object:', b.car); // Debug log
        console.log('Address object:', b.address); // Debug log
        
        const details = {
          seats: b.car?.seats || 4,
          fuel: b.car?.fuelType || "Petrol", 
          mileage: b.car?.mileage || 15,
          transmission: b.car?.transmission || "Manual",
        };
        
        return {
          id,
          _id: b._id || b.id || null,
          customer: b.customer || b.customerName || "",
          email: b.email || "",
          phone: b.phone || "",
          car: `${b.car?.make || ''} ${b.car?.model || ''}`.trim() || b.car?.title || "Car",
          carImage: b.carImage || b.car?.image || "",
          pickupDate: b.pickupDate || b.pickup || b.startDate || "",
          returnDate: b.returnDate || b.return || b.endDate || "",
          bookingDate: b.bookingDate || b.createdAt || "",
          status: (b.status || "pending").toString(),
          amount: b.amount ?? b.total ?? 0,
          details,
          address: {
            street: b.address?.street || "Not provided",
            city: b.address?.city || "",
            state: b.address?.state || "",
            zipCode: b.address?.zipCode || "",
          },
        };
      });
      setBookings(mapped);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      window.alert("Failed to load bookings from server.");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBooking = useMemo(() => {
    const q = (searchTerm || "").toUpperCase().trim();
    const stringForSearch = (v) =>
      v === null || v === undefined ? "" : String(v).toLowerCase();
    return bookings.filter((b) => {
      const matchesSearch =
        !q ||
        stringForSearch(b.customer).includes(q) ||
        stringForSearch(b.car).includes(q) ||
        stringForSearch(b.email).includes(q);
      const matchedStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchedStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const updateStatus = async (id) => {
    try {
      const booking = bookings.find((b) => b.id === id || b._id === id);
      if (!booking || !booking._id) {
        setEditingStatus(null);
        setNewStatus("");
        return;
      }

      if (!newStatus) {
        window.alert("Please select a status before saving.");
        return;
      }
      await api.patch(`/api/bookings/${booking._id}/status`, {
        status: newStatus,
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: newStatus,
              }
            : b,
        ),
      );
      setEditingStatus(null);
      setNewStatus("");
    } catch (error) {
      console.error("Failed to update status:", error);
      window.alert(
        error.response?.data?.message || "Failed to update booking Status",
      );
    }
  };

  const handleToggleDetails = (booking) => setSelectedBooking(booking);
  const handleCloseModal = () => setSelectedBooking(null);
  const handleEditStatus = (id, currentStatus) => {
    setEditingStatus(id);
    setNewStatus(currentStatus);
  };
  const handleCancelEdit = () => {
    setEditingStatus(null);
    setNewStatus("");
  };
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <>
    <div className={BookingPageStyles.pageContainer}>
      <BackgroundGradient />
      <PageHeader />
      <SearchFilterBar 
      searchTerm={searchTerm}
      onSearchChange={(e) => setSearchTerm(e.target.value)}
      statusFilter={statusFilter}
      onStatusChange={(e)=> setStatusFilter(e.target.value)}
      totalBookings={bookings.length}
      />
      <div className="space-y-4">{filteredBooking.map((booking) => (
        <BookingCard key={booking.id} booking={booking} isExpanded={false}
        isEditing={editingStatus === booking.id} newStatus={newStatus} onToggleDetails={()=> handleToggleDetails(booking)}
        onEditStatus={(e) => {
          e.stopPropagation();
          handleEditStatus(booking.id, booking.status)
        }}
        onStatusChange={(e) => setNewStatus(e.target.value)}
        onSaveStatus={(e) => {
          e.stopPropagation();
          updateStatus(booking.id);
        }}
        onCancelEdit={(e)=>{
          e.stopPropagation();
          handleCancelEdit();
        }}
        />
      ))}
      {filteredBooking.length === 0 && (
        <NoBookingsView onResetFilters={handleResetFilters} />
      )}
      </div>
      <BookingDetailsModal 
        booking={selectedBooking} 
        isOpen={!!selectedBooking} 
        onClose={handleCloseModal} 
      />
    </div>
    </>
  );
};

export default Booking;
