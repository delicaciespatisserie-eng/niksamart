import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-navy text-white pt-16 pb-8 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-3 w-max mb-6">
              <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center bg-white font-display font-bold text-xl text-navy">N</div>
              <span className="font-display font-bold text-2xl tracking-wider text-gold">Niksa Mart</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              India's premium marketplace for curated luxury, traditional Bilona ghee, and wellness products. Quality guaranteed.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"><FiFacebook /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"><FiInstagram /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"><FiTwitter /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"><FiYoutube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-bold text-gold mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-gold transition-colors">About Niksa</Link></li>
              <li><Link to="/products" className="hover:text-gold transition-colors">Shop All Products</Link></li>
              <li><Link to="/vendor/apply" className="hover:text-gold transition-colors">Become a Vendor</Link></li>
              <li><Link to="/track-order" className="hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Policies */}
          <div>
            <h3 className="font-display text-lg font-bold text-gold mb-6 uppercase tracking-wider">Policies</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/shipping" className="hover:text-gold transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-gold transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/faq" className="hover:text-gold transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold text-gold mb-6 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-gold mt-1 shrink-0" size={18} />
                <span>Level 4, Premium Tower, Connaught Place, New Delhi, India 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-gold shrink-0" size={18} />
                <span>+91 1800 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-gold shrink-0" size={18} />
                <span>support@niksamart.com</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg inline-block">
              <span className="text-xs text-gray-400 block mb-1">FSSAI License No.</span>
              <span className="font-bold text-gold tracking-widest">10026011000123</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Niksa Mart. All rights reserved.</p>
          <div className="flex gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rupay-Logo.png/800px-Rupay-Logo.png" alt="RuPay" className="h-6 bg-white px-2 py-1 rounded" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 bg-white px-2 py-1 rounded" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 bg-white px-2 py-1 rounded" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
