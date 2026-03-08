import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Headphones,
  IndianRupee,
  MapPin,
  Search,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

const CITIES = [
  "Ahmedabad",
  "Bangalore",
  "Bhopal",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Delhi",
  "Goa",
  "Guwahati",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Madurai",
  "Mangalore",
  "Mumbai",
  "Mysore",
  "Nagpur",
  "Nashik",
  "Patna",
  "Pune",
  "Raipur",
  "Rajkot",
  "Ranchi",
  "Surat",
  "Thiruvananthapuram",
  "Tiruchirappalli",
  "Vadodara",
  "Varanasi",
  "Vijayawada",
  "Visakhapatnam",
];

const POPULAR_ROUTES = [
  { from: "Bangalore", to: "Mumbai" },
  { from: "Bangalore", to: "Chennai" },
  { from: "Chennai", to: "Hyderabad" },
  { from: "Hyderabad", to: "Bangalore" },
  { from: "Mumbai", to: "Pune" },
  { from: "Delhi", to: "Jaipur" },
  { from: "Pune", to: "Goa" },
  { from: "Kochi", to: "Bangalore" },
  { from: "Kolkata", to: "Patna" },
  { from: "Ahmedabad", to: "Mumbai" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Safe & Secure",
    desc: "Verified drivers, GPS tracking, and 24/7 monitoring on every journey.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Clock,
    title: "Always On-Time",
    desc: "Industry-leading punctuality with real-time bus tracking.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: IndianRupee,
    title: "Best Prices",
    desc: "Guaranteed lowest fares with no hidden charges or booking fees.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Round-the-clock customer support via chat, call, or email.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const STATS = [
  { label: "Happy Travelers", value: "2M+", icon: Users },
  { label: "Routes Covered", value: "500+", icon: MapPin },
  { label: "Average Rating", value: "4.7★", icon: Star },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { setSearchQuery } = useApp();

  const today = new Date().toISOString().split("T")[0];
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(today);
  const [numSeats, setNumSeats] = useState(1);
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (!source || !destination) {
      setError("Please select both source and destination cities.");
      return;
    }
    if (source === destination) {
      setError("Source and destination cannot be the same.");
      return;
    }
    setError("");
    setSearchQuery({ source, destination, date, seats: numSeats });
    void navigate({
      to: "/buses",
      search: { source, destination, date, seats: numSeats },
    });
  };

  const handleQuickRoute = (from: string, to: string) => {
    setSource(from);
    setDestination(to);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-hero-gradient overflow-hidden min-h-[540px] flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-busgo.dim_1200x600.jpg')",
          }}
        />
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-5 bg-white" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-5 bg-amber-300" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                India's #1 Bus Booking Platform
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Book Bus Tickets
                <br />
                <span style={{ color: "oklch(0.82 0.18 75)" }}>
                  Online, Instantly
                </span>
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Discover 500+ routes, choose your perfect seat, and travel with
                confidence. Best prices guaranteed.
              </p>
            </motion.div>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="source"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    From
                  </Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger
                      id="source"
                      className="h-11"
                      data-ocid="search.source_input"
                    >
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="dest"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    To
                  </Label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger
                      id="dest"
                      className="h-11"
                      data-ocid="search.destination_input"
                    >
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="date"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Journey Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11"
                    data-ocid="search.date_input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Seats
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={String(numSeats)}
                      onValueChange={(v) => setNumSeats(Number(v))}
                    >
                      <SelectTrigger className="h-11 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} {n === 1 ? "Seat" : "Seats"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="default"
                      onClick={handleSearch}
                      className="h-11 px-5 font-semibold shrink-0"
                      data-ocid="search.submit_button"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <p
                  className="mt-3 text-sm text-destructive font-medium"
                  data-ocid="search.error_state"
                >
                  {error}
                </p>
              )}

              {/* Popular Routes */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  POPULAR ROUTES
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_ROUTES.map((route) => (
                    <button
                      key={`${route.from}-${route.to}`}
                      type="button"
                      onClick={() => handleQuickRoute(route.from, route.to)}
                      className="inline-flex items-center gap-1 text-xs bg-muted hover:bg-secondary/80 text-foreground rounded-full px-3 py-1.5 transition-colors font-medium"
                    >
                      {route.from} <ArrowRight className="w-3 h-3" /> {route.to}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-2xl md:text-3xl font-display font-bold text-accent">
                  {stat.value}
                </p>
                <p className="text-sm text-white/70 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold mb-3">
              Why Choose BusGo?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Millions of travelers trust BusGo for their daily and
              long-distance bus journeys.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl font-bold mb-3">
              Ready to Hit the Road?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Book your next bus ticket in under 2 minutes. Fast, easy, and
              secure.
            </p>
            <Button
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-semibold px-8"
            >
              Search Buses Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
