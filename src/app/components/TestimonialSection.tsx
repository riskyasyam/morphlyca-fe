import React from 'react';
import Image from 'next/image';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "The results are absolutely mind-blowing. I've tried other face-swap tools before, but nothing comes close to Morphlyca. The swaps look so natural and seamless that people can't even tell they've been edited. It's like working with movie-level effects, but right in my browser.",
    name: "Daniel R -",
    role: "Content Creator",
    avatar: "/images/co_2.png"
  },
  {
    id: 2,
    quote: "Morphlyca has completely changed the way I work on campaigns. I used it for a product launch video, and it saved me days of editing. The quality was professional, the process was simple, and I could deliver creative assets much faster than before. It's now one of my go-to tools.",
    name: "Sofia M -",
    role: "Digital Marketer",
    avatar: "/images/c.png"
  },
  {
    id: 3,
    quote: "What I love about Morphlyca is the speed. I don't need to download anything or mess with complicated software—just upload, swap, and it's done. The results are precise, realistic, and consistent. For someone like me who edits videos daily, this tool is a huge time-saver.",
    name: "James L -",
    role: "Video Editor",
    avatar: "/images/co.png"
  }
];

const TestimonialSection: React.FC = () => {
  return (
    <section id="testimonials" className="bg-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium mb-6">
            What they say about Morphlyca
          </h2>
          <p className="text-white text-sm max-w-3xl mx-auto">
            See how Morphlyca empowers individuals and organizations to create, transform, and innovate with ease.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[#1B1F23] rounded-2xl p-8 relative"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <svg
                  className="w-12 h-12 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>

              {/* Quote Text */}
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                {testimonial.quote}
              </p>

              {/* Profile */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        {/* <div className="flex justify-center mt-12 space-x-2">
          <button className="w-2 h-2 rounded-full bg-white"></button>
          <button className="w-2 h-2 rounded-full bg-gray-600"></button>
        </div> */}
      </div>
    </section>
  );
};

export default TestimonialSection;