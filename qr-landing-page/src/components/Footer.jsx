import Logo from "../assets/maven-logo.svg";

export default function Footer() {
  return (
    <footer className="bg-[#0f2550] px-6 py-4 text-center text-[13px] text-white/40">
      <div className="inline-flex items-center gap-2">
        <img src={Logo} alt="Maven Jobs" className="h-6 w-auto" />
      </div>
      <div className="mt-2">Powered by Maven Jobs</div>
      <div className="mt-1 text-[12px] text-white/25">
        © {new Date().getFullYear()} Maven Jobs. All rights reserved.
      </div>
    </footer>
  );
}

