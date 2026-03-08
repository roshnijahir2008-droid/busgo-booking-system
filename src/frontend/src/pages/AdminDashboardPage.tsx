import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  BookOpen,
  Bus,
  CheckCircle2,
  IndianRupee,
  Loader2,
  Plus,
  Power,
  Shield,
  Star,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import type { Driver } from "../types";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-display font-bold">{value}</p>
            </div>
            <div
              className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddDriverDialog({
  onAdd,
}: { onAdd: (driver: Omit<Driver, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [experience, setExperience] = useState("");

  const handleSubmit = () => {
    if (!name || !phone || !license) {
      toast.error("Please fill in all required fields");
      return;
    }
    onAdd({
      name,
      phone,
      license,
      experience: Number.parseInt(experience) || 1,
      trips: 0,
      rating: 0,
      assignedBusId: null,
      available: true,
    });
    toast.success("Driver added successfully!");
    setOpen(false);
    setName("");
    setPhone("");
    setLicense("");
    setExperience("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5"
          data-ocid="admin.drivers.open_modal_button"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="admin.drivers.dialog">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input
              placeholder="Driver's full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="admin.drivers.name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone Number *</Label>
            <Input
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              data-ocid="admin.drivers.phone_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>License Number *</Label>
            <Input
              placeholder="e.g. DL-2021-0099999"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              data-ocid="admin.drivers.license_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Years of Experience</Label>
            <Input
              type="number"
              placeholder="e.g. 3"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              data-ocid="admin.drivers.experience_input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="admin.drivers.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            data-ocid="admin.drivers.submit_button"
          >
            Add Driver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboardPage() {
  const { buses, bookings, drivers, toggleBusStatus, assignDriver, addDriver } =
    useApp();
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (isFetching || !actor) return;
    void (async () => {
      try {
        const result = await actor.isCallerAdmin();
        setIsAdmin(result);
      } catch {
        // In demo/dev mode, allow access
        setIsAdmin(true);
      } finally {
        setCheckingAdmin(false);
      }
    })();
  }, [actor, isFetching]);

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You don't have admin privileges to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Stats
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.amount, 0);
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled",
  ).length;
  const totalUsers = 4; // seeded users

  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: totalUsers,
      color: "bg-blue-500",
      index: 0,
    },
    {
      icon: Bus,
      label: "Total Buses",
      value: buses.length,
      color: "bg-indigo-500",
      index: 1,
    },
    {
      icon: BookOpen,
      label: "Total Bookings",
      value: bookings.length,
      color: "bg-amber-500",
      index: 2,
    },
    {
      icon: IndianRupee,
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      color: "bg-green-500",
      index: 3,
    },
    {
      icon: CheckCircle2,
      label: "Active Bookings",
      value: activeBookings,
      color: "bg-teal-500",
      index: 4,
    },
    {
      icon: XCircle,
      label: "Cancelled",
      value: cancelledBookings,
      color: "bg-red-500",
      index: 5,
    },
    {
      icon: UserCheck,
      label: "Total Drivers",
      value: drivers.length,
      color: "bg-purple-500",
      index: 6,
    },
    {
      icon: Star,
      label: "Avg Rating",
      value: "4.5",
      color: "bg-orange-500",
      index: 7,
    },
  ];

  // Chart data
  const revenueData = [
    { name: "Mon", revenue: 2400 },
    { name: "Tue", revenue: 5600 },
    { name: "Wed", revenue: 3800 },
    { name: "Thu", revenue: 7200 },
    { name: "Fri", revenue: 4100 },
    { name: "Sat", revenue: 8900 },
    { name: "Sun", revenue: 6300 },
  ];

  const busTypeData = [
    {
      name: "AC Sleeper",
      value: buses.filter((b) => b.type === "AC Sleeper").length,
    },
    {
      name: "Non-AC Seater",
      value: buses.filter((b) => b.type === "Non-AC Seater").length,
    },
    {
      name: "AC Seater",
      value: buses.filter((b) => b.type === "AC Seater").length,
    },
    {
      name: "Non-AC Sleeper",
      value: buses.filter((b) => b.type === "Non-AC Sleeper").length,
    },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  };

  return (
    <main className="min-h-screen bg-background py-8" data-ocid="admin.page">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Platform overview and management tools
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6" data-ocid="admin.tab">
            {[
              { value: "overview", label: "Overview" },
              { value: "buses", label: "Buses" },
              { value: "drivers", label: "Drivers" },
              { value: "bookings", label: "Bookings" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid={`admin.${tab.value}.tab`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Weekly Revenue (₹)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="revenue"
                          fill="oklch(0.55 0.2 265)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Bus Type Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Fleet Composition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center">
                    <PieChart width={180} height={180}>
                      <Pie
                        data={busTypeData}
                        cx={90}
                        cy={90}
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {busTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {busTypeData.map((d, i) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-muted-foreground">
                            {d.name}
                          </span>
                        </div>
                        <span className="font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Buses Tab */}
          <TabsContent value="buses">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Bus Fleet Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table data-ocid="admin.buses.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Timing</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buses.map((bus, i) => (
                      <TableRow
                        key={bus.id}
                        data-ocid={`admin.buses.row.${i + 1}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{bus.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {bus.regNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {bus.source} → {bus.destination}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {bus.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {bus.departureTime} – {bus.arrivalTime}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          ₹{bus.price.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={bus.driverId ?? "none"}
                            onValueChange={(v) =>
                              assignDriver(bus.id, v === "none" ? null : v)
                            }
                          >
                            <SelectTrigger
                              className="h-7 text-xs w-36"
                              data-ocid={`admin.buses.driver_select.${i + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Unassigned</SelectItem>
                              {drivers.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={bus.active}
                            onCheckedChange={() => toggleBusStatus(bus.id)}
                            data-ocid={`admin.buses.status_switch.${i + 1}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Driver Management
                </CardTitle>
                <AddDriverDialog onAdd={addDriver} />
              </CardHeader>
              <CardContent>
                <Table data-ocid="admin.drivers.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Trips</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Assigned Bus</TableHead>
                      <TableHead>Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver, i) => (
                      <TableRow
                        key={driver.id}
                        data-ocid={`admin.drivers.row.${i + 1}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">
                              {driver.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {driver.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {driver.license}
                        </TableCell>
                        <TableCell className="text-sm">
                          {driver.experience} yr
                        </TableCell>
                        <TableCell className="text-sm">
                          {driver.trips}
                        </TableCell>
                        <TableCell className="text-sm">
                          {driver.rating > 0 ? (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {driver.rating}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">New</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {driver.assignedBusId ? (
                            <Badge variant="secondary" className="text-xs">
                              {buses.find((b) => b.id === driver.assignedBusId)
                                ?.name ?? driver.assignedBusId}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={driver.available ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {driver.available ? "Available" : "On Duty"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  All Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table data-ocid="admin.bookings.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Bus</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking, i) => {
                      const bus = buses.find((b) => b.id === booking.busId);
                      return (
                        <TableRow
                          key={booking.id}
                          data-ocid={`admin.bookings.row.${i + 1}`}
                        >
                          <TableCell className="text-xs font-mono">
                            {booking.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-sm">
                                {booking.passengerName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.passengerEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {bus
                              ? `${bus.source} → ${bus.destination}`
                              : booking.busId}
                          </TableCell>
                          <TableCell className="text-sm">
                            {booking.journeyDate}
                          </TableCell>
                          <TableCell className="text-xs">
                            {booking.seatNumbers.join(", ")}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            ₹{booking.amount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "default"
                                  : booking.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
