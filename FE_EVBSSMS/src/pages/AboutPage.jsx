import { motion } from "framer-motion";
import { Target, Users, Award, Zap, TrendingUp, Heart, Shield, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Info, MapPin, DollarSign, Phone } from "lucide-react";

export default function AboutPage() {
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

    const values = [
        {
            icon: Target,
            title: "Sứ mệnh",
            desc: "Tiên phong trong việc phát triển hệ sinh thái giao thông xanh, bền vững tại Việt Nam thông qua công nghệ đổi pin thông minh.",
            color: "from-emerald-500 to-green-500",
            bgColor: "bg-emerald-50"
        },
        {
            icon: Heart,
            title: "Tầm nhìn",
            desc: "Trở thành nền tảng hàng đầu về giải pháp năng lượng cho xe điện, góp phần xây dựng tương lai xanh cho thế hệ mai sau.",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50"
        },
        {
            icon: Award,
            title: "Giá trị cốt lõi",
            desc: "Đổi mới sáng tạo, tận tâm với khách hàng, trách nhiệm với môi trường và cam kết chất lượng dịch vụ hàng đầu.",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50"
        },
    ];

    const achievements = [
        { value: "500+", label: "Trạm đổi pin", icon: MapPin },
        { value: "50K+", label: "Khách hàng", icon: Users },
        { value: "1M+", label: "Lượt đổi pin", icon: Zap },
        { value: "98%", label: "Hài lòng", icon: Heart },
    ];

    const team = [
        {
            name: "Nguyễn Văn A",
            position: "CEO & Founder",
            desc: "15 năm kinh nghiệm trong ngành công nghệ xanh",
        },
        {
            name: "Trần Thị B",
            position: "CTO",
            desc: "Chuyên gia về hệ thống pin và năng lượng",
        },
        {
            name: "Lê Văn C",
            position: "COO",
            desc: "Chuyên gia vận hành và logistics",
        },
        {
            name: "Phạm Thị D",
            position: "CMO",
            desc: "Chuyên gia marketing và phát triển thương hiệu",
        },
    ];

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
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">Về chúng tôi</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
                            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Tiên phong
                            </span>
                            <br />
                            <span className="text-gray-800">Tương lai xanh</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            EV Battery Swap là nền tảng hàng đầu tại Việt Nam cung cấp giải pháp đổi pin thông minh
                            cho xe điện, góp phần xây dựng hệ sinh thái giao thông bền vững.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                        {achievements.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100"
                                whileHover={{ scale: 1.05, y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-600 mb-2">{item.value}</div>
                                <div className="text-sm text-gray-600">{item.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        variants={fadeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">
                            Định hướng phát triển
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi cam kết mang đến giải pháp tốt nhất cho cộng đồng và môi trường
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`${item.bgColor} rounded-3xl p-8 hover:shadow-xl transition-all border border-gray-100`}
                                variants={fadeVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                                    <item.icon className="w-8 h-8 text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 px-6 bg-gradient-to-br from-emerald-50 to-cyan-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            variants={fadeVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6 text-gray-900">
                                Câu chuyện của chúng tôi
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Thành lập vào năm 2020, EV Battery Swap ra đời từ ý tưởng đơn giản:
                                    làm thế nào để xe điện trở nên thuận tiện như xe xăng truyền thống?
                                </p>
                                <p>
                                    Với đội ngũ chuyên gia hàng đầu trong lĩnh vực năng lượng và công nghệ,
                                    chúng tôi đã phát triển hệ thống đổi pin thông minh chỉ mất 3 phút,
                                    nhanh hơn cả việc đổ xăng.
                                </p>
                                <p>
                                    Đến nay, chúng tôi tự hào là đơn vị tiên phong với mạng lưới hơn 500 trạm
                                    đổi pin trên toàn quốc, phục vụ hơn 50,000 khách hàng và thực hiện hơn
                                    1 triệu lượt đổi pin thành công.
                                </p>
                                <p>
                                    Chúng tôi không chỉ cung cấp dịch vụ, mà còn xây dựng một cộng đồng
                                    những người yêu thích giao thông xanh và cam kết bảo vệ môi trường.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative"
                            variants={fadeVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl p-8 aspect-square flex items-center justify-center">
                                    <TrendingUp className="w-24 h-24 text-white" strokeWidth={1.5} />
                                </div>
                                <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 aspect-square flex items-center justify-center">
                                    <Shield className="w-24 h-24 text-white" strokeWidth={1.5} />
                                </div>
                                <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-8 aspect-square flex items-center justify-center">
                                    <Users className="w-24 h-24 text-white" strokeWidth={1.5} />
                                </div>
                                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 aspect-square flex items-center justify-center">
                                    <Zap className="w-24 h-24 text-white" strokeWidth={1.5} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        variants={fadeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">
                            Đội ngũ lãnh đạo
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Những con người tài năng đứng sau thành công của chúng tôi
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center hover:shadow-xl transition-all border border-gray-200"
                                variants={fadeVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl font-bold text-white">
                                        {member.name.split(' ').pop().charAt(0)}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                                <p className="text-emerald-600 font-semibold mb-3">{member.position}</p>
                                <p className="text-sm text-gray-600">{member.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}