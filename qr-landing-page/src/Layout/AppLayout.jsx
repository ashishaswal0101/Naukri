import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AppLayout({ children, headerProps = {} }) {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-[#f4f7ff] via-[#eef3ff] to-[#f9fbff]">
      <Header {...headerProps} />
      <main className="flex-1 overflow-hidden">{children}</main>
      <Footer />
    </div>
  );
}
