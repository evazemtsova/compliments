<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Ежедневный Комплимент (Daily Compliment)

A minimalist React application that displays a daily compliment based on the day of the year. Built with React, TypeScript, Vite, Tailwind CSS, and Motion for elegant animations.

View your app in AI Studio: https://ai.studio/apps/2b7e23e9-9fb7-49ff-90ed-da0f3928c77e

## Features

- 📅 **Daily Compliment**: Displays a unique compliment for each day of the year (365 days)
- 🎨 **Swiss Design Aesthetic**: Clean, minimalist UI with structural lines and elegant typography
- ✨ **Smooth Animations**: Powered by Motion (Framer Motion) for elegant entrance animations
- 📱 **Responsive Design**: Works seamlessly on all device sizes
- 🔗 **Share Functionality**: Share the daily compliment via native share or clipboard
- 🌐 **Russian Language**: Interface and compliments in Russian

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Motion** - Animation library
- **Lucide React** - Icons
- **Google Generative AI** - AI integration support

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
```

> **Note**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Run TypeScript type checking |

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   ├── index.css       # Global styles and Tailwind config
│   └── lib/
│       └── compliments.ts  # Daily compliments data
├── .env.example        # Environment variables template
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## How It Works

The app calculates the current day of the year (1-365) and displays the corresponding compliment from the predefined list. The compliment rotates annually, ensuring the same day always shows the same message.

### Share Feature

- On mobile devices with share support: Opens native share dialog
- On desktop or unsupported browsers: Copies text to clipboard with toast notification

## Deployment

### Deploy to AI Studio

1. View and manage your app: https://ai.studio/apps/2b7e23e9-9fb7-49ff-90ed-da0f3928c77e
2. Secrets (like `GEMINI_API_KEY`) are automatically injected at runtime from AI Studio secrets

### Manual Deployment

Build the production bundle:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and intended for use with Google AI Studio.

## Acknowledgments

- Built with [Google AI Studio](https://ai.studio/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Motion](https://motion.dev/)
