import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Bus,
  LogOut,
  MapPin,
  Menu,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, isLoggingIn, identity } = useInternetIdentity();
  const { currentUser, setCurrentUser } = useApp();
  const navigate = useNavigate();

  const isLoggedIn = !!identity || !!currentUser;
  const principal =
    identity?.getPrincipal().toString() ?? currentUser?.principal ?? "";
  const shortPrincipal =
    principal.length > 8 ? `${principal.slice(0, 8)}...` : principal;

  const handleLogout = () => {
    clear();
    setCurrentUser(null);
    void navigate({ to: "/" });
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/my-bookings", label: "My Bookings" },
    { to: "/track/bus_1", label: "Track Bus" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md shadow-xs">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Bus className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            Bus
            <span
              className="text-accent-foreground"
              style={{ color: "oklch(0.65 0.18 75)" }}
            >
              Go
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-ocid={`nav.${link.label.toLowerCase().replace(" ", "_")}.link`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {shortPrincipal.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {shortPrincipal}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/driver"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    Driver Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="sm"
              className="font-semibold"
              data-ocid="nav.login.button"
            >
              <User className="w-4 h-4 mr-1.5" />
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((p) => !p)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border bg-white",
          mobileOpen ? "max-h-64" : "max-h-0",
        )}
      >
        <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="py-2 px-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <>
              <Link
                to="/driver"
                className="py-2 px-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Driver Portal
              </Link>
              <Link
                to="/admin"
                className="py-2 px-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Admin Dashboard
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
