import { CtaSection } from "@/components/landing/cta-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { FloatingHeader } from "@/components/landing/floating-header";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";

export default function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
			<FloatingHeader />
			<main>
				<HeroSection />
				<ProblemSection />
				<FeatureShowcase />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}
