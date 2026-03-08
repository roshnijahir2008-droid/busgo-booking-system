import { Link } from "@tanstack/react-router";
import { Bus, Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-white mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Bus className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">BusGo</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's trusted bus booking platform. Safe, affordable, and
              on-time travel across the country.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/buses", label: "Search Buses" },
                { to: "/my-bookings", label: "My Bookings" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Popular Routes</h4>
            <ul className="space-y-2">
              {[
                "Bangalore → Mumbai",
                "Bangalore → Chennai",
                "Chennai → Hyderabad",
                "Hyderabad → Bangalore",
                "Mumbai → Pune",
              ].map((route) => (
                <li key={route}>
                  <span className="text-sm text-muted-foreground">{route}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Cancellation Policy",
                "Privacy Policy",
                "Terms of Service",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © {year} BusGo. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
