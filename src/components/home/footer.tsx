import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-white">OBAOL</h3>
            <p className="mt-4 text-sm text-gray-400">
              A digital infrastructure for global commodity trading, focused on
              transparency, efficiency, and trust.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/product">Product</Link>
              </li>
              <li>
                <Link href="/catalog">Catalog</Link>
              </li>
              <li>
                <Link href="/case-studies">Insights</Link>
              </li>
              <li>
                <Link href="/auth">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/disclaimer">Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} OBAOL. All rights reserved.
          </p>

          <p className="text-sm text-gray-500">
            Built for modern commodity trade.
          </p>
        </div>
      </div>
    </footer>
  );
}
