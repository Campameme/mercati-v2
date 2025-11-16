'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, Store, Calendar, Newspaper, ArrowRight, Users, Building2, Heart, Sparkles, TrendingUp, Shield, Clock, Coffee, HandHeart } from 'lucide-react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const solutionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    
    // Intersection Observer per animazioni al scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section Animata */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white ${
          isVisible ? 'animate-fade-in' : 'opacity-0'
        }`}
      >
        {/* Background Pattern più caldo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23 11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`mb-6 ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
              <Store className="w-16 h-16 mx-auto mb-4 text-amber-200" />
            </div>
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
              isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'
            }`}>
              Il Mercato del Venerdì
              <br />
              <span className="text-amber-200">a portata di mano</span>
            </h1>
            <p className={`text-xl md:text-2xl text-amber-50 mb-8 ${
              isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'
            }`}>
              La tua guida per vivere al meglio il mercato di Ventimiglia
              <br />
              <span className="text-lg text-amber-100">Tradizione e innovazione, insieme per la nostra città</span>
            </p>
            <div className={`flex flex-wrap justify-center gap-4 ${
              isVisible ? 'animate-fade-in-up delay-400' : 'opacity-0'
            }`}>
              <Link
                href="/operators"
                className="px-8 py-4 bg-white text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Scopri le Bancarelle</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/parking"
                className="px-8 py-4 bg-amber-800 text-white rounded-lg font-semibold hover:bg-amber-900 transition-all transform hover:scale-105 shadow-lg border-2 border-amber-300 border-opacity-30"
              >
                Dove Parcheggiare
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Sezione Soluzioni */}
      <section ref={solutionsRef} className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Per il Mercato, per il Comune, per Noi
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Uno strumento pensato per chi vive e ama Ventimiglia, 
              <br />
              <span className="text-lg text-gray-600">dalle bancarelle del venerdì alle piazze del centro</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Soluzione per il Mercato */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-on-scroll border-l-4 border-green-500">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Per chi lavora al Mercato
              </h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start space-x-2">
                  <HandHeart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Fatti trovare più facilmente dai clienti</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>La tua bancarella sulla mappa del venerdì</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Coffee className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Un modo semplice per far conoscere i tuoi prodotti</span>
                </li>
              </ul>
              <Link
                href="/operators"
                className="inline-flex items-center space-x-2 text-green-700 font-semibold hover:text-green-800"
              >
                <span>Vedi la mappa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Soluzione per il Comune */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-on-scroll border-l-4 border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Per il Comune di Ventimiglia
              </h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start space-x-2">
                  <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Resta in contatto con i ventimigliesi</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Condividi eventi e manifestazioni del territorio</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Newspaper className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Comunica avvisi e novità in modo semplice</span>
                </li>
              </ul>
              <Link
                href="/news"
                className="inline-flex items-center space-x-2 text-blue-700 font-semibold hover:text-blue-800"
              >
                <span>Leggi le notizie</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Soluzione per i Cittadini */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-on-scroll border-l-4 border-amber-500">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Per chi vive Ventimiglia
              </h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Non perdere tempo a cercare parcheggio</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Calendar className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Non perdere eventi e manifestazioni</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Store className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Trova subito la bancarella che cerchi</span>
                </li>
              </ul>
              <Link
                href="/parking"
                className="inline-flex items-center space-x-2 text-amber-700 font-semibold hover:text-amber-800"
              >
                <span>Prova subito</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cosa puoi fare
            </h2>
            <p className="text-xl text-gray-600">
              Tutto quello che serve per vivere meglio il mercato del venerdì
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/parking" className="group animate-on-scroll">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 h-full hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Dove Parcheggiare</h3>
                <p className="text-gray-600">
                  Trova subito un posto per la macchina, anche il venerdì di mercato
                </p>
              </div>
            </Link>

            <Link href="/operators" className="group animate-on-scroll">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 h-full hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Le Bancarelle</h3>
                <p className="text-gray-600">
                  Scopri dove sono i tuoi operatori preferiti al mercato
                </p>
              </div>
            </Link>

            <Link href="/calendar" className="group animate-on-scroll">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 h-full hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-700 transition-colors">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Eventi in Città</h3>
                <p className="text-gray-600">
                  Tutti gli appuntamenti da non perdere a Ventimiglia
                </p>
              </div>
            </Link>

            <Link href="/news" className="group animate-on-scroll">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 h-full hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-700 transition-colors">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Notizie dal Comune</h3>
                <p className="text-gray-600">
                  Resta aggiornato su quello che succede in città
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Vieni al Mercato del Venerdì?
            </h2>
            <p className="text-xl text-amber-100 mb-8">
              Trova subito dove parcheggiare, scopri le bancarelle e non perdere gli eventi della settimana
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/operators"
                className="px-8 py-4 bg-white text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Vai alle Bancarelle</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/parking"
                className="px-8 py-4 bg-amber-800 text-white rounded-lg font-semibold hover:bg-amber-900 transition-all transform hover:scale-105 shadow-lg border-2 border-amber-300 border-opacity-30"
              >
                Cerca Parcheggio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .animate-on-scroll.animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}
