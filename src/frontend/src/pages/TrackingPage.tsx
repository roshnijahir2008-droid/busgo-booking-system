import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Bus,
  Clock,
  Compass,
  Gauge,
  MapPin,
  Navigation,
  RefreshCw,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

// Route waypoints for visual simulation
const ROUTE_WAYPOINTS: Record<
  string,
  Array<{ lat: number; lng: number; label: string }>
> = {
  "Bangalore-Mumbai": [
    { lat: 12.9716, lng: 77.5946, label: "Bangalore" },
    { lat: 14.4426, lng: 75.7351, label: "Hubli" },
    { lat: 15.8497, lng: 74.4977, label: "Belgaum" },
    { lat: 16.7054, lng: 74.2433, label: "Kolhapur" },
    { lat: 18.52, lng: 73.8567, label: "Pune" },
    { lat: 19.076, lng: 72.8777, label: "Mumbai" },
  ],
  "Bangalore-Chennai": [
    { lat: 12.9716, lng: 77.5946, label: "Bangalore" },
    { lat: 12.9698, lng: 78.1648, label: "Vellore" },
    { lat: 13.0827, lng: 80.2707, label: "Chennai" },
  ],
};

function SVGRouteMap({
  currentLat,
  currentLng,
  source,
  destination,
}: {
  busId?: string;
  currentLat: number;
  currentLng: number;
  source: string;
  destination: string;
}) {
  const routeKey = `${source}-${destination}`;
  const waypoints = ROUTE_WAYPOINTS[routeKey] ?? [
    { lat: currentLat - 1, lng: currentLng - 1, label: source },
    { lat: currentLat, lng: currentLng, label: "Current" },
    { lat: currentLat + 1, lng: currentLng + 1, label: destination },
  ];

  // Normalize coordinates to SVG space
  const lats = waypoints.map((w) => w.lat);
  const lngs = waypoints.map((w) => w.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const W = 400;
  const H = 250;
  const PADDING = 40;

  function toSVG(lat: number, lng: number) {
    const x =
      PADDING + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 2 * PADDING);
    const y =
      H -
      PADDING -
      ((lat - minLat) / (maxLat - minLat || 1)) * (H - 2 * PADDING);
    return { x, y };
  }

  const pathData = waypoints
    .map((w, i) => {
      const { x, y } = toSVG(w.lat, w.lng);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const busDot = toSVG(currentLat, currentLng);

  return (
    <div
      className="relative bg-blue-50 rounded-xl overflow-hidden border border-blue-100"
      data-ocid="tracking.map_marker"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto max-h-64"
        aria-label="Bus route map"
      >
        <title>Bus route map</title>
        {/* Grid */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`hg-${i * (H / 5)}`}
            x1={0}
            y1={(H / 5) * i}
            x2={W}
            y2={(H / 5) * i}
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={`vg-${i * (W / 8)}`}
            x1={(W / 8) * i}
            y1={0}
            x2={(W / 8) * i}
            y2={H}
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
        ))}

        {/* Route path */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeDasharray="8 4"
          opacity={0.6}
        />
        <path
          d={pathData}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* Waypoint dots */}
        {waypoints.map((w) => {
          const { x, y } = toSVG(w.lat, w.lng);
          return (
            <g key={`${w.label}-${w.lat}`}>
              <circle
                cx={x}
                cy={y}
                r={5}
                fill="white"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize={9}
                fill="#374151"
                fontWeight={600}
              >
                {w.label}
              </text>
            </g>
          );
        })}

        {/* Bus dot */}
        <circle
          cx={busDot.x}
          cy={busDot.y}
          r={12}
          fill="#1d4ed8"
          opacity={0.15}
        />
        <circle
          cx={busDot.x}
          cy={busDot.y}
          r={8}
          fill="#1d4ed8"
          className="animate-pulse-dot"
        />
        <text
          x={busDot.x}
          y={busDot.y + 4}
          textAnchor="middle"
          fontSize={10}
          fill="white"
          fontWeight="bold"
        >
          🚌
        </text>
      </svg>

      <div className="absolute bottom-2 right-2 bg-white/80 rounded-lg px-2 py-1 text-xs text-muted-foreground font-medium">
        Live Tracking
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const { busId } = useParams({ from: "/track/$busId" });
  const navigate = useNavigate();
  const { buses, busLocations, getDriverById, updateBusLocation } = useApp();

  const [selectedBusId, setSelectedBusId] = useState(busId);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const bus = buses.find((b) => b.id === selectedBusId);
  const location = busLocations[selectedBusId];
  const driver = bus?.driverId ? getDriverById(bus.driverId) : null;

  // Navigate on bus change
  useEffect(() => {
    if (selectedBusId !== busId) {
      void navigate({ to: "/track/$busId", params: { busId: selectedBusId } });
    }
  }, [selectedBusId, busId, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));

    if (location) {
      // Simulate small movement
      const newLat = location.lat + (Math.random() - 0.5) * 0.05;
      const newLng = location.lng + (Math.random() - 0.5) * 0.05;
      const newSpeed = 40 + Math.floor(Math.random() * 50);
      updateBusLocation(
        selectedBusId,
        newLat,
        newLng,
        newSpeed,
        location.heading,
      );
    }

    setLastRefresh(new Date());
    setRefreshing(false);
  };

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold mb-2">Bus not found</h2>
          <Button onClick={() => void navigate({ to: "/" })}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Live Bus Tracking
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time location updates for your journey
          </p>
        </div>

        {/* Bus Selector */}
        <div className="flex items-center gap-3 mb-6">
          <Select value={selectedBusId} onValueChange={setSelectedBusId}>
            <SelectTrigger className="w-64" data-ocid="tracking.select">
              <SelectValue placeholder="Select a bus" />
            </SelectTrigger>
            <SelectContent>
              {buses
                .filter((b) => b.active)
                .map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.source} → {b.destination})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
            data-ocid="tracking.primary_button"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bus className="w-4 h-4" />
                    {bus.name} — {bus.source} → {bus.destination}
                  </span>
                  <Badge
                    variant={location ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {location ? "Live" : "Offline"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {location ? (
                  <SVGRouteMap
                    currentLat={location.lat}
                    currentLng={location.lng}
                    source={bus.source}
                    destination={bus.destination}
                  />
                ) : (
                  <div className="h-48 bg-muted rounded-xl flex flex-col items-center justify-center gap-2">
                    <MapPin className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No location data available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bus hasn't started transmitting location
                    </p>
                  </div>
                )}

                {location && (
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Latitude
                      </p>
                      <p className="font-mono font-semibold text-xs">
                        {location.lat.toFixed(4)}°
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Longitude
                      </p>
                      <p className="font-mono font-semibold text-xs">
                        {location.lng.toFixed(4)}°
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Speed
                      </p>
                      <p className="font-mono font-semibold text-xs">
                        {location.speed} km/h
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            {/* Driver Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Driver
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driver ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {driver.phone}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-medium">{driver.experience} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-medium">⭐ {driver.rating}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Trips</p>
                        <p className="font-medium">{driver.trips}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">License</p>
                        <p className="font-medium text-xs break-all">
                          {driver.license}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No driver assigned
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Location Details */}
            {location && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Gauge className="w-3.5 h-3.5" />
                        Speed
                      </div>
                      <span className="font-semibold">
                        {location.speed} km/h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Compass className="w-3.5 h-3.5" />
                        Heading
                      </div>
                      <span className="font-semibold">{location.heading}°</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        Updated
                      </div>
                      <span className="font-medium text-xs">
                        {new Date(location.updatedAt).toLocaleTimeString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Last refreshed: {lastRefresh.toLocaleTimeString("en-IN")}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Bus Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bus className="w-4 h-4" />
                  Bus Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reg. Number</span>
                  <span className="font-mono font-medium">{bus.regNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{bus.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{bus.totalSeats} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departs</span>
                  <span className="font-medium">{bus.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arrives</span>
                  <span className="font-medium">{bus.arrivalTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
