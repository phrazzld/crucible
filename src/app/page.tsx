import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to Crucible
          </h1>
          <p className="text-xl text-white mb-10">
            Test, optimize, and perfect your AI's performance effortlessly.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-1/2 text-white">
            <h2 className="text-3xl font-semibold mb-4">
              Unleash the Full Potential of Your AI
            </h2>
            <ul className="list-disc ml-6 text-xl">
              <li className="mb-2">
                Create custom configurations and test them with ease
              </li>
              <li className="mb-2">Evaluate performance using blind grading</li>
              <li className="mb-2">
                Keep track of your competitions, competitors, and trials
              </li>
              <li>Optimize your AI's responses for your specific use case</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/signup">
            <p className="inline-block bg-white font-bold py-4 px-8 rounded-lg hover:bg-blue-300 transition-colors duration-300">
              Get Started
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
