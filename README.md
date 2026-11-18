# Bulldogs Build

Type a project idea and get a ranked shop path: machines, training, materials, and a build sequence from public Yale shop pages. Not an official Yale system.

Grok screenshot:
<img width="1914" height="1119" alt="image" src="https://github.com/user-attachments/assets/ebadbac3-3c5a-4b71-8466-2efa3c00b9e6" />

## Demo
54-second walkthrough: https://pomf2.lain.la/f/2r2iitqu.mp4

## What it does
- Ranks fabrication routes from the brief plus constraints: budget, size, material, experience, precision, stress, water/heat, and time.
- Budget slider runs $20–$500 and starts at $100. Type a number outside that range and the ranker still uses it.
- Brief tab: **Suggest a project** fills in an idea a student might actually build.
- Compare up to three routes, then a bill of materials, steps, risks, and a before-you-visit checklist.
- Equipment facts are tied to public CEID, Wright Lab, YSoA, and YINQE pages. Unverified details stay labeled.

## Run
```bash
npm install
npm run dev
```

Tests for the ranker: `node --experimental-strip-types --test src/lib/engine.test.ts`

No API key is required. Dollar amounts are retail estimates, not CEID prices.
