# 🌊 Flood Analyser

A comprehensive flood risk assessment system built with Next.js, React Leaflet, and Google Gemini AI, deployed entirely on Vercel.

## 🚀 Features

- **Interactive Map**: Click to select coordinates for analysis
- **Coordinate Analysis**: Input latitude/longitude for flood risk assessment
- **Image Analysis**: Upload images for AI-powered flood detection
- **Real-time Risk Assessment**: Get detailed risk levels and recommendations
- **AI-Powered Insights**: Powered by Google Gemini AI
- **Responsive Design**: Works on desktop and mobile devices
- **Full-Stack on Vercel**: Frontend and backend deployed as one application

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React Leaflet** - Interactive maps
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **TypeScript** - Type safety

### Backend (Vercel API Routes)
- **Next.js API Routes** - Serverless backend
- **Google Gemini AI** - AI analysis
- **TypeScript** - Type-safe API development

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Google Gemini API key

### Local Development Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd flood-analyser

# Install dependencies
npm install

# Create environment file
echo "GEMINI_API_KEY=your-gemini-api-key-here" > .env.local

# Run development server
npm run dev
```

## 🌐 Deployment

### **Deploy to Vercel (Recommended)**

1. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `GEMINI_API_KEY=your-api-key`
   - Deploy automatically

3. **Access Your App:**
   - Frontend: `https://your-app.vercel.app`
   - API: `https://your-app.vercel.app/api/*`

## 🔧 Configuration

### **Environment Variables**

```bash
GEMINI_API_KEY=your-gemini-api-key
```

### **API Endpoints**

- `GET /api/health` - Health check
- `POST /api/analyze/coordinates` - Coordinate analysis
- `POST /api/analyze/image` - Image analysis

## 🗺️ Map Configuration

The application uses React Leaflet with OpenStreetMap tiles. The map is configured to:
- Prevent multiple initializations
- Handle click events for coordinate selection
- Display markers and risk assessment circles
- Support responsive design

## 🚨 Troubleshooting

### **Common Issues**

1. **API Key Issues**
   - Ensure `GEMINI_API_KEY` is set correctly
   - Check API key permissions and quotas

2. **Map Loading Issues**
   - The app includes safeguards against initialization errors
   - If issues occur, refresh the page

3. **Function Timeout**
   - AI analysis has 60-second timeout
   - Consider optimizing prompts for faster responses

### **Performance Optimization**

- Images are optimized using Next.js Image component
- Bundle size is optimized with tree shaking
- API responses are cached where appropriate

## 📝 API Documentation

Once deployed, visit:
- Health Check: `https://your-app.vercel.app/api/health`
- Swagger-like documentation available in the app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the deployment guide
3. Open an issue on GitHub

## 🎯 Quick Start

```bash
# Clone and setup
git clone <your-repo-url>
cd flood-analyser
npm install

# Add your API key
echo "GEMINI_API_KEY=your-key" > .env.local

# Run locally
npm run dev

# Deploy to Vercel
# Push to GitHub and connect to Vercel
```
