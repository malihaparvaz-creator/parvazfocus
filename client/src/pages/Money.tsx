import { MoneyTracker } from '@/components/MoneyTracker';

export default function Money() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Money Tracker</h1>
          <p className="text-muted-foreground">Track income, expenses, and money flows outside the Creative Zone.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <MoneyTracker />
      </main>
    </div>
  );
}
