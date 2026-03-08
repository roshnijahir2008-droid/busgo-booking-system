import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bus,
  ChevronRight,
  Clock,
  Gauge,
  MapPin,
  Navigation,
  Send,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const TRIP_HISTORY = [
  {
    date: "2026-03-07",
    route: "Bangalore → Mumbai",
    duration: "12h",
    status: "completed",
    rating: 4.8,
  },
  {
    date: "2026-03-05",
    route: "Mumbai → Bangalore",
    duration: "12h",
    status: "completed",
    rating: 4.6,
  },
  {
    date: "2026-03-03",
    route: "Bangalore → Mumbai",
    duration: "12.5h",
    status: "completed",
    rating: 4.7,
  },
  {
    date: "2026-03-01",
    route: "Mumbai → Bangalore",
    duration: "11.5h",
    status: "completed",
    rating: 4.9,
  },
];

export default function DriverPortalPage() {
  const { buses, drivers, busLocations, updateBusLocation, getDriverById } =
    useApp();

  // Default to driver_1 for demo
  const [selectedDriverId, setSelectedDriverId] = useState("driver_1");
  const driver = getDriverById(selectedDriverId);
  const assignedBus = driver?.assignedBusId
    ? buses.find((b) => b.id === driver.assignedBusId)
    : null;
  const currentLocation = assignedBus ? busLocations[assignedBus.id] : null;

  const [lat, setLat] = useState(currentLocation?.lat.toString() ?? "12.9716");
  const [lng, setLng] = useState(currentLocation?.lng.toString() ?? "77.5946");
  const [speed, setSpeed] = useState(currentLocation?.speed.toString() ?? "60");
  const [heading, setHeading] = useState(
    currentLocation?.heading.toString() ?? "315",
  );
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateLocation = async () => {
    if (!assignedBus) {
      toast.error("No bus assigned to this driver");
      return;
    }

    const latNum = Number.parseFloat(lat);
    const lngNum = Number.parseFloat(lng);
    const speedNum = Number.parseFloat(speed);
    const headingNum = Number.parseFloat(heading);

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    updateBusLocation(
      assignedBus.id,
      latNum,
      lngNum,
      speedNum || 0,
      headingNum || 0,
    );
    toast.success("Location updated successfully!");
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary" />
            Driver Portal
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update your bus location and view trip history
          </p>
        </div>

        {/* Driver Selector */}
        <div className="mb-6">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
            Active Driver
          </Label>
          <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
            <SelectTrigger className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}{" "}
                  {d.assignedBusId ? `(${d.assignedBusId})` : "(Available)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {driver && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Driver Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Driver Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
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

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-semibold mt-0.5">
                        {driver.experience} years
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-muted-foreground">Total Trips</p>
                      <p className="font-semibold mt-0.5">{driver.trips}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-semibold mt-0.5 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {driver.rating}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-muted-foreground">Status</p>
                      <Badge
                        variant={driver.assignedBusId ? "default" : "secondary"}
                        className="text-xs mt-0.5"
                      >
                        {driver.assignedBusId ? "On Duty" : "Available"}
                      </Badge>
                    </div>
                  </div>

                  {assignedBus && (
                    <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                        Assigned Bus
                      </p>
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-semibold">
                            {assignedBus.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignedBus.source} → {assignedBus.destination}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location Update Form */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Update Bus Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!assignedBus ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bus className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No bus assigned to this driver</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="lat">Latitude</Label>
                          <Input
                            id="lat"
                            type="number"
                            step="0.0001"
                            placeholder="e.g. 12.9716"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            data-ocid="driver.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lng">Longitude</Label>
                          <Input
                            id="lng"
                            type="number"
                            step="0.0001"
                            placeholder="e.g. 77.5946"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            data-ocid="driver.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="speed">Speed (km/h)</Label>
                          <Input
                            id="speed"
                            type="number"
                            min="0"
                            max="150"
                            placeholder="e.g. 65"
                            value={speed}
                            onChange={(e) => setSpeed(e.target.value)}
                            data-ocid="driver.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="heading">Heading (degrees)</Label>
                          <Input
                            id="heading"
                            type="number"
                            min="0"
                            max="360"
                            placeholder="e.g. 315"
                            value={heading}
                            onChange={(e) => setHeading(e.target.value)}
                            data-ocid="driver.input"
                          />
                        </div>
                      </div>

                      {currentLocation && (
                        <div className="bg-muted/50 rounded-lg p-3 text-xs">
                          <p className="font-semibold text-muted-foreground mb-1.5">
                            Current Transmitted Location
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <p className="text-muted-foreground">Lat</p>
                              <p className="font-mono font-medium">
                                {currentLocation.lat.toFixed(4)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Lng</p>
                              <p className="font-mono font-medium">
                                {currentLocation.lng.toFixed(4)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Speed</p>
                              <p className="font-medium">
                                {currentLocation.speed} km/h
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Updated</p>
                              <p className="font-medium">
                                {new Date(
                                  currentLocation.updatedAt,
                                ).toLocaleTimeString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleUpdateLocation}
                        disabled={submitting}
                        className="w-full font-semibold gap-2"
                        data-ocid="driver.submit_button"
                      >
                        {submitting ? (
                          <>
                            <Gauge className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Update Location
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trip History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Trip History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Route</TableHead>
                        <TableHead className="text-xs">Duration</TableHead>
                        <TableHead className="text-xs">Rating</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TRIP_HISTORY.map((trip, i) => (
                        <TableRow key={`${trip.date}-${i}`}>
                          <TableCell className="text-xs">{trip.date}</TableCell>
                          <TableCell className="text-xs font-medium">
                            {trip.route}
                          </TableCell>
                          <TableCell className="text-xs">
                            {trip.duration}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {trip.rating}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {trip.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
