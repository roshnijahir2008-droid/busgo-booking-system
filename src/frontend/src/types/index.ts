export type BusType =
  | "AC Sleeper"
  | "Non-AC Seater"
  | "AC Seater"
  | "Non-AC Sleeper";
export type SeatStatus = "available" | "booked" | "selected";
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  experience: number;
  trips: number;
  rating: number;
  assignedBusId: string | null;
  available: boolean;
}

export interface Bus {
  id: string;
  name: string;
  regNumber: string;
  type: BusType;
  totalSeats: number;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  amenities: string[];
  driverId: string | null;
  active: boolean;
  rating: number;
}

export interface Seat {
  id: string;
  busId: string;
  seatNumber: string;
  row: number;
  col: string;
  status: SeatStatus;
  isWindow: boolean;
  isUpper: boolean;
}

export interface Booking {
  id: string;
  busId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  seatIds: string[];
  seatNumbers: string[];
  journeyDate: string;
  amount: number;
  status: BookingStatus;
  createdAt: string;
  qrData: string;
  paymentId: string | null;
}

export interface BusLocation {
  busId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  updatedAt: string;
}

export interface User {
  principal: string;
  name: string;
  isAdmin: boolean;
}

export interface SearchQuery {
  source: string;
  destination: string;
  date: string;
  seats: number;
}

export interface PendingBooking {
  busId: string;
  selectedSeatIds: string[];
  selectedSeatNumbers: string[];
  journeyDate: string;
  totalAmount: number;
}

export interface PassengerInfo {
  name: string;
  phone: string;
  email: string;
}
