const Footer = () => (
  <footer className="w-full border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-gray-600 to-gray-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-bold text-xl text-slate-900 tracking-tight">mockHire</div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Transform your interview skills with AI-powered mock sessions and real-time feedback.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-colors duration-200">
              <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-colors duration-200">
              <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Product</h3>
          <div className="space-y-3">
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Features</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Pricing</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Use Cases</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Testimonials</a>
          </div>
        </div>

        {/* Resources Column */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Resources</h3>
          <div className="space-y-3">
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Blog</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Documentation</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Support</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">API</a>
          </div>
        </div>

        {/* Company Column */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Company</h3>
          <div className="space-y-3">
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">About Us</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Careers</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Contact</a>
            <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Partners</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} mockHire. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">Cookie Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">Security</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;