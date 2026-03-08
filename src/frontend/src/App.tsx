import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import { AppProvider } from "./context/AppContext";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import BookingPage from "./pages/BookingPage";
import BusListPage from "./pages/BusListPage";
import DriverPortalPage from "./pages/DriverPortalPage";
import HomePage from "./pages/HomePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import TrackingPage from "./pages/TrackingPage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster position="top-right" richColors />
    </AppProvider>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const busesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buses",
  component: BusListPage,
  validateSearch: (search: Record<string, unknown>) => ({
    source: (search.source as string) ?? "",
    destination: (search.destination as string) ?? "",
    date: (search.date as string) ?? "",
    seats: Number(search.seats ?? 1),
  }),
});

const seatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buses/$busId/seats",
  component: SeatSelectionPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking",
  component: BookingPage,
});

const bookingConfirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking/confirm",
  component: BookingConfirmPage,
  validateSearch: (search: Record<string, unknown>) => ({
    bookingId: (search.bookingId as string) ?? "",
    session_id: (search.session_id as string) ?? "",
  }),
});

const myBookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-bookings",
  component: MyBookingsPage,
});

const trackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track/$busId",
  component: TrackingPage,
});

const driverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver",
  component: DriverPortalPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  busesRoute,
  seatsRoute,
  bookingRoute,
  bookingConfirmRoute,
  myBookingsRoute,
  trackRoute,
  driverRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
