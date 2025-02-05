import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, Medal, Mail, BarChart3, Network, Globe2, Code, Rocket, Gift, Trophy } from "lucide-react";
import Link from 'next/link';
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              Next-Gen Alumni Management
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Empower your institution with AI-driven alumni engagement
            </p>
            <div className="space-x-4">
            <Link href="/login">
  <Button size="lg" className="bg-white hover:bg-gray-100 text-black">
    Start Free Trial
  </Button>
</Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-gray-900">
                <h1 className='text-black'>Watch Demo</h1>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="50k+" label="Active Alumni" />
            <StatCard number="1000+" label="Events Hosted" />
            <StatCard number="98%" label="Satisfaction" />
            <StatCard number="24/7" label="Support" />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Powerful Features for Modern Institutions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-white" />}
            title="Smart Directory"
            description="AI-powered alumni database with advanced filtering and automatic updates"
          />
          <FeatureCard 
            icon={<Calendar className="w-8 h-8 text-white" />}
            title="Event Management"
            description="Seamless event planning with automated reminders and RSVP tracking"
          />
          <FeatureCard 
            icon={<Mail className="w-8 h-8 text-white" />}
            title="Intelligent Communications"
            description="AI-driven personalized emails and engagement scoring"
          />
          <FeatureCard 
            icon={<Network className="w-8 h-8 text-white" />}
            title="Career Network"
            description="Built-in job board and AI-powered mentor matching system"
          />
          <FeatureCard 
            icon={<BarChart3 className="w-8 h-8 text-white" />}
            title="Advanced Analytics"
            description="Real-time dashboards and predictive engagement metrics"
          />
          <FeatureCard 
            icon={<Globe2 className="w-8 h-8 text-white" />}
            title="Global Chapters"
            description="Manage regional groups with automated chapter creation"
          />
        </div>
      </div>

      {/* Integration Section */}
      <div className="border-y border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
            <p className="text-gray-400">Works with your favorite tools</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <IntegrationCard name="Salesforce" />
            <IntegrationCard name="Slack" />
            <IntegrationCard name="Zoom" />
            <IntegrationCard name="LinkedIn" />
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-16">Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="The AI-driven engagement features have transformed how we connect with alumni."
                author="Dr. Sarah Johnson"
                role="Alumni Director, Tech University"
                rating={5}
              />
              <TestimonialCard
                quote="We've seen a 300% increase in alumni participation since implementing this platform."
                author="Michael Chen"
                role="Development Officer, Business School"
                rating={5}
              />
              <TestimonialCard
                quote="The automation features saved our team countless hours of manual work."
                author="Emily Rodriguez"
                role="Community Manager, State College"
                rating={5}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Starter"
              price="$499"
              features={[
                "Up to 5,000 alumni",
                "Basic analytics",
                "Email campaigns",
                "Event management"
              ]}
            />
            <PricingCard 
              tier="Professional"
              price="$999"
              featured={true}
              features={[
                "Up to 25,000 alumni",
                "Advanced analytics",
                "AI-powered engagement",
                "Career network",
                "Premium support"
              ]}
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              features={[
                "Unlimited alumni",
                "Custom features",
                "Dedicated support",
                "API access",
                "White-labeling"
              ]}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-y border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Alumni Network?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join leading institutions already using our platform
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-gray-900">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Roadmap</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API</li>
                <li>Guides</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Card className="bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
};

const TestimonialCard = ({ quote, author, role, rating }) => {
  return (
    <Card className="bg-black border border-white/10">
      <CardContent className="pt-6">
        <div className="flex text-white mb-4">
          {[...Array(rating)].map((_, i) => (
            <Trophy key={i} className="w-4 h-4" />
          ))}
        </div>
        <p className="text-lg mb-4 text-gray-300">"{quote}"</p>
        <p className="font-semibold text-white">{author}</p>
        <p className="text-gray-400">{role}</p>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ number, label }) => {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-white mb-2">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
};

const IntegrationCard = ({ name }) => {
  return (
    <Card className="bg-black border border-white/10">
      <CardContent className="p-6 text-center">
        <h3 className="text-lg font-semibold">{name}</h3>
      </CardContent>
    </Card>
  );
};

const PricingCard = ({ tier, price, features, featured = false }) => {
  return (
    <Card className={`bg-black border ${featured ? 'border-white' : 'border-white/10'}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{tier}</CardTitle>
        <div className="text-center">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-gray-400">/month</span>}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Rocket className="w-5 h-5 text-white mr-2" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className={`w-full mt-6 ${featured ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white border-white hover:bg-gray-900'}`}>
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
};

export default LandingPage;