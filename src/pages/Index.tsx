import { Link } from 'react-router-dom';
import { Play, Radio, Trophy, Zap, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import logo from '@/assets/bw-logo-text.png';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 lg:py-24">
        <div className="container max-w-5xl text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Ball Watching" className="h-16 md:h-20 w-auto" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Every Goal.{' '}
            <span className="text-primary">Every Second.</span>
            <br />
            <span className="text-gold">Live.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Stream live football with real-time scores, goal alerts, and play-by-play updates. 
            One screen. All the action.
          </p>

          {/* CTA */}
          <Link
            to="/watch"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-primary/25"
          >
            <Play className="w-5 h-5" />
            Watch Live
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Live indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm">Currently broadcasting</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/50">
        <div className="container max-w-6xl px-4 py-16 lg:py-24">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="broadcast-card p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Live Stream</h3>
              <p className="text-muted-foreground text-sm">
                High-quality video stream featuring all the matches you care about.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="broadcast-card p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-gold/10 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Live Scores</h3>
              <p className="text-muted-foreground text-sm">
                Real-time scores from all major leagues, updated every second.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="broadcast-card p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-coral/10 flex items-center justify-center">
                <Radio className="w-7 h-7 text-coral" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Instant Alerts</h3>
              <p className="text-muted-foreground text-sm">
                Goals, red cards, and key moments delivered as they happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-t border-border">
        <div className="container max-w-4xl px-4 py-12">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary font-display">5s</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">Update Speed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold font-display">50+</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">Leagues</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-coral font-display">24/7</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logo} alt="Ball Watching" className="h-6 w-auto opacity-60" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ball Watching. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
