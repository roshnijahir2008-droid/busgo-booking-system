import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, Calendar, Eye, Ticket, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { Booking, BookingStatus } from "../types";

async function generateQRUrl(text: string): Promise<string> {
  try {
    const QRCode = await import("qrcode");
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: { dark: "#1a2040", light: "#ffffff" },
    });
  } catch {
    return "";
  }
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    confirmed: {
      label: "Confirmed",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    completed: {
      label: "Completed",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function QRModal({ booking }: { booking: Booking }) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    void generateQRUrl(booking.qrData).then(setQrUrl);
  }, [booking.qrData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          QR Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Your Ticket QR</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Booking ID: <strong>{booking.id}</strong>
          </p>
          {qrUrl ? (
            <div className="border-2 border-border rounded-xl p-3 bg-white">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Generating...</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground font-mono text-center break-all max-w-xs">
            {booking.qrData}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Show this QR code to the conductor when boarding
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingCard({
  booking,
  index,
  onCancel,
}: {
  booking: Booking;
  index: number;
  onCancel: (id: string) => void;
}) {
  const { getBusById } = useApp();
  const bus = getBusById(booking.busId);

  if (!bus) return null;

  const canCancel =
    booking.status === "confirmed" || booking.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="bg-card rounded-xl shadow-card border border-border p-5"
      data-ocid={`bookings.item.${index + 1}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Bus & Route */}
          <div className="flex items-center gap-2 mb-1">
            <Bus className="w-4 h-4 text-muted-foreground shrink-0" />
            <h3 className="font-semibold text-sm truncate">{bus.name}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {bus.source} → {bus.destination}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Date</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{booking.journeyDate}</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Seats</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {booking.seatNumbers.map((sn) => (
                  <Badge
                    key={sn}
                    variant="secondary"
                    className="text-xs px-1.5 py-0"
                  >
                    {sn}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Departure</p>
              <p className="font-medium mt-0.5">{bus.departureTime}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold mt-0.5">
                ₹{booking.amount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          {(booking.status === "confirmed" ||
            booking.status === "completed") && <QRModal booking={booking} />}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive gap-1.5"
                  data-ocid={`bookings.cancel_button.${index + 1}`}
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel booking{" "}
                    <strong>{booking.id}</strong>? This action cannot be undone.
                    Refund will be processed within 5-7 days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    data-ocid={`bookings.cancel.cancel_button.${index + 1}`}
                  >
                    Keep Booking
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(booking.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid={`bookings.cancel.confirm_button.${index + 1}`}
                  >
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const today = new Date().toISOString().split("T")[0];

export default function MyBookingsPage() {
  const { bookings, cancelBooking } = useApp();
  const [activeTab, setActiveTab] = useState("all");

  const filterBookings = (tab: string) => {
    switch (tab) {
      case "upcoming":
        return bookings.filter(
          (b) =>
            (b.status === "confirmed" || b.status === "pending") &&
            b.journeyDate >= today,
        );
      case "completed":
        return bookings.filter(
          (b) =>
            b.status === "completed" ||
            (b.status === "confirmed" && b.journeyDate < today),
        );
      case "cancelled":
        return bookings.filter((b) => b.status === "cancelled");
      default:
        return [...bookings].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  };

  const currentBookings = filterBookings(activeTab);

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            My Bookings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all your bus ticket bookings in one place
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="mb-5 w-full sm:w-auto"
            data-ocid="bookings.filter.tab"
          >
            {[
              { value: "all", label: "All" },
              { value: "upcoming", label: "Upcoming" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid={`bookings.${tab.value}.tab`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", "upcoming", "completed", "cancelled"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4" data-ocid="bookings.list">
                <AnimatePresence mode="popLayout">
                  {currentBookings.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-card rounded-xl shadow-card border border-border p-16 text-center"
                      data-ocid="bookings.empty_state"
                    >
                      <Ticket className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <h3 className="font-semibold mb-1">No bookings here</h3>
                      <p className="text-sm text-muted-foreground">
                        {tab === "all"
                          ? "You haven't made any bookings yet."
                          : `No ${tab} bookings found.`}
                      </p>
                    </motion.div>
                  ) : (
                    currentBookings.map((booking, i) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        index={i}
                        onCancel={cancelBooking}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
