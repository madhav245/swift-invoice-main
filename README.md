# 💰 Swift Invoice - Professional Invoice Management App

> A modern, fast, and secure invoice management application built with React, TypeScript, and Supabase.

## 📋 Features

- ✅ **Product Management** - Manage products with price, description, and images
- ✅ **Client Management** - Store and organize client information
- ✅ **Invoice Generation** - Create professional invoices with items, tax, and discounts
- ✅ **PDF Export** - Download invoices as PDF
- ✅ **WhatsApp Integration** - Send invoices directly via WhatsApp
- ✅ **Settings** - Customize company info, tax rates, and currency
- ✅ **PIN Security** - Secure app with PIN lock
- ✅ **Dark Mode** - Eye-friendly dark theme support
- ✅ **Cloud Database** - Supabase for data persistence
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Mobile**: Capacitor (Android/iOS)
- **Forms**: React Hook Form + Zod
- **Real-time Search**: TanStack React Query
- **PDF Generation**: html2canvas + jsPDF
- **Icons**: Lucide Icons

## 📱 Platform Support

- 🌐 **Web**: Any modern browser
- 📱 **Android**: Native APK (via Capacitor)
- 🍎 **iOS**: Native app (via Capacitor)

## 🔧 Setup & Installation

### Prerequisites
- Node.js >= 18
- npm or yarn
- Git
- Java (for Android APK building)

### Local Development

**1. Clone the repository:**
```bash
git clone https://github.com/madhav245/swift-invoice-main.git
cd swift-invoice-main
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create `.env.local` file:**
```bash
cp .env.example .env.local
```

**4. Add your Supabase credentials:**
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

**5. Start development server:**
```bash
npm run dev
```

Visit: `http://localhost:8080`

## 🏗️ Building for Production

**Web:**
```bash
npm run build
npm run preview
```

**Android APK:**
```bash
npm run build
npx cap add android
npx cap open android
# Build in Android Studio
```

## 📚 Project Structure

```
src/
├── components/       # React components
│   ├── BottomNav.tsx
│   ├── ClientForm.tsx
│   ├── ProductForm.tsx
│   └── ui/          # shadcn UI components
├── lib/
│   ├── storage.ts   # Supabase integration
│   ├── supabase.ts  # Supabase client
│   ├── types.ts     # TypeScript interfaces
│   ├── pdf.ts       # PDF generation
│   ├── whatsapp.ts  # WhatsApp API
│   └── utils.ts     # Utilities
├── pages/           # Page components
│   ├── ProductsPage.tsx
│   ├── ClientsPage.tsx
│   ├── OrdersPage.tsx
│   ├── InvoicesPage.tsx
│   ├── SettingsPage.tsx
│   └── NotFound.tsx
├── App.tsx
└── main.tsx
```

## 🗄️ Database Schema

### Products Table
```sql
- id (UUID)
- title (TEXT)
- description (TEXT)
- price (DECIMAL)
- image (TEXT)
- created_at (TIMESTAMP)
```

### Clients Table
```sql
- id (UUID)
- name (TEXT)
- phone (TEXT)
- address (TEXT)
- created_at (TIMESTAMP)
```

### Invoices Table
```sql
- id (UUID)
- invoice_number (TEXT)
- client_id (UUID)
- items (JSONB)
- subtotal, tax, discount, total (DECIMAL)
- created_at (TIMESTAMP)
```

### Settings Table
```sql
- company_name, company_logo, company_address, company_phone (TEXT)
- tax_rate, currency (TEXT/DECIMAL)
- dark_mode, pin_code (BOOLEAN/TEXT)
```

## 📖 How to Use

### As Developer
**Update code locally:**
```bash
# Make changes
git add .
git commit -m "Description"
git push origin main
```

**Use your preferred IDE**
If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in the live version.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make changes and commit.

## 💡 Tips

- 🔐 Always use `.env.local` for sensitive data (never commit)
- 🔑 Regenerate API keys if exposed publicly
- 📦 Install Supabase CLI for advanced database operations
- 🚀 Deploy to Vercel or Netlify for free hosting
- 📱 Use Capacitor for native app builds

## 🚀 Deployment

### Web Deployment (Vercel - Recommended)
```bash
npm install -g vercel
vercel
```

### Mobile Deployment (Google Play Store)
1. Build APK: `npx cap open android`
2. Create Google Play Developer account ($25)
3. Upload APK and submit for review

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📄 License

This project is private. Do not share without permission.

## 👤 Author

**Madhav Prajapati**
- GitHub: [@madhav245](https://github.com/madhav245)
- Email: madhav@example.com

## 🆘 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with details
3. Include error logs and screenshots

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Capacitor Guide](https://capacitorjs.com)
- [Vite Guide](https://vitejs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Made with ❤️ using React + Supabase**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
