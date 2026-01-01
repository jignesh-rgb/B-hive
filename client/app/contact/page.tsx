'use client';
import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-500 to-primary-500 text-white">
        <div className="container-max section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-secondary-100 leading-relaxed">
              Have questions about our natural health products? We&apos;re here to help you on your wellness journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="card">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-xl">
                      <FaMapMarkerAlt className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Address</h3>
                      <p className="text-neutral-600">
                        123 Wellness Street<br />
                        Health City, HC 12345<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-xl">
                      <FaPhone className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Phone</h3>
                      <p className="text-neutral-600">
                        +1 (555) 123-4567<br />
                        Mon-Fri: 9AM - 6PM EST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-xl">
                      <FaEnvelope className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Email</h3>
                      <p className="text-neutral-600">
                        hello@b-hive.com<br />
                        support@b-hive.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-xl">
                      <FaClock className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Business Hours</h3>
                      <p className="text-neutral-600">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Preview */}
              <div className="card">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                  Quick Help
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-neutral-800">Shipping Information</h4>
                    <p className="text-sm text-neutral-600">Free shipping on orders over $50. Standard delivery within 3-5 business days.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Returns & Exchanges</h4>
                    <p className="text-sm text-neutral-600">30-day return policy on all products. Items must be unused and in original packaging.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Product Questions</h4>
                    <p className="text-sm text-neutral-600">Our wellness experts are here to help you choose the right products for your needs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="bg-neutral-200 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="text-neutral-400 text-4xl mx-auto mb-4" />
              <p className="text-neutral-500">Interactive map would be displayed here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;