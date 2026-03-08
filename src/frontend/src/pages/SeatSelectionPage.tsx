import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Armchair, ArrowLeft, Info } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import type { Seat } from "../types";

function SeatButton({
  seat,
  onToggle,
  index,
}: {
  seat: Seat;
  onToggle: (seat: Seat) => void;
  index: number;
}) {
  const statusClass = {
    available: "seat-available border",
    booked: "seat-booked border",
    selected: "seat-selected border",
  }[seat.status];

  return (
    <button
      type="button"
      disabled={seat.status === "booked"}
      onClick={() => onToggle(seat)}
      className={cn(
        "w-9 h-10 rounded-md text-xs font-bold transition-all duration-150 relative",
        statusClass,
        seat.isWindow && seat.status === "available" && "ring-1 ring-blue-300",
      )}
      title={`Seat ${seat.seatNumber}${seat.isWindow ? " (Window)" : ""}${seat.isUpper ? " (Upper)" : " (Lower)"}`}
      data-ocid={`seatmap.item.${index + 1}`}
    >
      {seat.seatNumber}
    </button>
  );
}

function SeaterLayout({
  seats,
  onToggle,
}: {
  seats: Seat[];
  onToggle: (seat: Seat) => void;
}) {
  const rows = [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <div className="space-y-2">
      {/* Column Header */}
      <div className="flex items-center gap-1 mb-1 pl-8">
        {["A", "B", "aisle", "C", "D"].map((col) => (
          <div
            key={col}
            className={cn(
              "w-9 text-center text-xs font-semibold text-muted-foreground",
              col === "aisle" && "w-5",
            )}
          >
            {col === "aisle" ? "" : col}
          </div>
        ))}
      </div>
      {rows.map((row) => {
        const rowSeats = seats.filter((s) => s.row === row);
        const seatA = rowSeats.find((s) => s.col === "A");
        const seatB = rowSeats.find((s) => s.col === "B");
        const seatC = rowSeats.find((s) => s.col === "C");
        const seatD = rowSeats.find((s) => s.col === "D");

        return (
          <div key={row} className="flex items-center gap-1">
            <span className="w-7 text-xs text-muted-foreground text-right pr-1">
              {row}
            </span>
            {seatA && (
              <SeatButton
                seat={seatA}
                onToggle={onToggle}
                index={seats.indexOf(seatA)}
              />
            )}
            {seatB && (
              <SeatButton
                seat={seatB}
                onToggle={onToggle}
                index={seats.indexOf(seatB)}
              />
            )}
            <div className="w-5" /> {/* Aisle */}
            {seatC && (
              <SeatButton
                seat={seatC}
                onToggle={onToggle}
                index={seats.indexOf(seatC)}
              />
            )}
            {seatD && (
              <SeatButton
                seat={seatD}
                onToggle={onToggle}
                index={seats.indexOf(seatD)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SleeperLayout({
  seats,
  onToggle,
}: {
  seats: Seat[];
  onToggle: (seat: Seat) => void;
}) {
  const rows = [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-1 pl-8">
        <div className="w-14 text-center text-xs font-semibold text-muted-foreground">
          Lower
        </div>
        <div className="w-5" />
        <div className="w-14 text-center text-xs font-semibold text-muted-foreground">
          Upper
        </div>
      </div>
      {rows.map((row) => {
        const rowSeats = seats.filter((s) => s.row === row);
        const seatA = rowSeats.find((s) => s.col === "A");
        const seatB = rowSeats.find((s) => s.col === "B");

        return (
          <div key={row} className="flex items-center gap-2">
            <span className="w-7 text-xs text-muted-foreground text-right pr-1">
              {row}
            </span>
            {seatA && (
              <button
                type="button"
                disabled={seatA.status === "booked"}
                onClick={() => onToggle(seatA)}
                className={cn(
                  "w-14 h-8 rounded-md text-xs font-bold transition-all duration-150",
                  {
                    "seat-available border": seatA.status === "available",
                    "seat-booked border": seatA.status === "booked",
                    "seat-selected border": seatA.status === "selected",
                  },
                )}
                data-ocid={`seatmap.item.${seats.indexOf(seatA) + 1}`}
              >
                {seatA.seatNumber}
              </button>
            )}
            <div className="w-4" />
            {seatB && (
              <button
                type="button"
                disabled={seatB.status === "booked"}
                onClick={() => onToggle(seatB)}
                className={cn(
                  "w-14 h-8 rounded-md text-xs font-bold transition-all duration-150",
                  {
                    "seat-available border": seatB.status === "available",
                    "seat-booked border": seatB.status === "booked",
                    "seat-selected border": seatB.status === "selected",
                  },
                )}
                data-ocid={`seatmap.item.${seats.indexOf(seatB) + 1}`}
              >
                {seatB.seatNumber}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const SERVICE_FEE = 50;
const BUSES_SEARCH = { source: "", destination: "", date: "", seats: 1 };

export default function SeatSelectionPage() {
  const { busId } = useParams({ from: "/buses/$busId/seats" });
  const navigate = useNavigate();
  const {
    getBusById,
    getSeatsByBusId,
    selectSeat,
    deselectSeat,
    selectedSeatIds,
    setSelectedBus,
    setPendingBooking,
    searchQuery,
  } = useApp();

  const bus = getBusById(busId);
  const seats = getSeatsByBusId(busId);
  const selectedSeats = seats.filter(
    (s) => s.status === "selected" || selectedSeatIds.includes(s.id),
  );
  const journeyDate =
    searchQuery?.date ?? new Date().toISOString().split("T")[0];

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold mb-2">Bus not found</h2>
          <Button
            onClick={() =>
              void navigate({ to: "/buses", search: BUSES_SEARCH })
            }
          >
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const isSleeper = bus.type.includes("Sleeper");
  const subtotal = selectedSeats.length * bus.price;
  const total = subtotal + (selectedSeats.length > 0 ? SERVICE_FEE : 0);

  const handleToggle = (seat: Seat) => {
    if (seat.status === "selected") {
      deselectSeat(busId, seat.id);
    } else if (seat.status === "available") {
      selectSeat(busId, seat.id);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;

    setSelectedBus(busId);
    setPendingBooking({
      busId,
      selectedSeatIds: selectedSeats.map((s) => s.id),
      selectedSeatNumbers: selectedSeats.map((s) => s.seatNumber),
      journeyDate,
      totalAmount: total,
    });

    void navigate({ to: "/booking" });
  };

  return (
    <main className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              void navigate({ to: "/buses", search: BUSES_SEARCH })
            }
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold">{bus.name}</h1>
            <p className="text-sm text-muted-foreground">
              {bus.source} → {bus.destination} · {bus.departureTime} -{" "}
              {bus.arrivalTime}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {bus.type}
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat Map */}
          <div className="flex-1">
            <div
              className="bg-card rounded-xl shadow-card border border-border p-6"
              data-ocid="seatmap.canvas_target"
            >
              {/* Legend */}
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md seat-available border border-green-400" />
                  <span className="text-xs text-muted-foreground">
                    Available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md seat-booked border border-gray-400" />
                  <span className="text-xs text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md seat-selected border" />
                  <span className="text-xs text-muted-foreground">
                    Selected
                  </span>
                </div>
                {!isSleeper && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md seat-available border ring-1 ring-blue-300" />
                    <span className="text-xs text-muted-foreground">
                      Window
                    </span>
                  </div>
                )}
              </div>

              {/* Bus front indicator */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
                  <Armchair className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Driver Cabin
                  </span>
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Seat Grid */}
              <div className="overflow-x-auto">
                {isSleeper ? (
                  <SleeperLayout seats={seats} onToggle={handleToggle} />
                ) : (
                  <SeaterLayout seats={seats} onToggle={handleToggle} />
                )}
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Click on an available seat to select/deselect it.</span>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-card rounded-xl shadow-card border border-border p-5 sticky top-20">
              <h3 className="font-display font-bold text-base mb-4">
                Booking Summary
              </h3>

              {selectedSeats.length === 0 ? (
                <div className="text-center py-8">
                  <Armchair className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No seats selected yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click on a seat to select it
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Selected Seats
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center bg-primary/10 text-primary rounded-md px-2 py-0.5 text-sm font-semibold"
                        >
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {selectedSeats.length} × ₹
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
                      <span>Total</span>
                      <span>₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-0.5">
                    <p>
                      <span className="font-medium">Journey Date:</span>{" "}
                      {journeyDate}
                    </p>
                    <p>
                      <span className="font-medium">Route:</span> {bus.source} →{" "}
                      {bus.destination}
                    </p>
                  </div>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedSeats.length > 0 ? 1 : 0.5 }}
                className="mt-4"
              >
                <Button
                  className="w-full font-semibold"
                  size="lg"
                  disabled={selectedSeats.length === 0}
                  onClick={handleContinue}
                  data-ocid="booking.submit_button"
                >
                  Continue ({selectedSeats.length} seat
                  {selectedSeats.length !== 1 ? "s" : ""})
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
