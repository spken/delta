import { ThemeToggle } from '../shared/ThemeToggle';
import { Logo } from '../shared/Logo';

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 container mx-auto max-w-5xl">
        <h1 className="text-base font-semibold">DELTA</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
