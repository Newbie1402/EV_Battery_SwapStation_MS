import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Info, DollarSign } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const publicMenuItems = [
        { label: "Trang chủ", path: "/", icon: Home },
        { label: "Giới thiệu", path: "/about", icon: Info },
        { label: "Trạm đổi pin", path: "/stations", icon: MapPin },
        { label: "Bảng giá", path: "/pricing", icon: DollarSign },
        { label: "Liên hệ", path: "/contact", icon: Phone },
    ];

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    const contactInfo = [
        {
            icon: Phone,
            title: "Điện thoại",
            details: ["Hotline: 1900 1234", "Hỗ trợ: 024 1234 5678"],
            color: "from-emerald-500 to-green-500",
            bgColor: "bg-emerald-50"
        },
        {
            icon: Mail,
            title: "Email",
            details: ["support@evbss.vn", "info@evbss.vn"],
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50"
        },
        {
            icon: MapPin,
            title: "Địa chỉ",
            details: ["123 Đường ABC, Quận XYZ", "Hà Nội, Việt Nam"],
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50"
        },
        {
            icon: Clock,
            title: "Giờ làm việc",
            details: ["Thứ 2 - Thứ 6: 8:00 - 18:00", "Thứ 7 - CN: 9:00 - 17:00"],
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50"
        },
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại với bạn sớm.");

        // Reset form
        setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        });

        setIsSubmitting(false);
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
            <Header menuItems={publicMenuItems} role="" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">Liên hệ với chúng tôi</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
                            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Kết nối
                            </span>
                            <br />
                            <span className="text-gray-800">Cùng chúng tôi</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.
                            Hãy để lại thông tin hoặc liên hệ trực tiếp với chúng tôi.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-6">
                        {contactInfo.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`${item.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all`}
                                variants={fadeVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                                {item.details.map((detail, i) => (
                                    <p key={i} className="text-sm text-gray-600 mb-1">{detail}</p>
                                ))}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.div
                            variants={fadeVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <Card className="shadow-xl border-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-gray-900">
                                        Gửi tin nhắn cho chúng tôi
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-gray-700">
                                                Họ và tên <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="Nguyễn Văn A"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="h-11"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-700">
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="email@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="h-11"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-gray-700">
                                                Số điện thoại <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="0987654321"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="h-11"
                                            />
                                        </div>

                                        {/* Subject */}
                                        <div className="space-y-2">
                                            <Label htmlFor="subject" className="text-gray-700">
                                                Chủ đề <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                placeholder="Tôi muốn hỏi về..."
                                                value={formData.subject}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="h-11"
                                            />
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-gray-700">
                                                Nội dung <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                placeholder="Nhập nội dung tin nhắn của bạn..."
                                                value={formData.message}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                rows={5}
                                                className="resize-none"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
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
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Map & Additional Info */}
                        <motion.div
                            className="space-y-6"
                            variants={fadeVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {/* Map Placeholder */}
                            <Card className="shadow-xl border-0 overflow-hidden">
                                <div className="h-80 bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <MapPin className="w-24 h-24 text-emerald-500/50" strokeWidth={1} />
                                    </div>
                                    <div className="relative z-10 text-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                                            <MapPin className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800">Trụ sở chính</p>
                                        <p className="text-sm text-gray-600">123 Đường ABC, Quận XYZ, Hà Nội</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Quick Contact */}
                            <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 text-white">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        <Zap className="w-6 h-6" />
                                        Liên hệ nhanh
                                    </CardTitle>
                                    <CardDescription className="text-white/90">
                                        Cần hỗ trợ ngay? Gọi hotline của chúng tôi
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <a
                                        href="tel:19001234"
                                        className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition"
                                    >
                                        <Phone className="w-6 h-6" />
                                        <div>
                                            <p className="font-semibold">Hotline 24/7</p>
                                            <p className="text-lg font-bold">1900 1234</p>
                                        </div>
                                    </a>
                                    <a
                                        href="mailto:support@evbss.vn"
                                        className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition"
                                    >
                                        <Mail className="w-6 h-6" />
                                        <div>
                                            <p className="font-semibold">Email hỗ trợ</p>
                                            <p className="text-lg font-bold">support@evbss.vn</p>
                                        </div>
                                    </a>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}