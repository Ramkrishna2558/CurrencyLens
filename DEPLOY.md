# Deployment Guide

## Git Repository (Local âœ…)

Your code is already committed locally! To push to GitHub:

### Option 1: Using GitHub Web Interface (Easiest)

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named **MudraLens**
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **Create repository**
5. Copy the HTTPS or SSH URL shown (e.g., `https://github.com/YOUR_USERNAME/MudraLens.git`)
6. Run these commands:

```powershell
cd C:\PersonaProjects\MudraLens
git remote add origin YOUR_REPO_URL_HERE
git branch -M main
git push -u origin main
```

### Option 2: Using GitHub CLI (Install first)

1. Install GitHub CLI: `winget install GitHub.cli`
2. Authenticate: `gh auth login`
3. Run:

```powershell
cd C:\PersonaProjects\MudraLens
gh repo create MudraLens --public --source=. --remote=origin --push
```

---

## Next Steps

### 1. Generate Icons
- Open `generate-icons.html` in a browser
- Download all three PNG files
- Place them in the `icons/` folder
- Commit and push:
  ```powershell
  git add icons/*.png
  git commit -m "Add extension icons"
  git push
  ```

### 2. Test Locally (Sideload)
- Open Chrome â†’ `chrome://extensions`
- Enable **Developer mode**
- Click **Load unpacked** â†’ select `C:\PersonaProjects\MudraLens`
- Test on any website with prices

### 3. Package for Distribution
```powershell
.\pack.ps1
```
This creates `MudraLens.zip` (ready for Chrome Web Store / Edge Add-ons)

### 4. Publish to Chrome Web Store
- Pay one-time $5 developer fee at [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
- Click **New Item** â†’ upload `MudraLens.zip`
- Fill in listing details (use `store/description.txt`)
- Add screenshots (1280Ã—800 recommended)
- Submit for review (1-3 days)

### 5. Publish to Edge Add-ons (Optional, FREE)
- Go to [partner.microsoft.com/dashboard/microsoftedge](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)
- Upload the same `MudraLens.zip`
- No fee required for Edge!

---

## Repository Settings

Once your repo is on GitHub, update these:

1. **README.md** â€” Change the open source link:
   ```markdown
   Open source: https://github.com/YOUR_USERNAME/MudraLens
   ```

2. **store/description.txt** â€” Same link update

3. Add repository topics on GitHub: `chrome-extension`, `currency-converter`, `manifest-v3`, `exchange-rates`

4. Optional: Enable GitHub Pages for documentation

