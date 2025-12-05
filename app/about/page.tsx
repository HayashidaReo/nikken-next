import { ModernNavbar } from "@/components/organisms/lp/modern-navbar";
import { ModernHero } from "@/components/organisms/lp/modern-hero";
import { BentoGrid } from "@/components/organisms/lp/bento-grid";
import { GallerySection } from "@/components/organisms/lp/gallery-section";
import { ModernFooter } from "@/components/organisms/lp/modern-footer";
import { ContactForm } from "@/components/organisms/lp/contact-form";

export default function LpPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
            <ModernNavbar />
            <main>
                <ModernHero />
                <BentoGrid />
                <GallerySection />
                <ContactForm />
            </main>
            <ModernFooter />
        </div>
    );
}
