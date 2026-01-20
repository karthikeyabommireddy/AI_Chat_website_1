import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Bot, 
  FileText, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Responses',
    description: 'Get instant, intelligent answers powered by advanced AI that understands context and provides accurate solutions.',
  },
  {
    icon: FileText,
    title: 'Document-Grounded',
    description: 'Our AI is trained on your company documents and FAQs, ensuring responses are always accurate and relevant.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with encrypted data storage and role-based access control.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get responses in seconds, not minutes. Our AI processes your queries instantly.',
  },
  {
    icon: Users,
    title: 'Admin Dashboard',
    description: 'Powerful admin tools to manage documents, FAQs, users, and view conversation analytics.',
  },
  {
    icon: MessageSquare,
    title: 'Chat History',
    description: 'Access your complete conversation history anytime, from any device.',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    content: 'This AI support chat has reduced our support ticket volume by 60%. Customers love getting instant answers!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    content: 'The document grounding feature is a game-changer. Our AI actually knows our product inside and out.',
    rating: 5,
  },
  {
    name: 'Emily Davis',
    role: 'Customer Success',
    content: 'Easy to set up, easy to manage. The admin dashboard gives us all the insights we need.',
    rating: 5,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-secondary-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary-950/80 backdrop-blur-lg border-b border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI Support</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900/50 rounded-full text-primary-300 text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Powered by Advanced AI
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up">
              Customer Support,{' '}
              <span className="gradient-text">Reimagined</span>
            </h1>
            
            <p className="text-xl text-secondary-400 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Empower your customers with instant, intelligent answers. Our AI-powered chat platform 
              delivers accurate responses grounded in your company's knowledge base.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register" className="btn-primary btn-lg gap-2">
                Start Chatting Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary btn-lg">
                Admin Login
              </Link>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-b from-primary-500/20 to-transparent absolute inset-0 rounded-2xl" />
            <div className="bg-secondary-900 border border-secondary-800 rounded-2xl p-4 sm:p-8 shadow-2xl">
              {/* Chat Demo */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-secondary-700 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="bg-secondary-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                    <p className="text-secondary-200">How do I reset my password?</p>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary-600 rounded-2xl rounded-tr-none px-4 py-3 max-w-md">
                    <p className="text-white">
                      To reset your password, click "Forgot Password" on the login page, 
                      enter your email, and follow the link sent to your inbox. The link expires in 24 hours.
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need for Smart Support
            </h2>
            <p className="text-lg text-secondary-400 max-w-2xl mx-auto">
              A complete platform for AI-powered customer support with powerful admin controls.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:border-primary-700 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary-900/50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-900 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-secondary-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-secondary-400 max-w-2xl mx-auto">
              Get started in minutes with our simple setup process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload Documents', desc: 'Add your company docs, FAQs, and knowledge base articles.' },
              { step: '2', title: 'AI Learns', desc: 'Our AI processes and understands your content instantly.' },
              { step: '3', title: 'Customers Chat', desc: 'Users get accurate, instant answers 24/7.' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-secondary-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by Teams Everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-secondary-300 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-sm text-secondary-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Support?
          </h2>
          <p className="text-lg text-secondary-400 mb-8">
            Join thousands of companies using AI to deliver exceptional customer experiences.
          </p>
          <Link to="/register" className="btn-primary btn-lg gap-2">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-secondary-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">AI Support</span>
          </div>
          <p className="text-secondary-500 text-sm">
            © 2026 AI Support Chat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
