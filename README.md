# F*ckingFilters

> **Uncensored**, **private** AI chat running on self-hosted **abliterated** models. No filters, no logs, no storing your IP.

This repository holds the FuckingFilters **frontend** (Next.js). It is published for **transparency and audit**: so the community can read the real code and verify the project's privacy claims.

## ✅ What this code claims (and you can audit)
- **Uncensored**: models are *abliterated* (refusal direction removed) and the *system prompt* does not moralize or refuse.
- **Real privacy**: the code **never reads or stores your IP**. Accounts are **anonymous keys** (*gift-code* style), **no email**, no personal data.
- **Your chats live in your browser** (localStorage); nothing is persisted server-side.
- **No third-party telemetry or analytics.**

## 🔒 What is NOT in this repository
- **No private keys, tokens, or secrets.** Anything sensitive lives in the hosting environment variables (never in the code). If you spot something that looks like a secret, it is a mistake: please report it.
- The **backend** (Cloudflare Worker) and the **models** (owner's LM Studio) are not included here.
- `.env.example` contains **only placeholders**.

## 🎯 Mission / funding
Independent project. **Donations / purchases** fund upgrading the owner's hardware to offer **better free abliterated models** (with limits). **Paid options** will come later. This is the real code that runs the service.

## 🔑 Account model
- One account = **one key** (obtained with **Monero**). No email, no personal sign-up.
- The key is stored **only as a hash (HMAC-SHA256)**; never in plaintext, never tied to an IP.

## ⚖️ License
This code is **source-available, view-only**: you may **read and audit** it, but **NOT** copy, fork, run, modify, or use it commercially. All rights reserved. See [LICENSE](./LICENSE).

## ⚠️ Disclaimer
F*ckingFilters is a **neutral platform** that provides access to uncensored AI models. It does not create, endorse, verify, or control model outputs, which may be inaccurate, incomplete, biased, or offensive. Use of the service and its outputs is **solely the user's responsibility**. Intended for adults only.

## Status
Work in progress (WIP). Things may change.
