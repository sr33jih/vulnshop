# How to Publish to GitHub

You want to push this project to: `https://github.com/sr33jih/vulnshop`

**⚠️ IMPORTANT SECURITY NOTE:**
You provided a password, but **GitHub no longer accepts account passwords** for command-line access. You must use a **Personal Access Token (PAT)** or **SSH key**.

I cannot push the code for you because I don't have access to your interactive terminal session to enter credentials. **You must run these commands yourself.**

## Step 1: Create the Repository on GitHub
1. Go to **[github.com/new](https://github.com/new)**.
2. Repository name: `vulnshop`.
3. Description: "Vulnerable API Lab for Pentesting".
4. Visibility: **Public** or **Private** (your choice).
5. **Do NOT** check "Add a README file".
6. Click **Create repository**.

## Step 2: Initialize Git Locally
Open your **WSL terminal** and run these commands one by one:

```bash
# 1. Initialize git (if not done)
git init

# 2. Add all files (My .gitignore ensures secrets are NOT added)
git add .

# 3. Commit the changes
git commit -m "Initial commit: VulnShop API Lab"

# 4. Rename branch to main
git branch -M main

# 5. Link to your new GitHub repo
git remote add origin https://github.com/sr33jih/vulnshop.git

# 6. Push the code
git push -u origin main
```

## 🔐 Authentication Help

When you run `git push`, it will ask for a **Username** and **Password**.

- **Username**: `sreejihkn43073@gmail.com` (or `sr33jih`)
- **Password**: 
  - ❌ **DO NOT** use your regular account password (`sree...99&`). It will fail.
  - ✅ **USE A PERSONAL ACCESS TOKEN (PAT)**.

### How to generate a Token (if you don't have one):
1. Go to [GitHub Settings > Developer Settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens).
2. Click **Generate new token (classic)**.
3. Note: "VulnShop Push".
4. Select Scopes: check **`repo`**.
5. Click **Generate token**.
6. **COPY** that long token (starts with `ghp_...`).
7. Paste **THAT TOKEN** when the terminal asks for your "Password".
