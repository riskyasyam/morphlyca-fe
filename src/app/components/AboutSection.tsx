import React from "react";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 px-4 pt-24 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-medium md:text-4xl mb-4">
            Why you should use Morphlyca AI Tool?
          </h2>
          <p className="text-gray-400 text-sm max-w-3xl mx-auto">
            We provide a simple, transparent, and powerful AI service for face
            swapping and animation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#1B1F23] rounded-2xl p-6 border border-gray-700 hover:border-gray-500 hover:shadow-[0px_5px_20px_5px_#DBFFAA40] transition-colors">
            {/* Feature Image/Icon Area */}
            <div className="mb-6">
              <div className="w-full h-44 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/images/model.png" alt="" />
              </div>
            </div>

            {/* Feature Content */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Smart AI Model
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Harness cutting-edge AI to seamlessly swap faces in photos,
                videos, or GIFs. Morphlyca model preserves every detail and
                expression for lifelike, natural results. Regular updates keep
                the technology at its best.
              </p>
            </div>
          </div>

          <div className="bg-[#1B1F23] rounded-2xl p-6 border border-gray-700 hover:border-gray-500 hover:shadow-[0px_5px_20px_5px_#DBFFAA40] transition-colors">
            {/* Feature Image/Icon Area */}
            <div className="mb-6">
              <div className="w-full h-44 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg gap-2 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/bahan.jpeg"
                  className="w-[100px] rounded border border-green-secondary"
                  alt=""
                />
                <img
                  src="/images/garis.png"
                  className="w-[70px] rounded"
                  alt=""
                />
                <div className="w-[130px] h-[130px] border border-green-secondary bg-[#1B1F23] rounded-lg overflow-hidden">
                  
                  <img
                    src="/images/result.gif"
                    className="w-full h-full object-cover rounded-lg"
                    alt="Animasi Hasil"
                  />
                </div>
              </div>
            </div>

            {/* Feature Content */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Animate Your Photos
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Turn any photo into a dynamic and engaging animation. Whether its a quick selfie or a high-frame video still. our AI instantly transforms adapts to your file to deliver smooth, natural, and flexible result-without any extra hassle.
              </p>
            </div>
          </div>

          <div className="bg-[#1B1F23] rounded-2xl p-6 border border-gray-700 hover:border-gray-500 hover:shadow-[0px_5px_20px_5px_#DBFFAA40] transition-colors">
            {/* Feature Image/Icon Area */}
            <div className="mb-6">
              <div className="w-full h-44 bg-[#1B1F23] rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/images/Group-2.png" alt="" />
              </div>
            </div>

            {/* Feature Content */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Quick results
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                With cutting-edge AI technology, you can seamlessly swap faces in photos, videos, or GIFs. Our AI faceswap precicsely retains every facial detail and features. We regularly update the model for the best use
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
             <div className="bg-[#1B1F23] rounded-2xl p-6 border border-gray-700 hover:border-gray-500 hover:shadow-[0px_5px_20px_5px_#DBFFAA40] transition-colors">
            {/* Feature Image/Icon Area */}
            <div className="mb-6">
              <div className="w-full relative h-44 bg-[#1B1F23] rounded-lg flex justify-center overflow-hidden">
               <img src="/images/dark1.png" alt="w-full" />
               <div className="absolute p-1 bg-gray-800 border border-gray-500 rounded top-0 left-10">
                <img src="/images/google-chrome.png" className="w-[30px]" alt="" />
               </div>
                <div className="absolute p-1 bg-gray-800 border border-gray-500 rounded top-16 left-16">
                <img src="/images/safari.png" className="w-[30px]" alt="" />
               </div>
                <div className="absolute p-1 bg-gray-800 border border-gray-500 rounded top-30 left-10">
                <img src="/images/mozila.png" className="w-[30px]" alt="" />
               </div>

                 <div className="absolute p-1 bg-gray-800 border border-gray-500 rounded top-6 right-8">
                <img src="/images/Microsoft_Edge.png" className="w-[35px]" alt="" />
               </div>

                 <div className="absolute p-1 bg-gray-800 border border-gray-500 rounded top-28 right-16">
                <img src="/images/opera.png" className="w-[35px]" alt="" />
               </div>
              </div>
            </div>

            {/* Feature Content */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Fast, browser-based
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                No downloads, no installations, and no extra software needed. With Morphlyca, everything runs directly in your browser. Simply upload your photos or videos and start editing—whether you’re on a desktop, laptop, or tablet. Morphlyca is built for speed and convenience, so you can create high-quality results anytime, anywhere.
              </p>
            </div>
          </div>
           <div className="bg-[#1B1F23] rounded-2xl p-6 border border-gray-700 hover:border-gray-500 hover:shadow-[0px_5px_20px_5px_#DBFFAA40] transition-colors">
            {/* Feature Image/Icon Area */}
            <div className="mb-6">
              <div className="w-full h-44 bg-[#1B1F23] rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/images/quality.png" alt="" />
              </div>
            </div>

            {/* Feature Content */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Quality and precision
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our AI ensures high-definition, photorealistic swaps that go beyond simple editing. Every detail—from facial expressions to lighting and textures—is carefully preserved, delivering transformations that look natural, authentic, and visually seamless.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
