import { HiLocationMarker } from "react-icons/hi";
import logo from "../assets/maven-logo.svg";

export default function Header({ companyName = "" }) {
  return (
    <header className="bg-white border-b border-[#d8e4f4] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <img src={logo} alt="Maven Jobs" className="h-7 w-auto" />
      </div>

      <div className="flex items-center gap-2 text-[13px] text-[#8fa3bf]">
        <HiLocationMarker className="w-4 h-4" />
        {companyName ? `Company · ${companyName}` : "Company"}
      </div>
    </header>
  );
}

