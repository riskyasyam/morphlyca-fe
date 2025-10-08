import React from 'react';

const PricingSection = () => {
  return (
    <section id='pricing' className="bg-black overflow-hidden relative text-white py-20 px-4">
        <div className="absolute top-0 right-[-100px] w-96 h-96 bg-gray-500/20 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium mb-4">
            Exclusive price plan that fits you
          </h2>
          <p className="text-white text-sm">
            we provide a very simple and transparent pricing model
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="relative rounded-2xl p-8 border border-gray-700 bg-[url('/images/basic_plan.svg')] backdrop-blur-sm hover:scale-[1.03] transition-transform ">
            <div className="mb-6">
              <h3 className="text-white/80 text-sm mb-2">Basic Plan</h3>
              <div className="text-4xl font-bold mb-2">Free</div>
              <p className="text-white/70 text-sm">
                ideal for you who like to explore and expressing self
              </p>
            </div>

            <button className="w-full bg-transparent border border-gray-500 text-white py-3 rounded-lg mb-4 hover:bg-gradient-to-r from-green-primary via-green-foreground to-green-secondary hover:text-black font-medium text-sm transition-colors">
              Get Started
            </button>

            <div className="text-center mb-6">
              <a href="#" className="text-white/60 text-sm underline hover:text-white/80">
                Book a call for more details
              </a>
            </div>

            <div>
              <h4 className="text-white/90 font-medium mb-4">What is included</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• 30 second max video duration</li>
                <li>• 480p max resolution</li>
                <li>• 1 concurrency</li>
                <li>• 2 max processor per job</li>
                <li>• 3 max weight per job</li>
                <li>• 10 daily weight quota</li>
                <li>• Watermark</li>
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative rounded-2xl p-8 border border-gray-700 bg-[url('/images/basic_plan.svg')] backdrop-blur-sm hover:scale-[1.03] transition-transform">
            <div className="mb-6">
              <h3 className="text-white/80 text-sm mb-2">Premium Plan</h3>
              <div className="text-4xl font-bold mb-1">
                $25<span className="text-lg font-normal text-white/70">/Month</span>
              </div>
              <p className="text-white/70 text-sm">
                ideal for you who using it for Professional personal use
              </p>
            </div>

              <button className="w-full bg-transparent border border-gray-500 text-white py-3 rounded-lg mb-4 hover:bg-gradient-to-r from-green-primary via-green-foreground to-green-secondary hover:text-black font-medium text-sm transition-colors">
              Get Started
            </button>

            <div className="text-center mb-6">
              <a href="#" className="text-white/60 text-sm underline hover:text-white/80">
                Book a call for more details
              </a>
            </div>

            <div>
              <h4 className="text-white/90 font-medium mb-4">What is included</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• 60 second max video duration</li>
                <li>• 720p max resolution</li>
                <li>• 2 concurrency</li>
                <li>• 3 max processor per job</li>
                <li>• 5 max weight per job</li>
                <li>• 25 daily weight quota</li>
                <li>• Watermark</li>
              </ul>
            </div>
          </div>

          {/* Professional Plan */}
          <div className="relative rounded-2xl p-8 border border-gray-700 bg-[url('/images/basic_plan.svg')] backdrop-blur-sm hover:scale-[1.03] transition-transform">
            <div className="mb-6">
              <h3 className="text-white/80 text-sm mb-2">Professional Plan</h3>
              <div className="text-4xl font-bold mb-1">
                $100<span className="text-lg font-normal text-white/70">/Month</span>
              </div>
              <p className="text-white/70 text-sm">
                ideal for bigscale usecase like company or Agency
              </p>
            </div>

             <button className="w-full bg-transparent border border-gray-500 text-white py-3 rounded-lg mb-4 hover:bg-gradient-to-r from-green-primary via-green-foreground to-green-secondary hover:text-black font-medium text-sm transition-colors">
              Get Started
            </button>

            <div className="text-center mb-6">
              <a href="#" className="text-white/60 text-sm underline hover:text-white/80">
                Book a call for more details
              </a>
            </div>

            <div>
              <h4 className="text-white/90 font-medium mb-4">What is included</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• 120 second max video duration</li>
                <li>• 1080p max resolution</li>
                <li>• 3 concurrency</li>
                <li>• 4 max processor per job</li>
                <li>• 8 max weight per job</li>
                <li>• 60 daily weight quota</li>
                <li>• No Watermark</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;