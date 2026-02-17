import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WorldOverview from "./pages/WorldOverview";
import Characters from "./pages/Characters";
import Timeline from "./pages/Timeline";
import Factions from "./pages/Factions";
import WorldMap from "./pages/WorldMap";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/world" element={<WorldOverview />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/factions" element={<Factions />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
