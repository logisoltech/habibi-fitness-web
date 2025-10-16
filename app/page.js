import Link from "next/link";
import Header from "./components/Header";

const MAIN = "#18BD0F"; // main color
const HEADING = "#74EB6E"; // font color for heading

export default function Hero() {
  return (
    <section className="relative text-white">
      <Header />

      {/* Hero Background */}
      <div
        className="relative min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(/images/landing-bg.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center relative z-10 mx-auto w-full max-w-6xl px-4 pt-10 pb-20 md:pt-14 md:pb-28">
          <h1 className="text-4xl leading-tight md:text-6xl md:leading-[1.1] font-extrabold drop-shadow-sm">
            <span style={{ color: HEADING }}>Eat Healthy, </span> Stay Healthy
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-white/85">
            Savor the goodness of health with every bite, delivered fresh to
            your door!
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
              style={{ backgroundColor: MAIN }}
            >
              See Our Menus
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
