import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  BusFront,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Droplets,
  SlidersHorizontal,
  Star,
  Tv,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Bus } from "../types";

const AMENITY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  WiFi: Wifi,
  Charging: Zap,
  AC: Wind,
  Water: Droplets,
  TV: Tv,
  Snacks: Coffee,
};

function AmenityIcon({ name }: { name: string }) {
  const Icon = AMENITY_ICONS[name];
  if (!Icon) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      {name}
    </span>
  );
}

function getDuration(dep: string, arr: string): string {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  let mins = ah * 60 + am - (dh * 60 + dm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m > 0 ? `${m}m` : ""}`;
}

function BusCard({
  bus,
  index,
  availableSeats,
  onSelect,
}: {
  bus: Bus;
  index: number;
  availableSeats: number;
  onSelect: () => void;
}) {
  const isAC = bus.type.includes("AC");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 border border-border"
      data-ocid={`buses.item.${index + 1}`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Bus Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-base">{bus.name}</h3>
            <Badge variant={isAC ? "default" : "secondary"} className="text-xs">
              {bus.type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{bus.regNumber}</p>

          {/* Route & Timing */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xl font-display font-bold">
                {bus.departureTime}
              </p>
              <p className="text-xs text-muted-foreground">{bus.source}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-1">
                {getDuration(bus.departureTime, bus.arrivalTime)}
              </p>
              <div className="w-full flex items-center gap-1">
                <div className="h-px flex-1 bg-border" />
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="h-px flex-1 bg-border" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Direct</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-display font-bold">
                {bus.arrivalTime}
              </p>
              <p className="text-xs text-muted-foreground">{bus.destination}</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-3 mt-3">
            {bus.amenities.map((a) => (
              <AmenityIcon key={a} name={a} />
            ))}
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="hidden md:block h-20 self-center"
        />

        {/* Price & Book */}
        <div className="md:text-right flex md:flex-col items-center md:items-end justify-between gap-3 md:min-w-[140px]">
          <div>
            <div className="flex items-center gap-1 md:justify-end mb-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{bus.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {availableSeats} seats left
            </p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">
              ₹{bus.price.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mb-2">per seat</p>
            <Button
              size="sm"
              onClick={onSelect}
              className="w-full md:w-auto font-semibold"
              disabled={availableSeats === 0}
              data-ocid={`buses.select.button.${index + 1}`}
            >
              {availableSeats === 0 ? "Sold Out" : "Select Seats"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BusListPage() {
  const search = useSearch({ from: "/buses" });
  const navigate = useNavigate();
  const { buses, getSeatsByBusId, setSelectedBus } = useApp();

  // Filters
  const [showFilters, setShowFilters] = useState(true);
  const [acFilter, setAcFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("departure");

  const searchSource = (search as { source?: string }).source ?? "";
  const searchDest = (search as { destination?: string }).destination ?? "";
  const searchDate = (search as { date?: string }).date ?? "";

  const filteredBuses = useMemo(() => {
    let result = buses.filter(
      (b) =>
        b.active &&
        (!searchSource ||
          b.source.toLowerCase() === searchSource.toLowerCase()) &&
        (!searchDest ||
          b.destination.toLowerCase() === searchDest.toLowerCase()),
    );

    if (acFilter.length > 0) {
      result = result.filter((b) => {
        const isAC = b.type.includes("AC");
        return (
          (acFilter.includes("ac") && isAC) ||
          (acFilter.includes("non-ac") && !isAC)
        );
      });
    }

    if (typeFilter.length > 0) {
      result = result.filter((b) => {
        const isSleeper = b.type.includes("Sleeper");
        return (
          (typeFilter.includes("sleeper") && isSleeper) ||
          (typeFilter.includes("seater") && !isSleeper)
        );
      });
    }

    result = result.filter(
      (b) => b.price >= priceRange[0] && b.price <= priceRange[1],
    );

    if (sortBy === "price-asc")
      result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc")
      result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "departure") {
      result = [...result].sort((a, b) =>
        a.departureTime.localeCompare(b.departureTime),
      );
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    buses,
    searchSource,
    searchDest,
    acFilter,
    typeFilter,
    priceRange,
    sortBy,
  ]);

  const getAvailableSeats = (busId: string) => {
    return getSeatsByBusId(busId).filter((s) => s.status === "available")
      .length;
  };

  const handleSelectBus = (busId: string) => {
    setSelectedBus(busId);
    void navigate({ to: "/buses/$busId/seats", params: { busId } });
  };

  const toggleFilter = (
    arr: string[],
    val: string,
    setter: (v: string[]) => void,
  ) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <main className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {searchSource && searchDest ? (
              <h1 className="font-display text-2xl font-bold">
                {searchSource} → {searchDest}
              </h1>
            ) : (
              <h1 className="font-display text-2xl font-bold">
                All Available Buses
              </h1>
            )}
            {searchDate && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {new Date(searchDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 h-9" data-ocid="buses.filter.tab">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="departure">Departure Time</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((p) => !p)}
              className="hidden md:flex gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-card rounded-xl shadow-card p-5 border border-border sticky top-20">
                <h3 className="font-semibold text-sm mb-4">Filters</h3>

                {/* AC Type */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                    Air Conditioning
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: "ac", label: "AC" },
                      { id: "non-ac", label: "Non-AC" },
                    ].map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`ac-${opt.id}`}
                          checked={acFilter.includes(opt.id)}
                          onCheckedChange={() =>
                            toggleFilter(acFilter, opt.id, setAcFilter)
                          }
                          data-ocid={`buses.ac_${opt.id}.checkbox`}
                        />
                        <Label
                          htmlFor={`ac-${opt.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seat Type */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                    Seat Type
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: "sleeper", label: "Sleeper" },
                      { id: "seater", label: "Seater" },
                    ].map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`type-${opt.id}`}
                          checked={typeFilter.includes(opt.id)}
                          onCheckedChange={() =>
                            toggleFilter(typeFilter, opt.id, setTypeFilter)
                          }
                          data-ocid={`buses.type_${opt.id}.checkbox`}
                        />
                        <Label
                          htmlFor={`type-${opt.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                    Price Range
                  </p>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={2000}
                    step={50}
                    className="mb-2"
                    data-ocid="buses.price.toggle"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setAcFilter([]);
                    setTypeFilter([]);
                    setPriceRange([0, 2000]);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </aside>
          )}

          {/* Bus List */}
          <div className="flex-1 min-w-0" data-ocid="buses.list">
            {filteredBuses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-xl shadow-card p-16 text-center border border-border"
                data-ocid="buses.empty_state"
              >
                <BusFront className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">
                  No Buses Found
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  No buses match your search criteria. Try adjusting filters or
                  search for a different route.
                </p>
                <Button
                  variant="outline"
                  onClick={() => void navigate({ to: "/" })}
                >
                  Back to Search
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing <strong>{filteredBuses.length}</strong> bus
                  {filteredBuses.length !== 1 ? "es" : ""}
                </p>
                {filteredBuses.map((bus, i) => (
                  <BusCard
                    key={bus.id}
                    bus={bus}
                    index={i}
                    availableSeats={getAvailableSeats(bus.id)}
                    onSelect={() => handleSelectBus(bus.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
