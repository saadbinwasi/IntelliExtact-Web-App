import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import Integrations from '@/components/Integrations'
import HowItWorks from '@/components/HowItWorks'
import UseCases from '@/components/UseCases'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Integrations />
      <UseCases />
      <CTA />
      <Footer />
    </main>
  )
}
