import React, { useState } from 'react';
// import ScrollBackground from './components/ScrollBackground'; // Temporär auskommentiert für statisches Hintergrundbild
import Navigation from './components/Navigation';
import AnimatedSection from './components/AnimatedSection';
import './App.css';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Hier würde normalerweise die Form-Verarbeitung stattfinden
    alert('Nachricht gesendet! (Demo)');
    setFormData({ name: '', email: '', message: '' });
  };

  const features: Feature[] = [
    {
      icon: '📍',
      title: 'Echtzeit‑Karte',
      description: 'Interaktive Karte mit allen Coffee‑Spots.'
    },
    {
      icon: '⭐',
      title: 'Bewertungen',
      description: 'Lese und schreibe Bewertungen.'
    },
    {
      icon: '💾',
      title: 'Favoriten',
      description: 'Speichere deine Lieblinge.'
    }
  ];

  return (
    <div className="font-inter min-h-screen text-gray-200 antialiased overflow-x-hidden relative">
      {/* Statisches Hintergrundbild */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/frames2/frame_250.jpg)',
          filter: 'brightness(0.6)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      {/* ScrollBackground - Temporär auskommentiert für statisches Hintergrundbild */}
      {/* <ScrollBackground /> */}
      
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <AnimatedSection id="hero" className="h-screen flex items-center justify-center text-center px-6">
        <div className="container max-w-xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-coffee-light mb-4 font-playfair">
            Erlebe Kaffee neu
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8">
            Tauche ein in eine Welt voller Coffee Spots – interaktiv & fließend.
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('about');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-block bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Mehr erfahren
          </button>
        </div>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection id="about" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-coffee-light mb-6 font-playfair">
            Über uns
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            Wir verbinden Kaffeeliebhaber mit den besten Spots deiner Stadt. 
            Entdecke, bewerte und speichere deine Favoriten – alles nahtlos und fließend.
          </p>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection id="features" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-coffee-light mb-12 font-playfair">
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

      {/* Testimonials Section */}
      <AnimatedSection id="testi" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-coffee-light mb-12 font-playfair">
            Was unsere Nutzer sagen
          </h2>
          <div className="space-y-8 max-w-2xl mx-auto">
            <blockquote className="p-6 bg-black bg-opacity-50 rounded-xl italic text-gray-300">
              „Unglaublich einfach zu bedienen und super stylisch – CoffeeSpots hat meine Kaffeewelt verändert!"
              <footer className="mt-4 text-right font-semibold text-coffee-brown not-italic">
                – Alex
              </footer>
            </blockquote>
            <blockquote className="p-6 bg-black bg-opacity-50 rounded-xl italic text-gray-300">
              „Endlich finde ich neue Spots, die ich ohne diese App nie entdeckt hätte!"
              <footer className="mt-4 text-right font-semibold text-coffee-brown not-italic">
                – Maria
              </footer>
            </blockquote>
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <AnimatedSection id="contact" className="py-20">
        <div className="container mx-auto px-6 max-w-md">
          <h2 className="text-3xl font-bold text-coffee-light mb-6 text-center font-playfair">
            Kontakt
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Dein Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
            />
            <input
              type="email"
              name="email"
              placeholder="Deine Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
            />
            <textarea
              rows={4}
              name="message"
              placeholder="Deine Nachricht"
              value={formData.message}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Absenden
            </button>
          </form>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500">
        &copy; 2025 CoffeeSpots • 
        <button className="hover:text-coffee-brown transition-colors"> Impressum</button> • 
        <button className="hover:text-coffee-brown transition-colors"> Datenschutz</button>
      </footer>
    </div>
  );
};

export default App;
