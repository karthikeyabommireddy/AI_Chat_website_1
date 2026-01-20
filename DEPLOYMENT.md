# 🚀 Deployment Guide - AI Support Chat Platform

This guide covers deploying the AI Support Chat Platform for **FREE** using:
- **Frontend**: Netlify (Free tier)
- **Backend**: Render (Free tier)
- **Database**: MongoDB Atlas (Already configured - Free tier)

---

## 📋 Prerequisites

1. GitHub account (to host your code)
2. Netlify account (https://netlify.com - sign up with GitHub)
3. Render account (https://render.com - sign up with GitHub)

---

## Step 1: Push Code to GitHub

### Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `ai-support-chat`)
3. Initialize with NO README, .gitignore, or license

### Push Your Code

Open terminal in the project root folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote origin (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/ai-support-chat.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository you just created

### 2.2 Configure the Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `ai-support-chat-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://chatadmin:2uCSG4s32Hwm0N1k@cluster0.0cssxdf.mongodb.net/ai_support_chat` |
| `JWT_SECRET` | (generate a random string - use https://randomkeygen.com) |
| `AI_PROVIDER` | `google` |
| `GOOGLE_API_KEY` | `AIzaSyAGNnkdvGgDVPaIUYA8bLtSPQkOt2xZFmg` |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `CORS_ORIGIN` | (leave empty for now, update after deploying frontend) |

### 2.4 Create Service

1. Click **"Create Web Service"**
2. Wait for deployment (takes 3-5 minutes)
3. Copy your backend URL (e.g., `https://ai-support-chat-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Netlify

### 3.1 Import from GitHub

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select your repository

### 3.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` |

### 3.3 Add Environment Variable

Click **"Add environment variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api` |

⚠️ Replace `YOUR-BACKEND-URL` with your actual Render backend URL from Step 2.4

### 3.4 Deploy

1. Click **"Deploy site"**
2. Wait for deployment (takes 1-2 minutes)
3. Copy your frontend URL (e.g., `https://your-site-name.netlify.app`)

---

## Step 4: Update Backend CORS

Go back to Render Dashboard:

1. Select your backend service
2. Go to **"Environment"** tab
3. Update `CORS_ORIGIN` with your Netlify URL:
   - Value: `https://your-site-name.netlify.app`
4. Click **"Save Changes"**
5. The service will automatically redeploy

---

## Step 5: Seed the Database

After backend is deployed, seed the admin user:

1. Go to your backend URL + `/api/health` to verify it's running
2. The admin user should already exist from previous setup
3. If not, you can call the seed endpoint or use the app to register

---

## 🎉 You're Done!

Your app is now live at:
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://your-backend.onrender.com`

### Login Credentials
- **Email**: `admin@example.com`
- **Password**: `Admin@123`

---

## 🔧 Troubleshooting

### Backend not starting?
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### CORS errors?
- Update `CORS_ORIGIN` in Render to match your exact Netlify URL
- Make sure there's no trailing slash in the URL

### API calls failing?
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly in Netlify
- Check if backend is running at the health endpoint

### Free tier limitations
- **Render**: Service spins down after 15 minutes of inactivity
  - First request after idle will take 30-50 seconds
  - Subsequent requests are fast
- **Netlify**: Generous free tier, no major limitations
- **MongoDB Atlas**: 512MB storage limit on free tier

---

## 📱 Custom Domain (Optional)

### Netlify
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

### Render
1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your domain and configure DNS

---

## 🔒 Security Notes for Production

1. **Change JWT_SECRET**: Use a strong random string (32+ characters)
2. **Rotate API Keys**: Consider getting your own Gemini API key
3. **Change Admin Password**: Update immediately after first login
4. **MongoDB Security**: Create a new database user with limited permissions
5. **Enable HTTPS**: Both Netlify and Render provide free SSL certificates

---

## 📞 Contact Information

For support, reach out to:
- Email: karthikeya.reddy.2201@gmail.com
- Email: karthikeya1111reddy@gmail.com
- Phone: +91 7095226951
