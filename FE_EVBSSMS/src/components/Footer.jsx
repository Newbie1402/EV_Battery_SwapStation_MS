import { Link } from "react-router-dom";
import { Zap, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: "Trạm đổi pin", path: "/stations" },
            { label: "Ứng dụng di động", path: "/mobile-app" },
            { label: "Hệ thống quản lý", path: "/management" },
            { label: "Bảng giá", path: "/pricing" },
        ],
        company: [
            { label: "Về chúng tôi", path: "/about" },
            { label: "Tin tức", path: "/news" },
            { label: "Tuyển dụng", path: "/careers" },
            { label: "Đối tác", path: "/partners" },
        ],
        support: [
            { label: "Trung tâm trợ giúp", path: "/help" },
            { label: "Liên hệ", path: "/contact" },
            { label: "Điều khoản sử dụng", path: "/terms" },
            { label: "Chính sách bảo mật", path: "/privacy" },
        ],
    };

    const socialLinks = [
        { icon: Facebook, href: "#", label: "Facebook" },
        { icon: Twitter, href: "#", label: "Twitter" },
        { icon: Instagram, href: "#", label: "Instagram" },
        { icon: Linkedin, href: "#", label: "LinkedIn" },
    ];

    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                EV Battery Swap
                            </span>
                        </Link>
                        <p className="text-sm text-gray-600 mb-6 max-w-xs leading-relaxed">
                            Giải pháp đổi pin thông minh cho xe điện.
                            Tiên phong trong hành trình hướng tới tương lai xanh và bền vững.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-600" />
                                <span>1900 1234</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-emerald-600" />
                                <span>support@evbatteryswap.vn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span>Hà Nội, Việt Nam</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 mt-6">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gradient-to-br hover:from-emerald-400 hover:to-cyan-500 flex items-center justify-center transition-all group"
                                >
                                    <social.icon className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Sản phẩm</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-gray-600 hover:text-emerald-600 transition"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Công ty</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-gray-600 hover:text-emerald-600 transition"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Hỗ trợ</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-gray-600 hover:text-emerald-600 transition"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600 text-center md:text-left">
                            © {currentYear} EV Battery Swap Management System. Bản quyền thuộc về chúng tôi.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            <Link to="/terms" className="hover:text-emerald-600 transition">
                                Điều khoản
                            </Link>
                            <Link to="/privacy" className="hover:text-emerald-600 transition">
                                Bảo mật
                            </Link>
                            <Link to="/cookies" className="hover:text-emerald-600 transition">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

