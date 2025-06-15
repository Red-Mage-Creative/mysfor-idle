
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import { AppContent } from "./components/AppContent";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <Sonner />
          <AppContent />
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
