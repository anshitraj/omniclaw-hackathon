import Hero from '@/components/hero/Hero';
import ArchitectureSection from '@/components/hero/ArchitectureSection';
import DeveloperSection from '@/components/hero/DeveloperSection';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ArchitectureSection />
      <DeveloperSection />

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-violet)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              OmniClaw Console
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            Built for the Arc + Circle Agentic Commerce Hackathon
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span>Arc Testnet</span>
            <span>·</span>
            <span>Circle Wallets</span>
            <span>·</span>
            <span>USDC</span>
            <span>·</span>
            <span>x402 Protocol</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
