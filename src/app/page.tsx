
import PriceCalculator from '@/components/price-calculator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-secondary/30">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">PriceRight</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your simple tool for calculating the final selling price of items.
          </p>
        </header>
        <PriceCalculator />
      </div>
    </main>
  );
}
