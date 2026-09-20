# Midnight Builder Challenge — Final Submission Checklist

## Before Recording Demo

- [ ] Close all unnecessary browser tabs
- [ ] Set browser zoom to 100%
- [ ] Open https://privateskill-midnight.vercel.app
- [ ] Open DEMO_SCRIPT.md in a second window
- [ ] Test screen recording software (OBS / Xbox Game Bar / Loom)
- [ ] Test microphone
- [ ] Read through the script once (practice run)
- [ ] Quiet room, no distractions

## During Recording

- [ ] 0:00–0:20 — Introduction, show welcome screen, click Connect Wallet
- [ ] 0:20–0:45 — Explain Lace connector error (expected behavior)
- [ ] 0:45–1:10 — Show verification form, explain public inputs only
- [ ] 1:10–1:35 — Explain proof flow and result banner
- [ ] 1:35–2:00 — Highlight privacy notice, close with footer
- [ ] Video is under 2 minutes

## After Recording

- [ ] Trim video to 2 minutes or less
- [ ] Upload to YouTube / Loom / Google Drive
- [ ] Set video to "Public" or "Unlisted" (not Private)
- [ ] Copy the video URL

## Update README

- [ ] Open README.md
- [ ] Find: `🎬 **[Demo Video — record and upload, then update this link]**`
- [ ] Replace with: `🎬 **[Demo Video](YOUR_VIDEO_URL)**`
- [ ] Save the file

## Commit and Push

```bash
git add README.md
git commit -m "docs: add demo video link"
git push
```

- [ ] Changes committed
- [ ] Changes pushed to GitHub

## Rise In Submission

Go to: https://www.risein.com (or the specific challenge page)

Fill in the form:

**GitHub Repository:**
```
https://github.com/omkarjagtap2105-design/-PrivateSkill-Midnight
```

**Live Demo URL:**
```
https://privateskill-midnight.vercel.app
```

**Demo Video URL:**
```
[PASTE YOUR VIDEO URL HERE]
```

**Project Name:**
```
PrivateSkill
```

**Description:**
```
Privacy-preserving ZK credential verification on Midnight Network. Prove your skill score meets a threshold without revealing the exact score.
```

**Tech Stack:**
```
Compact, TypeScript, React, Vite, Lace Wallet, Vercel, GitHub Actions
```

- [ ] Form submitted on Rise In

## Final Verification

- [ ] GitHub repo is public and accessible
- [ ] Live demo loads without errors
- [ ] Demo video plays and is under 2 minutes
- [ ] README has all three links (GitHub, Demo, Video)
- [ ] Submission confirmation received from Rise In

---

## You're Done!

✅ All Level 1, 2, and 3 requirements complete
✅ Production-ready submission
✅ Professional documentation
✅ 23+ meaningful commits
✅ CI passing
✅ Tests passing (11 passing / 2 skipped — no failures)
✅ Frontend deployed

Congratulations!
