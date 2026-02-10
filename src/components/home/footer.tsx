import Link from "next/link";
import { MdEmail, MdPhone } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-default-200 bg-background text-default-500">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <h3 className="text-foreground font-semibold text-lg">
              OBAOL Supreme
            </h3>
            <p className="mt-4 text-sm leading-relaxed mb-6">
              An execution-focused agro trade system built to reduce risk,
              enforce discipline, and ensure real trades reach completion.
            </p>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <MdEmail className="text-foreground text-lg" />
                <a href="mailto:exports@obaol.com" className="hover:text-foreground transition-colors">
                  exports@obaol.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="text-foreground text-lg" />
                <a href="tel:+917306096941" className="hover:text-foreground transition-colors">
                  +91 (730) 609-6941                </a>
              </div>
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-green-500 text-lg" />
                <a
                  href="https://wa.me/919019351483"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="text-foreground font-medium mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/verification" className="hover:text-foreground">
                  About OBAOL
                </Link>
              </li>
              <li>
                <Link href="/why-obaol" className="hover:text-foreground">
                  Why OBAOL
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/procurement" className="hover:text-foreground">
                  Procurement Execution
                </Link>
              </li>
              <li>
                <Link href="/verification" className="hover:text-foreground">
                  Verification System
                </Link>
              </li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h4 className="text-foreground font-medium mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  FAQs
                </Link>
              </li>
              {/* <li>
                <Link href="/blog" className="hover:text-foreground">
                  Insights & Articles
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-foreground">
                  Case Studies
                </Link>
              </li> */}
              <li>
                <Link
                  href="https://typebot.co/obaol-early-access"
                  className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-foreground font-medium mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-foreground">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-16 pt-6 border-t border-default-200 flex flex-col md:flex-row items-center justify-between text-xs text-default-500">
          <p>
            © {new Date().getFullYear()} OBAOL Supreme. All rights reserved.
          </p>

          <p className="mt-4 md:mt-0">
            Built for serious commodity trade execution.
          </p>
        </div>
      </div>
    </footer>
  );
}
