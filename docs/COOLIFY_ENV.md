# Coolify Environment Variables Configuration

Complete guide for configuring AccessLens in Coolify.

## Required Environment Variables

These are **mandatory** - the app will not start without them:

### MongoDB Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accesslens
```
- **Description**: MongoDB connection string
- **Example (Atlas)**: `mongodb+srv://user:pass@cluster.mongodb.net`
- **Example (Local)**: `mongodb://localhost:27017`
- **Note**: Include database name in connection string or use `MONGODB_DB`

```
MONGODB_DB=accesslens_prod
```
- **Description**: Database name
- **Default**: Not set (must be provided)
- **Note**: Can be included in `MONGODB_URI` instead

### Session Security
```
SESSION_SECRET=your-super-secret-key-minimum-32-characters-long-change-this
```
- **Description**: Secret key for encrypting session cookies
- **Required**: Minimum 32 characters
- **Generate**: Use a secure random string generator
- **Example**: `openssl rand -base64 32`

```
SESSION_COOKIE_NAME=accesslens_session
```
- **Description**: Name of the session cookie
- **Default**: `accesslens_session` (optional, but recommended to set explicitly)

### Application URL
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```
- **Description**: Public URL of your application
- **Example**: `https://accesslens.yourdomain.com`
- **Note**: Must match your Coolify domain
- **Important**: Must start with `https://` in production

## Optional Environment Variables

These have defaults but can be customized:

### Node Environment
```
NODE_ENV=production
```
- **Description**: Node.js environment
- **Default**: `production` (set automatically by Coolify)
- **Note**: Usually set automatically, but can override

### Email Configuration (Optional - for future features)
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```
- **Description**: Resend API key for transactional emails
- **Required**: Only if using email features
- **Get**: Sign up at https://resend.com

```
RESEND_FROM_EMAIL=AccessLens <noreply@yourdomain.com>
```
- **Description**: Email address for sending emails
- **Required**: Only if using email features
- **Format**: `Name <email@domain.com>`

### JWT Secret (Optional - for future JWT features)
```
JWT_SECRET=another-secret-key-minimum-32-characters
```
- **Description**: Secret for JWT token signing
- **Required**: Only if using JWT authentication
- **Generate**: Use a secure random string generator

## Coolify Configuration Steps

### 1. Navigate to Your Application
- Go to your AccessLens deployment in Coolify
- Click on **"Configuration"** tab
- Scroll to **"Environment Variables"** section

### 2. Add Required Variables

Click **"Add Environment Variable"** for each:

| Variable Name | Value | Required |
|--------------|-------|----------|
| `MONGODB_URI` | Your MongoDB connection string | ✅ Yes |
| `MONGODB_DB` | `accesslens_prod` (or your DB name) | ✅ Yes |
| `SESSION_SECRET` | Generate with `openssl rand -base64 32` | ✅ Yes |
| `SESSION_COOKIE_NAME` | `accesslens_session` | ⚠️ Recommended |
| `NEXT_PUBLIC_APP_URL` | `https://your-coolify-domain.com` | ✅ Yes |

### 3. Add Optional Variables (if needed)

| Variable Name | Value | When Needed |
|--------------|-------|-------------|
| `RESEND_API_KEY` | Your Resend API key | If using emails |
| `RESEND_FROM_EMAIL` | `AccessLens <noreply@domain.com>` | If using emails |
| `JWT_SECRET` | Generate secure random string | If using JWT |

### 4. Save and Redeploy

After adding all variables:
1. Click **"Save"** or **"Update"**
2. Go to **"Deployments"** tab
3. Click **"Deploy"** to apply changes

## Example Configuration

Here's a complete example for Coolify:

```env
# MongoDB (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=accesslens_prod

# Session Security (Required)
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
SESSION_COOKIE_NAME=accesslens_session

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://b04o4ocg4g888wo080o44o40.danspelt.ca

# Node Environment (Auto-set by Coolify)
NODE_ENV=production

# Email (Optional - for future)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=AccessLens <noreply@accesslens.app>
```

## Generating Secure Secrets

### Using OpenSSL (Linux/Mac/Git Bash)
```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Using Online Generator
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" (256-bit)

## MongoDB Atlas Setup

If using MongoDB Atlas:

1. **Create Cluster**: https://cloud.mongodb.com
2. **Create Database User**:
   - Username: `accesslens`
   - Password: Generate secure password
3. **Whitelist IP**: Add `0.0.0.0/0` (or Coolify server IP)
4. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://accesslens:password@cluster.mongodb.net`

## Verification

After deployment, verify environment variables are loaded:

1. **Check Health Endpoint**:
   ```bash
   curl https://your-domain.com/api/health
   ```
   Should return: `{"status":"ok","database":"connected"}`

2. **Check Application Logs**:
   - In Coolify, go to **"Logs"** tab
   - Look for: `MongoDB connected` (if using Mongoose)
   - No errors about missing environment variables

## Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"
- **Solution**: Add `MONGODB_URI` in Coolify environment variables
- **Check**: Make sure variable name is exactly `MONGODB_URI` (case-sensitive)

### Error: "Please define the MONGODB_DB environment variable"
- **Solution**: Add `MONGODB_DB` in Coolify
- **Alternative**: Include database name in `MONGODB_URI` connection string

### Error: "Database disconnected" in health check
- **Solution**: Check MongoDB connection string is correct
- **Check**: Verify MongoDB Atlas IP whitelist includes Coolify server
- **Check**: Verify database user credentials

### Session not persisting
- **Solution**: Ensure `SESSION_SECRET` is at least 32 characters
- **Check**: `SESSION_COOKIE_NAME` matches in middleware
- **Check**: `NEXT_PUBLIC_APP_URL` matches your domain

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use different secrets** for development and production
3. **Rotate secrets** periodically
4. **Use MongoDB Atlas** IP whitelisting (not `0.0.0.0/0` in production)
5. **Use strong passwords** for MongoDB users
6. **Enable MongoDB Atlas** network encryption

## Quick Reference Checklist

Before deploying to Coolify, ensure you have:

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `MONGODB_DB` - Database name
- [ ] `SESSION_SECRET` - 32+ character random string
- [ ] `SESSION_COOKIE_NAME` - Cookie name (recommended)
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL
- [ ] MongoDB cluster created and accessible
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (if using Atlas)

