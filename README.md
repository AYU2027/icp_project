# 🧬 HealthVault: Decentralized Medical Records

![HealthVault Landing Page](<img width="1920" height="1080" alt="Screenshot 2026-05-28 125850" src="https://github.com/user-attachments/assets/c82ed5ad-26e7-4ddf-8b45-fd3529539879" />
)
*(Note: Replace `./assets/landing.png` with the actual path to your screenshot)*

## 📖 Overview
HealthVault is a next-generation, Web3-powered healthcare platform built on the **Internet Computer (ICP)**. It revolutionizes medical data ownership by putting patients in complete control of their encrypted health records while allowing medical researchers to query and request access to vital anonymized data securely.

By leveraging decentralized smart contracts and strict cryptographic access controls, HealthVault ensures that medical data is immutable, tamper-proof, and entirely patient-owned.

---

## ✨ Key Features

* **🎭 Role-Based Architecture:** Distinct, secure portals for **Patients** (data owners) and **Researchers** (data consumers).
* **🕵️ Zero-Knowledge Privacy Oracle:** Researchers can query the blockchain for study candidates (e.g., "Find patients over 18 with Asthma") and receive anonymous IDs *without* exposing any underlying patient identities.
* **🔐 Immutable Access Control:** Patients receive secure "Handshake Requests" from researchers. Data remains encrypted until the patient explicitly clicks "Grant Authorization".
* **💾 Stable Memory Persistence:** Built-in Rust `pre_upgrade` and `post_upgrade` hooks ensure that patient data safely survives all smart contract upgrades and network resets.
* **💅 Premium UI/UX:** Features a beautiful, responsive, glassmorphism interface with dark/light mode toggling, animated backgrounds, and seamless "No-Password" Web3 authentication.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Glassmorphism & Theming)
* React Router DOM
* DFINITY AuthClient (`@dfinity/auth-client`)
* DFINITY Agent (`@dfinity/agent`)

**Backend (Smart Contracts):**
* Rust
* Internet Computer SDK (`dfx`)
* Candid (Interface Description Language)

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the HealthVault blockchain network and React frontend on your local machine.

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [DFINITY SDK (`dfx`)](https://internetcomputer.org/docs/current/developer-docs/setup/install)
* Rust toolchain (`rustup`)

### 2. Start the Local Blockchain
Open a terminal in the root directory and start the local ICP replica in the background:
```bash
dfx start --background
