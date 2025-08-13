# Vercel Deployment Guide

## Full-Stack Deployment on Vercel

Your flood-analyser project is now configured to run entirely on Vercel! Both the frontend and backend API are deployed as a single application.

## 🚀 Deployment Steps

### 1. **Environment Variables Setup**

In your Vercel project settings, add the following environment variable:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

**Important:** Do NOT add `NEXT_PUBLIC_API_BASE_URL` as the API now runs on the same domain.

### 2. **Get Your Gemini API Key**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to Vercel environment variables

### 3. **Deploy to Vercel**

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Set Environment Variables:**
   - In project settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key
   - Deploy to Production

3. **Deploy:**
   - Vercel will automatically build and deploy
   - Each push to main branch triggers a new deployment

## 🏗️ Architecture

### **Frontend (Next.js App Router)**
- `app/page.tsx` - Main flood detection interface
- `components/` - React components including interactive map
- `app/globals.css` - Tailwind CSS styles

### **Backend (Vercel API Routes)**
- `api/analyze/coordinates/route.ts` - Coordinate analysis endpoint
- `api/analyze/image/route.ts` - Image analysis endpoint
- `api/health/route.ts` - Health check endpoint
- `lib/gemini.ts` - Gemini AI integration

### **API Endpoints**
- `GET /api/health` - Health check
- `POST /api/analyze/coordinates` - Analyze coordinates
- `POST /api/analyze/image` - Analyze uploaded images

## 🔧 Configuration

### **Vercel Configuration**
- `vercel.json` - Deployment settings
- `next.config.ts` - Next.js optimization
- Function timeout: 60 seconds for AI processing

### **Environment Variables**
```
GEMINI_API_KEY=your-gemini-api-key
```

## 🧪 Testing

After deployment:
1. Visit your Vercel URL
2. Test coordinate analysis by entering lat/lng
3. Test image upload functionality
4. Verify map interactions work correctly
5. Check that AI analysis returns proper results

## 🚨 Troubleshooting

### **Common Issues:**

1. **API Key Issues**
   - Ensure `GEMINI_API_KEY` is set correctly in Vercel
   - Check API key permissions and quotas

2. **Function Timeout**
   - AI analysis might take time - 60-second timeout configured
   - Consider optimizing prompts for faster responses

3. **CORS Issues**
   - No CORS issues since frontend and API are on same domain

4. **Map Loading**
   - Ensure Leaflet CSS and JS load properly
   - Check for any console errors

### **Performance Optimization:**

1. **AI Response Caching**
   - Consider implementing response caching
   - Use Vercel Edge Functions for faster responses

2. **Image Optimization**
   - Images are processed server-side
   - Consider client-side image compression

3. **Bundle Size**
   - Monitor bundle size in Vercel analytics
   - Optimize imports where needed

## 📊 Monitoring

- **Vercel Analytics**: Monitor performance and usage
- **Function Logs**: Check API route execution logs
- **Error Tracking**: Monitor for any deployment issues

## 🔄 Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Vercel automatically redeploys
3. Check deployment logs for any issues
4. Test functionality on the new deployment

## 💡 Tips

- **Development**: Use `npm run dev` for local testing
- **Environment**: Use Vercel's preview deployments for testing
- **API Testing**: Use the health endpoint to verify deployment
- **Monitoring**: Set up alerts for function failures
