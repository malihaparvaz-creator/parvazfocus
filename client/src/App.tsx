import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { TrackingProvider } from "./contexts/TrackingContext";
import { MusicProvider } from "./contexts/MusicContext";
import { Navigation } from "./components/Navigation";
import Home from "./pages/Home";
import StudyMode from "./pages/StudyMode";
import ProjectMode from "./pages/ProjectMode";
import Settings from "./pages/Settings";
import { TimeReminders, useNotificationPermission } from "./components/TimeReminders";
import { MiniMusicBar } from "./components/MiniMusicBar";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/study"} component={StudyMode} />
      <Route path={"/projects"} component={ProjectMode} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function InnerApp() {
  useNotificationPermission();
  return (
    <>
      <TimeReminders />
      <MiniMusicBar />
      <div className="flex min-h-screen">
        <Navigation />
        {/* Desktop: offset for sidebar. Mobile/tablet: offset for bottom bar */}
        <main className="flex-1 lg:ml-20 pb-16 lg:pb-0 w-full min-w-0">
          <Router />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TrackingProvider>
            <MusicProvider>
              <TooltipProvider>
                <Toaster />
                <InnerApp />
              </TooltipProvider>
            </MusicProvider>
          </TrackingProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
