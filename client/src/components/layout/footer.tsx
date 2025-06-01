import { Link } from "wouter";
import {
  Zap,
  ShieldCheck,
  BadgeCheck,
  Lock,
  Star,
  CreditCard,
  Landmark,
  HandCoins,
  Twitter,
  Linkedin,
  HelpCircle,
  Mail,
  FileText,
  Shield,
} from "lucide-react";

// Custom SVG components for payment icons
const VisaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M9.5 8.5v7h5v-7h-5zm1.5-5c-3.035 0-5.5 2.464-5.5 5.5s2.465 5.5 5.5 5.5c3.036 0 5.5-2.464 5.5-5.5s-2.464-5.5-5.5-5.5zm-.5 2h1v1h-1v-1zm-2 1h1v1h-1v-1zm4 0h1v1h-1v-1zm-6 1h1v1h-1v-1zm8 0h1v1h-1v-1zm-4 1h1v1h-1v-1zm-2 1h1v1h-1v-1zm4 0h1v1h-1v-1zm-6 1h1v1h-1v-1zm8 0h1v1h-1v-1zm-4 1h1v1h-1v-1z" />
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 6.654a6.186 6.186 0 0 1 2.596 5.346 6.186 6.186 0 0 1-2.596 5.346 6.186 6.186 0 0 1-2.596-5.346 6.186 6.186 0 0 1 2.596-5.346zm-9.455 0a6.186 6.186 0 0 1 2.596 5.346 6.186 6.186 0 0 1-2.596 5.346 6.186 6.186 0 0 1-2.596-5.346 6.186 6.186 0 0 1 2.596-5.346zm18.91 0a6.186 6.186 0 0 1 2.596 5.346 6.186 6.186 0 0 1-2.596 5.346 6.186 6.186 0 0 1-2.596-5.346 6.186 6.186 0 0 1 2.596-5.346z" />
  </svg>
);

const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M7.5 11h1.5v4H7.5v-4zm3.5 0h1.5v4H11v-4zm3.5 0h1.5v4H14.5v-4zM20 7v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2zm-9.5 1H7.5v1h3V8zm3.5 0h-3v1h3V8z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Indicators Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Customer Testimonials */}
            <div className="border-l border-r border-gray-700 px-6">
              <div className="flex items-center mb-3"></div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
                <span className="ml-2 text-sm text-gray-300">
                  4.9/5 (1,243 reviews)
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-400 italic">
                "Solaspec's escrow protection gave me peace of mind during my
                solar installation."
              </p>
            </div>

            {/* Trust Seals */}
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-3"></div>
              <div className="flex space-x-4">
                <div className="bg-gray-700 rounded-lg p-2 flex items-center">
                  <BadgeCheck className="w-6 h-6 text-green-400 mr-2" />
                  <span className="text-xs">
                    Verified
                    <br />
                    Vendors
                  </span>
                </div>
                <div className="bg-gray-700 rounded-lg p-2 flex items-center">
                  <ShieldCheck className="w-6 h-6 text-blue-400 mr-2" />
                  <span className="text-xs">
                    Escrow
                    <br />
                    Protected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Solaspec</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting verified solar vendors with customers nationwide
              through secure escrow protection.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Browse Systems
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Solar Calculators
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Financing Options
                </a>
              </li>
              <li>
                <Link
                  href="/installers"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Installation Service
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/become-vendor"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Landmark className="w-4 h-4 mr-2" /> Sell on Solaspec
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor-dashboard"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Landmark className="w-4 h-4 mr-2" /> Vendor Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Landmark className="w-4 h-4 mr-2" /> Analytics Tools
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Landmark className="w-4 h-4 mr-2" /> Fee Structure
                </a>
              </li>
            </ul>
          </div>

          {/* Admin Access */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Administration</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/login?admin=true"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Lock className="w-4 h-4 mr-2" /> Admin Login
                </Link>
              </li>
              <li>
                <Link
                  href="/admin-dashboard"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2" /> Admin Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" /> System Status
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" /> Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-2" /> Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" /> Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2" /> Escrow Protection
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" /> Legal & Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer with Policies */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Solaspec. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-1" /> Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-1" /> Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-1" /> Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
