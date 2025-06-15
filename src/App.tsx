
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import AboutPage from "./pages/About";
import SettingsPage from "./pages/Settings";
import { GameProvider, useGame } from "./context/GameContext";
import { useEffect, useState } from "react";
import { VictoryModal } from "./components/game/VictoryModal";
import EndCreditsPage from "./pages/EndCredits";

const queryClient = new QueryClient();

const AppContent = () => {
  const game = useGame();
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  useEffect(() => {
    if (game?.hasBeatenGame && !game?.gameCompletionShown) {
      setShowVictoryModal(true);
    }
  }, [game?.hasBeatenGame, game?.gameCompletionShown]);

  const handleCloseVictoryModal = () => {
    setShowVictoryModal(false);
    game?.setGameCompletionShown?.(true);
    game?.immediateSave?.('victory-modal-closed');
  };

  return (
    <>
      {game && <VictoryModal isOpen={showVictoryModal} onClose={handleCloseVictoryModal} />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="end-credits" element={<EndCreditsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

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
