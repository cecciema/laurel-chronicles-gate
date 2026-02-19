import { Link, useLocation } from "react-router-dom";
import { Home, Globe, Users, Clock, Shield, Map } from "lucide-react";

const bottomNavItems = [
  { path: "/", label: "Home", Icon: Home },
  { path: "/world", label: "World", Icon: Globe },
  { path: "/characters", label: "Chars", Icon: Users },
  { path: "/timeline", label: "Timeline", Icon: Clock },
  { path: "/factions", label: "Factions", Icon: Shield },
  { path: "/map", label: "Map", Icon: Map },
];

const BottomNav = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[140] flex justify-around items-center bg-background/95 backdrop-blur-sm border-t border-border py-2 sm:hidden">
      {bottomNavItems.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] tracking-widest uppercase font-body">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
