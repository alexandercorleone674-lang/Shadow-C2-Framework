# 💀 Shadow Command C2 Framework

**Shadow Command** is a modern, Proof-of-Concept (PoC) Command & Control framework designed for educational purposes and Red Team operations research. It demonstrates a full-stack architecture for remote system administration using a persistent agent-server model.

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Backend-FastAPI-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-violet)

## 🏗️ Architecture

The system mimics real-world C2 infrastructure (like Cobalt Strike or Mythic) but simplified for study:

* **The Mothership (Backend):** Python **FastAPI** server that manages agents, queues commands, and stores execution logs in memory.
* **The Dashboard (Frontend):** **React (TypeScript)** interface with a "Cyberpunk" aesthetic for real-time operator control.
* **The Soldier (Implant):** Python payload that executes on the target, performing system reconnaissance and executing shell commands via `subprocess`.

## 🚀 Tech Stack

* **Language:** Python 3.10+, TypeScript.
* **Backend:** FastAPI, Uvicorn, Pydantic.
* **Frontend:** React, Vite, Axios, CSS Modules.
* **Communication:** HTTP Polling (Beaconing interval: 3s).

## ⚠️ Disclaimer

This software is for **EDUCATIONAL USE ONLY**. It is intended to be used in controlled environments (virtual labs) to understand how malware communications work. The author is not responsible for any misuse of this code.

---
*Developed by Alexander*