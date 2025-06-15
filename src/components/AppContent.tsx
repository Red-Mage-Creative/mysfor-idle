
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { VictoryModal } from "@/components/game/VictoryModal";
import { IntroModal } from "@/components/game/IntroModal";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import AboutPage from "@/pages/About";
import SettingsPage from "@/pages/Settings";
import AchievementsPage from "@/pages/AchievementsPage";
import EndCreditsPage from "@/pages/EndCredits";
import NotFound from "@/pages/NotFound";

export const AppContent = () => {
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
    game?.immediateSave?.(false);
  };

  const handleCloseIntroModal = (dontShowAgain: boolean) => {
    game?.handleCloseIntroModal?.(dontShowAgain);
  };

  if (!game) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <IntroModal isOpen={game.isIntroModalOpen} onClose={handleCloseIntroModal} />
      <VictoryModal isOpen={showVictoryModal} onClose={handleCloseVictoryModal} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="end-credits" element={<EndCreditsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};
