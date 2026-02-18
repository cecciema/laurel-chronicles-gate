import { ReactNode } from "react";
import Navigation from "./Navigation";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-[60px] sm:pb-0">
      <Navigation />
      <main>{children}</main>
      <footer className="border-t border-border py-8 px-4 text-center">
        <p className="font-display text-xs tracking-[0.3em] text-muted-foreground">
          LAUREL CROWNS ABOVE — A LIVING WORLD
        </p>
        <p className="mt-2 text-xs text-muted-foreground/60 font-body">
          © 2026 All Rights Reserved. This is an original intellectual property.
        </p>
      </footer>
      <BottomNav />
    </div>
  );
};

export default Layout;
