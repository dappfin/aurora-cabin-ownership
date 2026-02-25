import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrickPurchaseSection from "@/components/BrickPurchaseSection";
import RefundSection from "@/components/RefundSection";
import TreasurySection from "@/components/TreasurySection";
import WaitlistSection from "@/components/WaitlistSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BrickPurchaseSection />
      <RefundSection />
      <TreasurySection />
      <WaitlistSection />
      <Footer />
    </div>
  );
};

export default Index;
