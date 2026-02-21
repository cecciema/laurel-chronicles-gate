import { ReactNode } from "react";
import Navigation from "./Navigation";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import ParticleCanvas from "./ParticleCanvas";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-[60px] sm:pb-0 flex flex-col">
      <Navigation />
      <ParticleCanvas density={0.5} />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Layout;
