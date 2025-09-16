import Navbar from "./Navbar";
import Image from "next/image";

export default function HeroSection() {
  return (
    <>
      <Navbar />
      <section className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 md:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute top-0 right-0 z-0 w-full h-full">
          <video 
            src="/God-rays.mp4" 
            width={1500}
            height={300}
            autoPlay 
            loop 
            muted 
            className="opacity-100 object-cover w-full h-full"
          />
        </div>
        
        {/* Main Content */}
        <div className="text-center z-10 mt-20 md:mt-28 lg:mt-56 lg:mb-20 max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl mb-4 md:mb-6 leading-tight">
            <span className="bg-[linear-gradient(to_right,white,theme(colors.green.secondary),theme(colors.blue.500),white)] text-transparent bg-clip-text">
              Effortless
            </span> Transformations. Endless Possibilities.
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 md:mb-12 max-w-4xl mx-auto text-gray-300 leading-relaxed">
            Create ultra-realistic face swaps faster than ever - no editing skills required.
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-12 md:mb-16 lg:mb-20">
            <button className="w-full sm:w-auto bg-gradient-to-r from-green-primary via-green-foreground to-green-secondary text-black text-sm md:text-base px-6 md:px-8 py-3 md:py-4 rounded-lg hover:opacity-90 transition font-semibold">
              Get Started Free
            </button>
            <button className="w-full sm:w-auto bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:opacity-90 transition text-sm md:text-base">
              See It In Action
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="z-10 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-lg overflow-hidden">
            <Image 
              src="/image-hero.png" 
              alt="Hero illustration" 
              width={1200}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </section>
    </>
  );
}
