import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { isPinSet, verifyPin, isUnlocked, setUnlocked, getSettings } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ClientsPage from "./pages/ClientsPage";
import InvoicesPage from "./pages/InvoicesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        setUnlocked(true);
        onUnlock();
      } else {
        setError('Wrong PIN');
        setPin('');
      }
    } catch (err) {
      setError('Error verifying PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex h-16 w-16 items-center justify-center border-2 border-border bg-secondary shadow-sm">
        <Lock className="h-8 w-8 text-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Enter PIN</h1>
      <Input
        type="password"
        inputMode="numeric"
        maxLength={6}
        placeholder="••••"
        className="w-48 text-center text-2xl tracking-[0.5em] border-2"
        value={pin}
        onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      <Button className="w-48 border-2 font-bold" onClick={handleSubmit} disabled={loading}>{loading ? 'Verifying...' : 'Unlock'}</Button>
    </div>
  );
}

const App = () => {
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const pinSet = await isPinSet();
        const unlocked = isUnlocked();
        setLocked(pinSet && !unlocked);
        
        const settings = await getSettings();
        if (settings.darkMode) document.documentElement.classList.add('dark');
      } catch (err) {
        console.error('Error initializing app:', err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (locked) return <PinScreen onUnlock={() => setLocked(false)} />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
