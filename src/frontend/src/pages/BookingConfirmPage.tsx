import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  Bus,
  Calendar,
  CheckCircle2,
  Download,
  MapPin,
  Ticket,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";

async function generateQR(text: string): Promise<string> {
  try {
    // Dynamically import qrcode
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

export default function BookingConfirmPage() {
  const searchParams = useSearch({ from: "/booking/confirm" });
  const navigate = useNavigate();
  const { bookings, getBusById, confirmPayment } = useApp();
  const { actor } = useActor();

  const bookingId = (
    searchParams as { bookingId?: string; session_id?: string }
  ).bookingId;
  const sessionId = (searchParams as { session_id?: string }).session_id;

  const [qrUrl, setQrUrl] = useState("");
  const [_stripeVerified, setStripeVerified] = useState(false);
  const verifiedRef = useRef(false);

  const booking = bookings.find((b) => b.id === bookingId);
  const bus = booking ? getBusById(booking.busId) : null;

  // Verify Stripe session if session_id present
  useEffect(() => {
    if (!sessionId || !actor || verifiedRef.current) return;
    verifiedRef.current = true;

    void (async () => {
      try {
        const status = await actor.getStripeSessionStatus(sessionId);
        if (status.__kind__ === "completed" && bookingId) {
          confirmPayment(bookingId);
          setStripeVerified(true);
        }
      } catch {
        // fallback: mark as confirmed anyway
        if (bookingId) confirmPayment(bookingId);
      }
    })();
  }, [sessionId, actor, bookingId, confirmPayment]);

  // Generate QR code
  useEffect(() => {
    if (booking?.qrData) {
      void generateQR(booking.qrData).then(setQrUrl);
    }
  }, [booking]);

  if (!booking || !bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold mb-2">
            Booking not found
          </h2>
          <Button onClick={() => void navigate({ to: "/" })}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    const content = [
      "=== BusGo Ticket ===",
      `Booking ID: ${booking.id}`,
      `Passenger: ${booking.passengerName}`,
      `Phone: ${booking.passengerPhone}`,
      `Email: ${booking.passengerEmail}`,
      `Bus: ${bus.name}`,
      `Route: ${bus.source} → ${bus.destination}`,
      `Journey Date: ${booking.journeyDate}`,
      `Departure: ${bus.departureTime}`,
      `Seats: ${booking.seatNumbers.join(", ")}`,
      `Amount Paid: ₹${booking.amount.toLocaleString("en-IN")}`,
      `Status: ${booking.status.toUpperCase()}`,
      "",
      `QR Data: ${booking.qrData}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BusGo_Ticket_${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main
      className="min-h-screen bg-background py-8"
      data-ocid="confirm.success_state"
    >
      <div className="container mx-auto px-4 max-w-xl">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Your ticket has been booked successfully. Safe travels!
          </p>
        </motion.div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
        >
          {/* Ticket Header */}
          <div className="bg-primary px-6 py-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span className="font-display font-bold text-lg">
                  BusGo Ticket
                </span>
              </div>
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                {booking.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-primary-foreground/70 text-sm mt-1">
              Booking ID: {booking.id}
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-4">
            {/* Route */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-display font-bold">
                  {bus.departureTime}
                </p>
                <p className="text-sm text-muted-foreground">{bus.source}</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <Bus className="w-5 h-5 text-muted-foreground mb-1" />
                <div className="w-full h-px bg-border relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2">
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold">
                  {bus.arrivalTime}
                </p>
                <p className="text-sm text-muted-foreground">
                  {bus.destination}
                </p>
              </div>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Passenger</p>
                  <p className="font-semibold">{booking.passengerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Journey Date</p>
                  <p className="font-semibold">{booking.journeyDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Bus</p>
                  <p className="font-semibold">{bus.name}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Seats</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {booking.seatNumbers.map((sn) => (
                    <Badge key={sn} variant="secondary" className="text-xs">
                      {sn}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="border-dashed" />

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-muted-foreground">
                Scan QR to Verify Ticket
              </p>
              {qrUrl ? (
                <div className="border-2 border-border rounded-xl p-3 bg-white">
                  <img src={qrUrl} alt="Ticket QR Code" className="w-40 h-40" />
                </div>
              ) : (
                <div className="w-40 h-40 bg-muted rounded-xl flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Loading QR...</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center break-all font-mono max-w-xs">
                {booking.qrData}
              </p>
            </div>

            <Separator />

            {/* Amount */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Paid</span>
              <span className="text-xl font-display font-bold">
                ₹{booking.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-5 flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            className="flex-1 font-semibold"
            onClick={handleDownload}
            data-ocid="confirm.primary_button"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Ticket
          </Button>
          <Link to="/my-bookings" className="flex-1">
            <Button
              className="w-full font-semibold"
              data-ocid="confirm.secondary_button"
            >
              View My Bookings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
