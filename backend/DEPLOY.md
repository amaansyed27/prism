# Prism Backend - Production Ready

## Render Deployment Configuration

### Environment Variables Required:
- `MONGODB_URI`: mongodb+srv://rohitisgr8:rohitisgr8@cluster0dawnofcode.zde6piv.mongodb.net/prism?retryWrites=true&w=majority&appName=Cluster0DawnOfCode
- `JWT_SECRET`: PrismDawnOfCode2025SecureJWTSigningKey#SuperSecret$Token&Authentication!System
- `JWT_EXPIRES_IN`: 604800
- `NODE_ENV`: production
- `PORT`: 10000 (Render default)

### Build Commands:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### Health Check:
- Endpoint: `/api/status`
- Expected: `{"status":"ok","timestamp":"...","database":"connected","version":"2.0.0"}`