const Footer = () => (
  <footer className="w-full border-t border-slate-100 bg-white">
    <div className="max-w-screen-xl mx-auto px-6 py-8 md:py-10">
      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 group-hover:bg-[#004fcb] transition-all duration-300 transform group-hover:-rotate-3">
              <svg className="w-7 h-7 text-[#004fcb] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-extrabold text-2xl text-slate-900 tracking-tight">BenchMock</div>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm max-w-xs">
            The world's leading <span className="text-[#004fcb] font-semibold">AI-powered</span> mock interview platform. Master your interviews with expert guidance.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-slate-50 border border-slate-100 hover:border-[#004fcb] hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-300 group">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-[#004fcb] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 bg-slate-50 border border-slate-100 hover:border-[#004fcb] hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-300 group">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-[#004fcb] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-6">
          <h3 className="font-bold text-[#004fcb] text-sm uppercase tracking-widest">Product</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Features</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Pricing</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Use Cases</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Testimonials</a></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="space-y-6">
          <h3 className="font-bold text-[#004fcb] text-sm uppercase tracking-widest">Resources</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Blog</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Documentation</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Support Center</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>API Status</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="space-y-6">
          <h3 className="font-bold text-[#004fcb] text-sm uppercase tracking-widest">Company</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>About Us</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Careers</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Contact Us</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Partners</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-slate-400 font-medium text-center md:text-left">
            © {new Date().getFullYear()} <span className="text-[#004fcb] font-bold">Mock Interview Platform</span>. All rights reserved.
            <p className="mt-1 text-xs text-slate-400 font-normal">Professional interview preparation with verified experts</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold uppercase tracking-wider">
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Terms</a>
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Cookies</a>
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Security</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;