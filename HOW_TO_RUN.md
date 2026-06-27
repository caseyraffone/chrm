# How to run CHRM and see the latest changes

A plain-English guide for getting the app running on your Mac after Claude pushes
new work. No deep technical knowledge needed — just copy/paste each command.

> Note: the GitHub repo is named **chrm**, but the folder on Casey's Mac is named
> **pitchiq** (the app's original name). That's fine — the folder name doesn't
> matter, only that you `cd` into the right folder.

---

## 1. Open Terminal
Press **⌘ + Space**, type **Terminal**, press Enter.

## 2. Find and enter the project folder
List what's in Documents:
```
ls ~/Documents
```
Find the app folder (likely **pitchiq**) and go into it:
```
cd ~/Documents/pitchiq
```
Confirm you're in the right place — this should list `App.js`, `src`, `package.json`:
```
ls
```

## 3. Get the latest changes from the cloud
```
git pull origin main
```

## 4. Start the app
```
source ~/.nvm/nvm.sh
npx expo start
```
A QR code and a menu appear.

## 5. Open it on a screen
- **iPhone:** open your installed **CHRM** dev app, or scan the QR code.
- **Mac simulator:** press the **`i`** key in the Terminal window.

> This app uses payments + voice features that only run in your real dev build
> (not the generic "Expo Go" app). JS changes show up automatically — no rebuild
> needed unless a *native* dependency was added.

---

## Where to tap to see recent changes
1. **Private Equity vertical + 242 questions:** Home → Interview Prep → Private
   Equity (now live) → pick a track → browse the bank.
2. **Progress tracking:** in any bank, header shows "X of N practiced"; answered
   questions get a "BEST n/10" pill.
3. **Delivery analytics:** do any drill → the feedback screen shows a DELIVERY
   card (words/min, filler words, a coaching tip).
4. **Smarter grading:** scores are consistent across modes; total silence shows a
   friendly "— / NO ANSWER DETECTED" instead of a 1/10.

---

## If something goes wrong
- **`cd: no such file or directory`** → the folder name is different. Run
  `ls ~/Documents` and look for the right one, or search:
  `find ~ -maxdepth 4 -name App.js 2>/dev/null`
- **`command not found: npx` or node errors** → run `source ~/.nvm/nvm.sh` first
  (Node is installed via NVM and isn't on the default path).
- **`git pull` asks about local changes / conflicts** → don't force anything;
  paste the message to Claude and ask what to do.
- **Anything red and confusing** → copy the text, paste it to Claude, and ask for
  a plain-English translation and the exact next command.
