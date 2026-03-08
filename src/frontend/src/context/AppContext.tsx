import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  SEED_BOOKINGS,
  SEED_BUSES,
  SEED_BUS_LOCATIONS,
  SEED_DRIVERS,
  generateAllSeats,
} from "../data/seedData";
import type {
  Booking,
  Bus,
  BusLocation,
  Driver,
  PassengerInfo,
  PendingBooking,
  SearchQuery,
  Seat,
  User,
} from "../types";

interface AppState {
  buses: Bus[];
  seats: Record<string, Seat[]>;
  bookings: Booking[];
  drivers: Driver[];
  busLocations: Record<string, BusLocation>;
  currentUser: User | null;
  searchQuery: SearchQuery | null;
  selectedBusId: string | null;
  selectedSeatIds: string[];
  pendingBooking: PendingBooking | null;
  // Actions
  setCurrentUser: (user: User | null) => void;
  searchBuses: (source: string, dest: string, date: string) => Bus[];
  selectSeat: (busId: string, seatId: string) => void;
  deselectSeat: (busId: string, seatId: string) => void;
  clearSelectedSeats: () => void;
  setSelectedBus: (busId: string | null) => void;
  setPendingBooking: (booking: PendingBooking | null) => void;
  setSearchQuery: (query: SearchQuery | null) => void;
  createBooking: (passenger: PassengerInfo) => Booking;
  cancelBooking: (bookingId: string) => void;
  confirmPayment: (bookingId: string) => void;
  updateBusLocation: (
    busId: string,
    lat: number,
    lng: number,
    speed: number,
    heading: number,
  ) => void;
  addDriver: (driver: Omit<Driver, "id">) => void;
  updateDriver: (driverId: string, updates: Partial<Driver>) => void;
  toggleBusStatus: (busId: string) => void;
  assignDriver: (busId: string, driverId: string | null) => void;
  addBooking: (booking: Booking) => void;
  getBusById: (busId: string) => Bus | undefined;
  getDriverById: (driverId: string) => Driver | undefined;
  getSeatsByBusId: (busId: string) => Seat[];
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [buses, setBuses] = useState<Bus[]>(SEED_BUSES);
  const [seats, setSeats] = useState<Record<string, Seat[]>>(generateAllSeats);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [drivers, setDrivers] = useState<Driver[]>(SEED_DRIVERS);
  const [busLocations, setBusLocations] =
    useState<Record<string, BusLocation>>(SEED_BUS_LOCATIONS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(
    null,
  );

  const searchBuses = useCallback(
    (source: string, dest: string, _date: string): Bus[] => {
      return buses.filter(
        (b) =>
          b.active &&
          b.source.toLowerCase() === source.toLowerCase() &&
          b.destination.toLowerCase() === dest.toLowerCase(),
      );
    },
    [buses],
  );

  const selectSeat = useCallback((busId: string, seatId: string) => {
    setSeats((prev) => {
      const busSeats = prev[busId] ?? [];
      return {
        ...prev,
        [busId]: busSeats.map((s) =>
          s.id === seatId && s.status === "available"
            ? { ...s, status: "selected" as const }
            : s,
        ),
      };
    });
    setSelectedSeatIds((prev) => [...prev, seatId]);
  }, []);

  const deselectSeat = useCallback((busId: string, seatId: string) => {
    setSeats((prev) => {
      const busSeats = prev[busId] ?? [];
      return {
        ...prev,
        [busId]: busSeats.map((s) =>
          s.id === seatId && s.status === "selected"
            ? { ...s, status: "available" as const }
            : s,
        ),
      };
    });
    setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
  }, []);

  const clearSelectedSeats = useCallback(() => {
    if (selectedBusId) {
      setSeats((prev) => {
        const busSeats = prev[selectedBusId] ?? [];
        return {
          ...prev,
          [selectedBusId]: busSeats.map((s) =>
            s.status === "selected"
              ? { ...s, status: "available" as const }
              : s,
          ),
        };
      });
    }
    setSelectedSeatIds([]);
  }, [selectedBusId]);

  const setSelectedBus = useCallback(
    (busId: string | null) => {
      // Clear previous selections when changing bus
      if (selectedBusId && selectedBusId !== busId) {
        clearSelectedSeats();
      }
      setSelectedBusId(busId);
    },
    [selectedBusId, clearSelectedSeats],
  );

  const createBooking = useCallback(
    (passenger: PassengerInfo): Booking => {
      if (!pendingBooking) throw new Error("No pending booking");

      const bookingId = `BKG-${Date.now().toString(36).toUpperCase()}`;
      const qrData = `BUSGO|${bookingId}|${pendingBooking.busId}|${pendingBooking.journeyDate}|${passenger.name}`;

      const booking: Booking = {
        id: bookingId,
        busId: pendingBooking.busId,
        passengerName: passenger.name,
        passengerPhone: passenger.phone,
        passengerEmail: passenger.email,
        seatIds: pendingBooking.selectedSeatIds,
        seatNumbers: pendingBooking.selectedSeatNumbers,
        journeyDate: pendingBooking.journeyDate,
        amount: pendingBooking.totalAmount,
        status: "pending",
        createdAt: new Date().toISOString(),
        qrData,
        paymentId: null,
      };

      // Mark seats as booked
      setSeats((prev) => {
        const busSeats = prev[pendingBooking.busId] ?? [];
        return {
          ...prev,
          [pendingBooking.busId]: busSeats.map((s) =>
            pendingBooking.selectedSeatIds.includes(s.id)
              ? { ...s, status: "booked" as const }
              : s,
          ),
        };
      });

      setBookings((prev) => [...prev, booking]);
      setSelectedSeatIds([]);
      setPendingBooking(null);

      return booking;
    },
    [pendingBooking],
  );

  const cancelBooking = useCallback(
    (bookingId: string) => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
        ),
      );
      // Free up the seats
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        setSeats((prev) => {
          const busSeats = prev[booking.busId] ?? [];
          return {
            ...prev,
            [booking.busId]: busSeats.map((s) =>
              booking.seatIds.includes(s.id)
                ? { ...s, status: "available" as const }
                : s,
            ),
          };
        });
      }
    },
    [bookings],
  );

  const confirmPayment = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "confirmed" as const,
              paymentId: `pay_${bookingId}`,
            }
          : b,
      ),
    );
  }, []);

  const updateBusLocation = useCallback(
    (
      busId: string,
      lat: number,
      lng: number,
      speed: number,
      heading: number,
    ) => {
      setBusLocations((prev) => ({
        ...prev,
        [busId]: {
          busId,
          lat,
          lng,
          speed,
          heading,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    [],
  );

  const addDriver = useCallback((driverData: Omit<Driver, "id">) => {
    const newDriver: Driver = {
      ...driverData,
      id: `driver_${Date.now()}`,
    };
    setDrivers((prev) => [...prev, newDriver]);
  }, []);

  const updateDriver = useCallback(
    (driverId: string, updates: Partial<Driver>) => {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, ...updates } : d)),
      );
    },
    [],
  );

  const toggleBusStatus = useCallback((busId: string) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, active: !b.active } : b)),
    );
  }, []);

  const assignDriver = useCallback((busId: string, driverId: string | null) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, driverId } : b)),
    );
    // Update driver availability
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId)
          return { ...d, assignedBusId: busId, available: false };
        if (d.assignedBusId === busId)
          return { ...d, assignedBusId: null, available: true };
        return d;
      }),
    );
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  }, []);

  const getBusById = useCallback(
    (busId: string) => buses.find((b) => b.id === busId),
    [buses],
  );

  const getDriverById = useCallback(
    (driverId: string) => drivers.find((d) => d.id === driverId),
    [drivers],
  );

  const getSeatsByBusId = useCallback(
    (busId: string) => seats[busId] ?? [],
    [seats],
  );

  const value = useMemo<AppState>(
    () => ({
      buses,
      seats,
      bookings,
      drivers,
      busLocations,
      currentUser,
      searchQuery,
      selectedBusId,
      selectedSeatIds,
      pendingBooking,
      setCurrentUser,
      searchBuses,
      selectSeat,
      deselectSeat,
      clearSelectedSeats,
      setSelectedBus,
      setPendingBooking,
      setSearchQuery,
      createBooking,
      cancelBooking,
      confirmPayment,
      updateBusLocation,
      addDriver,
      updateDriver,
      toggleBusStatus,
      assignDriver,
      addBooking,
      getBusById,
      getDriverById,
      getSeatsByBusId,
    }),
    [
      buses,
      seats,
      bookings,
      drivers,
      busLocations,
      currentUser,
      searchQuery,
      selectedBusId,
      selectedSeatIds,
      pendingBooking,
      searchBuses,
      selectSeat,
      deselectSeat,
      clearSelectedSeats,
      setSelectedBus,
      createBooking,
      cancelBooking,
      confirmPayment,
      updateBusLocation,
      addDriver,
      updateDriver,
      toggleBusStatus,
      assignDriver,
      addBooking,
      getBusById,
      getDriverById,
      getSeatsByBusId,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
