# Instinct.fi - Coming Soon Page

A modern, responsive landing page for Instinct.fi with waitlist functionality.

## Project info

**URL**: https://lovable.dev/projects/9ee9a818-5ed7-4f1a-9ee6-5d78efe8b012

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **Shadcn UI** - Component library based on Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **Web3Forms** - Form backend service

## Setup Instructions

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Web3Forms account (free) - [Get access key](https://web3forms.com)

### Installation Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd instinct-chaotic-learn

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
# Create a .env file in the root directory
cp .env.example .env

# Step 5: Add your Web3Forms access key to .env
# VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here

# Step 6: Start the development server
npm run dev
```

## Getting Your Web3Forms Access Key

1. Go to [web3forms.com](https://web3forms.com)
2. Sign up for a free account
3. Create a new form
4. Copy your Access Key
5. Add it to your `.env` file:
   ```
   VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here
   ```

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Web3Forms Access Key
# Get your free access key from https://web3forms.com
VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here
```

**Note:** Never commit your `.env` file to version control. The `.env` file is already included in `.gitignore`.

## Development

```sh
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
instinct-chaotic-learn/
├── src/
│   ├── components/
│   │   ├── HeroSection.tsx       # Landing hero with CTA
│   │   ├── ProblemSection.tsx    # Problem statement
│   │   ├── OpportunitySection.tsx # Market opportunity
│   │   ├── SolutionSection.tsx   # Our solution
│   │   ├── FeaturesSection.tsx   # Key features
│   │   ├── ClosingSection.tsx    # Waitlist form (Web3Forms integrated)
│   │   ├── StickyHeader.tsx      # Navigation header
│   │   └── ui/                   # Shadcn UI components
│   ├── pages/
│   │   ├── Index.tsx             # Main landing page
│   │   └── NotFound.tsx          # 404 page
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions
│   └── App.tsx                   # Root component
├── public/                       # Static assets
└── package.json
```

## Features

- ✅ Modern, responsive design
- ✅ Smooth scrolling and animations
- ✅ Email validation
- ✅ Toast notifications
- ✅ Web3Forms integration (no backend needed)
- ✅ Dark mode support
- ✅ Mobile-optimized
- ✅ SEO-friendly
- ✅ TypeScript for type safety

## Editing the Project

### Use Lovable (Recommended)

Simply visit the [Lovable Project](https://lovable.dev/projects/9ee9a818-5ed7-4f1a-9ee6-5d78efe8b012) and start prompting. Changes made via Lovable will be committed automatically to this repo.

### Use Your Preferred IDE

Make changes locally and push to the repository. Pushed changes will also be reflected in Lovable.

### Edit Directly in GitHub

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon)
- Make your changes and commit

### Use GitHub Codespaces

- Navigate to the main page of your repository
- Click on the "Code" button (green button)
- Select the "Codespaces" tab
- Click on "New codespace"

## Deployment

### Deploy to Railway (Recommended for Production)

**Quick Start:** See [RAILWAY_QUICKSTART.md](./RAILWAY_QUICKSTART.md) for 5-minute deployment guide.

**Full Guide:** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for comprehensive documentation.

```bash
# Test production build locally
npm run build
npm run start

# Deploy to Railway
# 1. Push to GitHub
# 2. Connect repo in Railway dashboard
# 3. Set environment variables
# 4. Deploy automatically
```

### Deploy via Lovable

Simply open [Lovable](https://lovable.dev/projects/9ee9a818-5ed7-4f1a-9ee6-5d78efe8b012) and click on **Share → Publish**.

### Deploy to Other Platforms

This is a standard Vite + React app and can be deployed to:
- **Railway** - Recommended (see guides above)
- **Vercel** - `vercel deploy`
- **Netlify** - `netlify deploy`
- **GitHub Pages** - Build and push `dist/` folder
- **Cloudflare Pages** - Connect GitHub repo

**Important:** Make sure to set your environment variables on the deployment platform:
- `VITE_WEB3FORMS_ACCESS_KEY`
- See `env.template` for additional environment variables

## Custom Domain

To connect a custom domain, navigate to **Project > Settings > Domains** and click **Connect Domain**.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Web3Forms Configuration

The waitlist form is configured to:
- Send submissions to your Web3Forms dashboard
- Display success/error toasts to users
- Validate email addresses client-side
- Prevent duplicate submissions
- Show loading states

### Accessing Submissions

1. Log in to [web3forms.com](https://web3forms.com)
2. Go to your dashboard
3. View all waitlist submissions
4. Export to CSV if needed
5. Set up email notifications (optional)

### Customizing the Form

Edit `src/components/ClosingSection.tsx` to:
- Add more form fields (name, company, etc.)
- Change the success message
- Customize error handling
- Modify the form layout

Example with additional fields:
```typescript
body: JSON.stringify({
  access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
  name: name,           // Add name field
  email: email,
  company: company,     // Add company field
  subject: "New Waitlist Signup - Instinct.fi",
  from_name: "Instinct.fi Waitlist",
}),
```

## Support

For issues or questions:
- Create an issue in the GitHub repository
- Contact via the Lovable platform
- Email: support@instinct.fi

## License

© 2025 Instinct.fi. All rights reserved.

---

Built in collaboration with **Superteam Indonesia** 🚀
