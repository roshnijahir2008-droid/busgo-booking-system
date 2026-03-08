import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";

const SERVICE_FEE = 50;

export default function BookingPage() {
  const navigate = useNavigate();
  const { pendingBooking, getBusById, createBooking, confirmPayment } =
    useApp();
  const { actor } = useActor();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const bus = pendingBooking ? getBusById(pendingBooking.busId) : null;

  if (!pendingBooking || !bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold mb-2">
            No booking in progress
          </h2>
          <p className="text-muted-foreground mb-4">
            Please search and select seats first.
          </p>
          <Button onClick={() => void navigate({ to: "/" })}>Go Home</Button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(phone.replace(/\s/g, "")))
      newErrors.phone = "Enter a valid 10-digit phone number";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const booking = createBooking({ name, phone, email });

      // Check if Stripe is configured
      let stripeConfigured = false;
      if (actor) {
        try {
          stripeConfigured = await actor.isStripeConfigured();
        } catch {
          stripeConfigured = false;
        }
      }

      if (stripeConfigured && actor) {
        // Real Stripe payment
        const successUrl = `${window.location.origin}/booking/confirm?session_id={CHECKOUT_SESSION_ID}&bookingId=${booking.id}`;
        const cancelUrl = `${window.location.origin}/booking`;

        const sessionUrl = await actor.createCheckoutSession(
          [
            {
              productName: `Bus Ticket - ${bus.source} to ${bus.destination}`,
              currency: "inr",
              quantity: BigInt(pendingBooking.selectedSeatIds.length),
              priceInCents: BigInt(bus.price * 100),
              productDescription: `${bus.name} · Seats: ${pendingBooking.selectedSeatNumbers.join(", ")} · Date: ${pendingBooking.journeyDate}`,
            },
          ],
          successUrl,
          cancelUrl,
        );

        window.location.href = sessionUrl;
      } else {
        // Demo mode: auto-confirm after delay
        toast.info("Demo Mode: Simulating payment...", { duration: 2000 });
        await new Promise((res) => setTimeout(res, 1500));
        confirmPayment(booking.id);
        void navigate({
          to: "/booking/confirm",
          search: { bookingId: booking.id, session_id: "" },
        });
      }
    } catch (err) {
      toast.error("Payment failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = pendingBooking.selectedSeatIds.length * bus.price;
  const total = subtotal + SERVICE_FEE;

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              void navigate({
                to: "/buses/$busId/seats",
                params: { busId: bus.id },
              })
            }
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-2xl font-bold">Complete Booking</h1>
        </div>

        {/* Demo Mode Alert */}
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-sm">
            <strong>Demo Mode:</strong> Stripe is not configured. Payment will
            be simulated automatically.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Passenger Form */}
          <div className="lg:col-span-3 space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Journey Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Bus</p>
                    <p className="font-semibold">{bus.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="font-semibold">
                      {bus.source} → {bus.destination}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Departure</p>
                    <p className="font-semibold">{bus.departureTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Journey Date
                    </p>
                    <p className="font-semibold">
                      {pendingBooking.journeyDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Selected Seats
                    </p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {pendingBooking.selectedSeatNumbers.map((sn) => (
                        <Badge key={sn} variant="secondary" className="text-xs">
                          {sn}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bus Type</p>
                    <Badge variant="outline" className="text-xs mt-0.5">
                      {bus.type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Passenger Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="passenger-name">Full Name *</Label>
                  <Input
                    id="passenger-name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                    }}
                    className={errors.name ? "border-destructive" : ""}
                    data-ocid="booking.name_input"
                  />
                  {errors.name && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="booking.name_error"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="passenger-phone">Mobile Number *</Label>
                  <Input
                    id="passenger-phone"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                    }}
                    className={errors.phone ? "border-destructive" : ""}
                    data-ocid="booking.phone_input"
                  />
                  {errors.phone && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="booking.phone_error"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="passenger-email">Email Address *</Label>
                  <Input
                    id="passenger-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                    }}
                    className={errors.email ? "border-destructive" : ""}
                    data-ocid="booking.email_input"
                  />
                  {errors.email && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="booking.email_error"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-card border border-border p-5 sticky top-20">
              <h3 className="font-display font-bold text-base mb-4">
                Price Breakdown
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {pendingBooking.selectedSeatIds.length} seat
                    {pendingBooking.selectedSeatIds.length > 1 ? "s" : ""} × ₹
                    {bus.price.toLocaleString("en-IN")}
                  </span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>₹{SERVICE_FEE}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="mt-4 bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Free cancellation up to 2 hours before departure
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  QR ticket sent to your email
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Secure & encrypted payment
                </p>
              </div>

              <motion.div whileTap={{ scale: 0.98 }} className="mt-5">
                <Button
                  className="w-full font-semibold"
                  size="lg"
                  onClick={handlePayment}
                  disabled={loading}
                  data-ocid="booking.submit_button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Payment · ₹{total.toLocaleString("en-IN")}
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-xs text-center text-muted-foreground mt-3">
                By proceeding, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
