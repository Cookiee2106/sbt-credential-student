'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GraduationCap, ShieldCheck, Link2, Lock, Users, FileCheck, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [verifyCode, setVerifyCode] = useState('');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SBT Credential</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Tính năng</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">Cách hoạt động</a>
              <a href="#stats" className="text-gray-600 hover:text-gray-900">Thống kê</a>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/login?mode=register">Đăng ký</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" />
              Blockchain-based Credential System
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Văn bằng số <br />
              <span className="text-primary">Xác minh trên Blockchain</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Hệ thống quản lý văn bằng tiên tiến với công nghệ Soulbound Token (SBT). 
              Immutable, verifiable và secure - hoàn toàn phi tập trung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/login?mode=login">
                  Đăng nhập
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link href="/login?mode=register">
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="text-lg px-8 py-6">
                <Link href="/verify/demo">
                  Xem demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl border p-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Verified</p>
                    <p className="text-sm text-gray-500">Blockchain Confirmed</p>
                  </div>
                </div>
                <div className="h-px w-20 bg-gray-200" />
                <div className="font-mono text-sm text-gray-600">
                  Token ID: #12345
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/5 to-purple-50 p-6 rounded-xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Credential Name</p>
                    <p className="font-semibold text-lg">Bachelor of Computer Science</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Issued By</p>
                    <p className="font-semibold">Đại học Bách Khoa</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Recipient</p>
                    <p className="font-semibold">Nguyễn Văn A</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Issue Date</p>
                    <p className="font-semibold">15/01/2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="verify" className="py-16 bg-gradient-to-r from-primary to-indigo-600">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Xác minh văn bằng</h2>
            <p className="text-indigo-100">Nhập mã xác minh để kiểm tra tính hợp lệ của văn bằng</p>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (verifyCode.trim()) {
                window.location.href = `/verify/${verifyCode.trim()}`;
              }
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Nhập mã xác minh (VD: CRED-20240115-ABC123)"
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <Button 
              type="submit"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 px-8"
            >
              Xác minh
            </Button>
          </form>
          <p className="text-center text-indigo-200 text-sm mt-4">
            Ví dụ mã: CRED-20240115-ABC123, CRED-20240125-DEF456, CRED-20240201-GHI789
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn SBT Credential?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Với công nghệ blockchain, văn bằng của bạn được bảo vệ vĩnh viễn và xác minh dễ dàng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Link2,
                title: 'Immutable',
                description: 'Văn bằng được lưu trữ vĩnh viễn trên blockchain, không thể sửa đổi hoặc xóa',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: ShieldCheck,
                title: 'Verifiable',
                description: 'Xác minh công khai bằng mã code, ai cũng có thể kiểm tra',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Lock,
                title: 'Soulbound',
                description: 'Token gắn liền với người nhận, không thể chuyển nhượng hay bán',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: Users,
                title: 'Decentralized',
                description: 'Phi tập trung, không cần cơ quan trung gian, minh bạch và trustless',
                color: 'bg-orange-100 text-orange-600',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quy trình đơn giản để phát hành và xác minh văn bằng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Đăng ký tài khoản',
                description: 'Trường học và sinh viên đăng ký tài khoản qua MetaMask. Admin phê duyệt.',
              },
              {
                step: '02',
                title: 'Phát hành văn bằng',
                description: 'Trường học tạo và phát hành văn bằng dưới dạng Soulbound Token trên blockchain.',
              },
              {
                step: '03',
                title: 'Xác minh công khai',
                description: 'Bất kỳ ai cũng có thể xác minh văn bằng qua mã code trên trang verify.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <span className="text-6xl font-bold text-primary/10 absolute top-4 right-6">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">Trường đại học</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-primary-foreground/80">Văn bằng đã phát hành</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-primary-foreground/80">Xác minh thành công</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sẵn sàng để bắt đầu?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hệ thống giáo dục hiện đại. Quản lý văn bằng an toàn, minh bạch và chuyên nghiệp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
<Link href="/login?mode=register">
                Đăng ký ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/verify/demo">
                <FileCheck className="mr-2 h-5 w-5" />
                Xem demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SBT Credential</span>
              </div>
              <p className="max-w-md">
                Hệ thống quản lý văn bằng trên blockchain với công nghệ Soulbound Token. 
                Immutable, verifiable và secure.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white">Tính năng</a></li>
                <li><a href="#how-it-works" className="hover:text-white">Cách hoạt động</a></li>
                <li><a href="#stats" className="hover:text-white">Thống kê</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Khác</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white">Đăng nhập</Link></li>
                <li><Link href="/login?mode=register" className="hover:text-white">Đăng ký</Link></li>
                <li><Link href="#verify" className="hover:text-white">Xác minh</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2026 SBT Credential. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
