// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Facebook, Instagram, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Info, DollarSign } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const publicMenuItems = [
        { label: "Trang chủ", path: "/", icon: Home },
        { label: "Giới thiệu", path: "/about", icon: Info },
        { label: "Trạm đổi pin", path: "/driver/stations", icon: MapPin },
        { label: "Bảng giá", path: "/pricing", icon: DollarSign },
        { label: "Liên hệ", path: "/contact", icon: Phone },
    ];

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm.");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 text-gray-900">
            <Header menuItems={publicMenuItems} role="" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                {/* Page Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                        Liên Hệ Với Chúng Tôi
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi luôn sẵn sàng lắng nghe. Hãy để lại lời nhắn cho chúng tôi hoặc liên hệ trực tiếp qua các thông tin bên dưới.
                    </p>
                </motion.div>

                {/* Grid Layout: Form (3 cols) + Sidebar (2 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 pt-10">
                    {/* Contact Form - 3 columns */}
                    <motion.div
                        className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Gửi tin nhắn cho chúng tôi
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name & Email Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base font-medium text-gray-900">
                                        Họ và tên
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Nhập họ và tên của bạn"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="h-14 text-base border-slate-300 focus:border-[#135bec] focus:ring-[#135bec]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-base font-medium text-gray-900">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Nhập địa chỉ email của bạn"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="h-14 text-base border-slate-300 focus:border-[#135bec] focus:ring-[#135bec]/20"
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-base font-medium text-gray-900">
                                    Chủ đề
                                </Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    placeholder="Nhập chủ đề tin nhắn"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="h-14 text-base border-slate-300 focus:border-[#135bec] focus:ring-[#135bec]/20"
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-base font-medium text-gray-900">
                                    Nội dung tin nhắn
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Viết tin nhắn của bạn ở đây..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    rows={5}
                                    className="resize-y text-base border-slate-300 focus:border-[#135bec] focus:ring-[#135bec]/20"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full sm:w-auto h-12 px-6 bg-[#135bec] hover:bg-[#0e4ab8] text-white font-bold text-base"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Gửi tin nhắn
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Sidebar - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Info Card */}
                        <motion.div
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#135bec]/10 text-[#135bec] p-2 rounded-full mt-1 flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Hotline</p>
                                        <a href="tel:19001234" className="text-gray-600 hover:text-[#135bec] transition-colors">
                                            1900 1234
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#135bec]/10 text-[#135bec] p-2 rounded-full mt-1 flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Email hỗ trợ</p>
                                        <a href="mailto:support@evbss.vn" className="text-gray-600 hover:text-[#135bec] transition-colors">
                                            support@evbss.vn
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#135bec]/10 text-[#135bec] p-2 rounded-full mt-1 flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Địa chỉ văn phòng</p>
                                        <p className="text-gray-600">123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Working Hours Card */}
                        <motion.div
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Giờ làm việc</h3>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Thứ Hai - Thứ Sáu:</span>
                                    <span className="font-medium text-gray-900">8:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Thứ Bảy:</span>
                                    <span className="font-medium text-gray-900">9:00 - 17:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Chủ Nhật:</span>
                                    <span className="font-medium text-gray-900">Đóng cửa</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Social Media Card */}
                        <motion.div
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                            variants={fadeVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Theo dõi chúng tôi</h3>
                            <div className="flex items-center gap-4">
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-gray-600 hover:bg-[#135bec] hover:text-white transition-colors"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-gray-600 hover:bg-[#135bec] hover:text-white transition-colors"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-gray-600 hover:bg-[#135bec] hover:text-white transition-colors"
                                    aria-label="Zalo"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Google Map Section */}
                <motion.div
                    className="mt-16 lg:mt-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                    variants={fadeVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="aspect-w-16 aspect-h-9">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447913364969!2d106.69539361528657!3d10.776982292320857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed856b%3A0x38d4dc5894328a6e!2zQml0ZXhjbyBGaW5hbmNpYWwgVG93ZXIsIDIxIFR1biBUaGnhur9wLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1678886555432!5m2!1svi!2s"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="EV Swap Office Location"
                        />
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}