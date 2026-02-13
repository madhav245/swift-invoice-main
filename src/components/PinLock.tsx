import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

interface PinLockProps {
  onUnlock: () => void;
  isSetup?: boolean;
  onSetPin?: (pin: string) => void;
}

export function PinLock({ onUnlock, isSetup, onSetPin }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (isSetup) {
      if (step === 'enter') {
        if (pin.length < 4) {
          setError('PIN must be at least 4 digits');
          return;
        }
        setStep('confirm');
        setError('');
      } else {
        if (pin !== confirmPin) {
          setError('PINs do not match');
          setConfirmPin('');
          return;
        }
        onSetPin?.(pin);
      }
    } else {
      onUnlock();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex h-16 w-16 items-center justify-center border-2 border-border bg-secondary shadow-sm">
        <Lock className="h-8 w-8 text-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {isSetup ? (step === 'enter' ? 'Set Your PIN' : 'Confirm PIN') : 'Enter PIN'}
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        {isSetup
          ? step === 'enter'
            ? 'Create a PIN to secure your app'
            : 'Enter the PIN again to confirm'
          : 'Enter your PIN to unlock'}
      </p>
      <Input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="••••"
        className="w-48 text-center text-2xl tracking-[0.5em] border-2"
        value={step === 'confirm' ? confirmPin : pin}
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '');
          if (step === 'confirm') setConfirmPin(val);
          else setPin(val);
          setError('');
        }}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      <Button className="w-48 border-2 font-bold" onClick={handleSubmit}>
        {isSetup ? (step === 'enter' ? 'Next' : 'Set PIN') : 'Unlock'}
      </Button>
      {!isSetup && (
        <button
          className="text-xs text-muted-foreground underline"
          onClick={onUnlock}
        >
          Skip (no PIN set)
        </button>
      )}
    </div>
  );
}
