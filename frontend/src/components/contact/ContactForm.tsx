import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { createContactMessage } from '../../services/api';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '', // honeypot anti-spam : doit rester vide
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email est invalide";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
    
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) {
    return;
  }

  setIsSubmitting(true);
  setSubmitError('');

  try {
    await createContactMessage(formData);

    setIsSubmitted(true);

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      website: '',
    });

    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    
    const isNetworkError = error instanceof TypeError;
    setSubmitError(
      isNetworkError
        ? "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez."
        : error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      {isSubmitted ? (
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-2 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Merci !</h3>
          <p className="text-gray-600">
            Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Honeypot anti-spam : invisible pour un humain,
              masqué hors écran, exclu de la tabulation et de
              l'autocomplétion navigateur. */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
          />
          {submitError && (
            <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Nom Complet *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Jean Dupont"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Adresse Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="jean@exemple.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Numéro de Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                Sujet *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`form-input ${errors.subject ? 'border-red-500' : ''}`}
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="General Inquiry">Demande Générale</option>
                <option value="Quote Request">Demande de Devis</option>
                <option value="Product Information">Information Produit</option>
                <option value="Service Information">Information Service</option>
                <option value="Support">Support</option>
              </select>
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`form-input resize-none ${errors.message ? 'border-red-500' : ''}`}
              placeholder="Comment pouvons-nous vous aider ?"
            ></textarea>
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer le Message
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactForm;