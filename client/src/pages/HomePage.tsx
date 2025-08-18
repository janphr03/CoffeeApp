import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AnimatedSection from '../components/AnimatedSection';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const HomePage: React.FC = () => {
  const features: Feature[] = [
    {
      icon: '📍',
      title: 'Echtzeit-Karte',
      description: 'Interaktive Karte mit allen Coffee-Spots.'
    },
    {
      icon: '⭐',
      title: 'Favoriten',
      description: 'Speichere deine Lieblinge.'
    },
    {
      icon: '📱',
      title: 'Responsivität',
      description: 'Optimale Darstellung auf allen Geräten.'
    }
  ];

  return (
    <div className="font-inter min-h-screen text-gray-200 antialiased overflow-x-hidden relative">
      {/* Hintergrundbild */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/frames2/frame_250.jpg)',
          filter: 'brightness(0.6)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <AnimatedSection id="hero" className="h-screen flex items-center justify-center text-center px-6">
        <div className="container max-w-xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-coffee-light mb-4">
            Erlebe Kaffee neu
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8">
            Tauche ein in eine Welt voller Coffee Spots - interaktiv & personalisiert.
          </p>
          <Link
            to="/map"
            className="inline-block bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Map öffnen
          </Link>
        </div>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection id="about" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-coffee-light mb-6">
            Über uns
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            Wir verbinden Kaffeeliebhaber mit den besten Spots deiner Stadt. 
            Entdecke neue Cafés und speichere deine Favoriten - alles nahtlos und personalisiert.
          </p>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection id="features" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-coffee-light mb-12">
            Unsere Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature: Feature, index: number) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-black bg-opacity-50 hover:bg-opacity-60 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-5xl text-coffee-brown mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-coffee-light mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Kontakt Section */}
      <AnimatedSection id="contact" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-coffee-light mb-6">
            Kontakt
          </h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-300 mb-4">
              Haben Sie noch Fragen oder brauchen Sie Hilfe? 
            </p>
            <p className="text-lg text-gray-300">
              Dann senden Sie uns gerne eine Mail!
            </p>
            <a 
              href="mailto:contact@coffeespots.com"
              className="inline-block mt-4 text-xl font-semibold text-coffee-light hover:text-coffee-brown transition-colors duration-300"
            >
              contact@coffeespots.com
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* Standard-Footer zum Abrunden, ein richtiges Impressum etc. hielten wir für unnötig */}
      <footer className="py-6 text-center text-gray-500">
        &copy; 2025 CoffeeSpots • 
        <button className="hover:text-coffee-brown transition-colors"> Impressum</button> • 
        <button className="hover:text-coffee-brown transition-colors"> Datenschutz</button>
      </footer>
    </div>
  );
};

export default HomePage;
