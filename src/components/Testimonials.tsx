import React from 'react';
import { Star, User } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Marie L.",
      role: "Investisseuse particulière",
      avatar: "👩‍💼",
      text: "Grâce à MaximusSCPI, j'ai pu diversifier mon patrimoine en toute sérénité. L'analyse IA m'a permis de sélectionner les meilleures SCPI selon mon profil.",
      rating: 5
    },
    {
      name: "Pierre M.",
      role: "Chef d'entreprise",
      avatar: "👨‍💼",
      text: "Interface claire, conseils pertinents et accompagnement d'Eric exceptionnel. Mes revenus SCPI ont augmenté de 30% depuis que j'utilise la plateforme.",
      rating: 5
    },
    {
      name: "Sophie D.",
      role: "Cadre supérieure",
      avatar: "👩‍🎓",
      text: "En tant que débutante en SCPI, j'apprécie la transparence totale et les explications claires. Le simulateur IA est un vrai plus pour optimiser mes choix.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Témoignages authentiques d'investisseurs qui nous font confiance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-600"
            >
              {/* Rating Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 dark:text-gray-200 text-center mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <span className="text-xl">{testimonial.avatar}</span>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Rejoignez plus de 500 investisseurs qui nous font confiance
          </p>
          <button
            onClick={() => {
              if (window.openRdvModal) {
                window.openRdvModal();
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
          >
            <User className="w-5 h-5" />
            Prendre rendez-vous gratuitement
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;