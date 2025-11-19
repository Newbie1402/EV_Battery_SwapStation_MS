// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Lightbulb, Users, Award, Zap, Rocket, Beaker, MapPin, RefreshCcw, Heart, Leaf, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Info, DollarSign, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
    const navigate = useNavigate();

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

    // Core Values - theo thiết kế mới
    const coreValues = [
        {
            icon: Lightbulb,
            title: "Đổi mới sáng tạo",
            desc: "Không ngừng đột phá công nghệ để mang đến giải pháp tốt nhất cho cộng đồng."
        },
        {
            icon: Leaf,
            title: "Phát triển bền vững",
            desc: "Cam kết giảm thiểu lượng khí thải carbon và xây dựng hành tinh xanh hơn."
        },
        {
            icon: Users,
            title: "Khách hàng là trung tâm",
            desc: "Đặt khách hàng vào trọng tâm của mọi quyết định và hành động."
        },
    ];

    // Timeline - Hành trình phát triển
    const timeline = [
        {
            year: "2020",
            icon: Rocket,
            title: "Thành lập công ty",
            desc: "Khởi đầu hành trình với tầm nhìn cách mạng hóa sạc xe điện."
        },
        {
            year: "2021",
            icon: Beaker,
            title: "Trạm thử nghiệm đầu tiên",
            desc: "Ra mắt nguyên mẫu trạm đổi pin hoạt động đầu tiên."
        },
        {
            year: "2022",
            icon: MapPin,
            title: "100 trạm hoạt động",
            desc: "Mở rộng mạng lưới phủ sóng các khu vực đô thị lớn."
        },
        {
            year: "2023",
            icon: RefreshCcw,
            title: "1 triệu lượt đổi pin",
            desc: "Cột mốc quan trọng đánh dấu sự lớn mạnh của cộng đồng người dùng."
        },
    ];

    // Team members
    const team = [
        {
            name: "Nguyễn Minh Tuấn",
            position: "Giám đốc điều hành",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"
        },
        {
            name: "Trần Thu Hà",
            position: "Giám đốc công nghệ",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
        },
        {
            name: "Lê Quang Huy",
            position: "Giám đốc vận hành",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        },
        {
            name: "Phạm Lan Anh",
            position: "Giám đốc phát triển bền vững",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop"
        },
    ];

    return (
        <div className="w-full min-h-screen bg-slate-50 text-gray-900">
            <Header menuItems={publicMenuItems} role="" />

            {/* Hero Section - Theo thiết kế mới */}
            <section
                className="relative pt-32 pb-24 px-6 overflow-hidden bg-cover bg-center min-h-[480px]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?q=80&w=2070&auto=format&fit=crop")'
                }}
            >
                <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-center min-h-[400px]">
                    <motion.div
                        className="text-center max-w-4xl"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                            Định hình tương lai giao thông đô thị
                        </h1>
                        <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                            Sứ mệnh của chúng tôi là tạo ra trải nghiệm xe điện bền vững và liền mạch thông qua công nghệ đổi pin tiên tiến.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        variants={fadeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">Giá trị cốt lõi</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi được dẫn dắt bởi các giá trị cốt lõi định hình văn hóa và hướng dẫn quyết định, đảm bảo luôn tiến về phía trước với mục đích rõ ràng.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {coreValues.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all text-center"
                                variants={fadeVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="w-16 h-16 rounded-full bg-[#135bec]/10 flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-8 h-8 text-[#135bec]" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section - Hành trình của chúng tôi */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
                        <motion.div
                            className="text-center lg:text-left"
                            variants={fadeVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hành trình của chúng tôi</h2>
                            <p className="text-gray-600">
                                Từ một ý tưởng táo bạo đến mạng lưới toàn quốc, câu chuyện của chúng tôi là về sự phát triển nhanh chóng và đổi mới không ngừng.
                            </p>
                        </motion.div>

                        <div className="space-y-0">
                            {timeline.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className="grid grid-cols-[60px_1fr] gap-4"
                                    variants={fadeVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-[#135bec]/20 flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-[#135bec]" />
                                        </div>
                                        {idx < timeline.length - 1 && (
                                            <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="pb-8">
                                        <p className="font-bold text-gray-900 mb-1">{item.year}: {item.title}</p>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        variants={fadeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">Đội ngũ lãnh đạo</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Những bộ óc lỗi lạc thúc đẩy sứ mệnh của chúng tôi. Đội ngũ lãnh đạo mang đến hàng thập kỷ kinh nghiệm kết hợp trong công nghệ, năng lượng và đổi mới bền vững.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                className="flex flex-col items-center text-center group"
                                variants={fadeVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-transparent group-hover:border-[#135bec] transition-all duration-300">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-600">{member.position}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Commitment Section - Cam kết với hành tinh */}
            <section
                className="py-24 px-6 bg-cover bg-center text-white"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(19, 91, 236, 0.85), rgba(19, 91, 236, 0.9)), url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop")'
                }}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        variants={fadeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <Leaf className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Cam kết với hành tinh</h2>
                        <p className="text-lg mb-8 leading-relaxed">
                            Chúng tôi cam kết sâu sắc trong việc tạo ra tương lai bền vững. Công nghệ đổi pin của chúng tôi không chỉ mang lại sự tiện lợi mà còn tích cực góp phần giảm lượng khí thải carbon, thúc đẩy sử dụng năng lượng tái tạo và xây dựng các thành phố xanh hơn cho thế hệ mai sau.
                        </p>
                        <button
                            onClick={() => navigate("/about")}
                            className="px-8 py-4 bg-white text-[#135bec] rounded-lg font-bold hover:bg-slate-50 hover:shadow-xl transition-all inline-flex items-center gap-2"
                        >
                            Tìm hiểu về tác động của chúng tôi
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        variants={fadeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Tham gia cuộc cách mạng</h2>
                        <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
                            Dù bạn là tài xế, chủ doanh nghiệp hay nhà quy hoạch thành phố, luôn có một vị trí dành cho bạn trong tương lai của giao thông. Khám phá giải pháp của chúng tôi hoặc tìm trạm gần bạn.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate("/contact")}
                                className="px-8 py-4 bg-[#135bec] text-white rounded-lg font-bold hover:bg-[#0e4ab8] hover:shadow-xl transition-all"
                            >
                                Khám phá đối tác
                            </button>
                            <button
                                onClick={() => navigate("/driver/stations")}
                                className="px-8 py-4 bg-[#135bec]/10 text-[#135bec] rounded-lg font-bold hover:bg-[#135bec]/20 transition-all"
                            >
                                Tìm trạm đổi pin
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}