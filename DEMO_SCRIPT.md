# PrivateSkill Demo Video Script (< 2 minutes)

## Recording Setup

**Tools you need:**
- Screen recording software:
  - Windows: Xbox Game Bar (Win + G)
  - Or: OBS Studio (free, download from obsproject.com)
  - Or: Loom (loom.com — records directly to cloud)
- Microphone (optional but recommended)
- Browser with https://privateskill-midnight.vercel.app open

**Before you start:**
1. Close unnecessary browser tabs
2. Set browser zoom to 100%
3. Open https://privateskill-midnight.vercel.app
4. Test your microphone
5. Practice reading the script once

---

## Script (Read this while recording)

### 0:00–0:20 — Introduction & Wallet Connection

**ACTION:** Show the live app at https://privateskill-midnight.vercel.app

**SAY:**
> "This is PrivateSkill — a privacy-preserving credential verification system built on Midnight Network.
> 
> The welcome screen shows three key privacy guarantees: your exact score is never revealed, proof generation happens locally in your wallet, and only a boolean result is stored on-chain.
> 
> Let me connect the Lace wallet..."

**ACTION:** Click the "Connect Lace Wallet" button in the header.

---

### 0:20–0:45 — Wallet Connection Error (Expected Behavior)

**ACTION:** Wait for the error message to appear.

**SAY:**
> "You'll see an error here because the standard Lace wallet from lace.io injects window.cardano for Cardano transactions.
> 
> But Midnight dapps require a different connector — window.midnight.mnLace — which is only available in the Midnight-enabled Lace build from docs.midnight.network.
> 
> This is expected behavior for the current developer preview. In production, users would install the Midnight Lace extension.
> 
> Let me show you the verification interface..."

**ACTION:** Scroll down to show the full page, or show the CircuitCall component if visible when disconnected (it won't be, but gesture toward where it would appear).

---

### 0:45–1:10 — Privacy-by-Design UI

**ACTION:** Point to (or describe) the verification form fields.

**SAY:**
> "The verification form demonstrates privacy-by-design. Notice there are only TWO input fields:
> 
> First, the credential commitment — this is the public on-chain identifier, a cryptographic hash that binds the private score, certificate ID, and holder identity without revealing them.
> 
> Second, the threshold — the minimum score requirement, fully public.
> 
> What you DON'T see here is critical: there are no input fields for score, certificate ID, holder identity, or commitment opening. Those are private witnesses — they're supplied by the Lace wallet during proof generation and never pass through the web interface."

**ACTION:** Hover over or point to where the inputs would be if connected.

---

### 1:10–1:35 — Proof Flow & Result

**ACTION:** Point to the "Verify Skill" button.

**SAY:**
> "When a connected user clicks 'Verify Skill,' the button changes to show the proof generation steps: first 'Preparing proof inputs,' then 'Generating zero-knowledge proof' — which can take a moment because the ZK circuit is running locally — and finally 'Submitting transaction to Midnight Network.'
> 
> The result is displayed as a simple banner: either a green checkmark with 'Skill verified — threshold met,' or a red X with 'Threshold not met.'
> 
> The employer sees only this boolean result. They never see the exact score or any private credential details."

---

### 1:35–2:00 — Privacy Notice & Closing

**ACTION:** Point to the blue privacy notice box at the top of the verification card.

**SAY:**
> "The privacy notice is always visible: 'Your private credential data is processed locally by your wallet — it is never sent to any server or stored on-chain.'
> 
> This is the core value proposition of Midnight Network — zero-knowledge proofs are generated natively in the smart contract layer using the Compact language. Private circuit parameters stay private. Only values explicitly wrapped in disclose() reach the ledger.
> 
> PrivateSkill demonstrates end-to-end privacy-preserving credential verification: a credential holder can prove their score meets an employer's threshold without revealing the score, the certificate ID, or their identity.
> 
> The complete source code, contracts, and tests are available on GitHub. Thank you."

**ACTION:** Show the footer: "Built on Midnight Network · Powered by Lace Wallet"

**ACTION:** Stop recording.

---

## After Recording

1. **Trim** the video to exactly 2 minutes or less.
2. **Upload** to:
   - YouTube (unlisted or public)
   - Loom (loom.com)
   - Google Drive (set to "Anyone with the link can view")
3. **Copy the URL**
4. **Update README.md** — replace the placeholder with your real URL
5. **Commit and push**:
   ```
   git add README.md
   git commit -m "docs: add demo video link"
   git push
   ```
6. **Submit on Rise In** with all three URLs (GitHub, Live Demo, Video)

---

## Tips

- **Speak clearly and confidently** — you're demonstrating expertise.
- **Don't apologize for the Lace connection issue** — it's expected behavior in the developer preview.
- **Focus on the privacy model** — that's what makes this project unique.
- **Stay under 2 minutes** — practice once to get the timing right.
- **Use a quiet room** — background noise ruins audio.

Good luck!
