# Tracks & Taps - Product Vision

> **Product Strategy for UPF Admissions Board**

Tracks & Taps is a mobile-first, gamified tourism platform designed to solve the "Passive Tourist" problem. This document outlines the product logic, user journey, and current development status.

## 🎯 Core Problem & Solution

**The Problem:**
Traditional city guides and walking tours are passive, solitary, and often boring. Young travelers (Gen Z/Millennials) prefer social, active, and "gamified" experiences over static audio guides.

**The Solution:**
**Tracks & Taps** turns city exploration into a multiplayer game. It combines the mechanics of a scavenger hunt (or Pokémon GO) with the social aspect of a pub crawl or cultural tour.
-   **Active Participation**: Users don't just "visit" a spot; they must "Check In", answer Trivia, or complete a Photo Challenge to progress.
-   **Social Competition**: Users play in Teams, earning XP and competing on Leaderboards.

## 🚧 Current State: Beta Protocol

The application is currently in **Technical Beta**. 
-   **Functional**: The "Core Loop" (Join -> Play -> Finish) is fully implemented and testable.
-   **In Development**: Advanced social features (e.g., Real-time Chat, Friend Feeds) are architectural priorities but partially implemented.
-   **Platform**: Native builds are available for iOS (via TestFlight) and Android.

## 🗺️ The User Journey (Product Logic)

The navigation stack (`app/_layout.tsx`) enforces a specific user flow designed to maximize engagement and converting "Browsers" into "Players".

### 1. Discovery (The Hook)
*Screen: `ExploreScreen`*
-   Users land on a dynamic Map/Feed interface.
-   **Logic**: They browse Tours filtered by "Vibe" (e.g., Pub Golf, History, scenic).
-   **Goal**: Find a tour that fits their current location and group mood.

### 2. Team Formation (The Commitment)
*Screen: `TeamSetupScreen`*
-   Once a tour is selected, the user enters a "Lobby".
-   **Logic**: Users must create or join a Team (Name, Color, Emoji).
-   **Goal**: This micro-commitment converts the user from a passive browser to an invested player responsible for a team.

### 3. Active Gameplay (The Core Loop)
*Screen: `ActiveTourScreen`*
-   This is the "Game Mode". The standard UI is replaced by a HUD (Heads-Up Display).
-   **Mechanics**: 
    -   **Navigation**: Route plotting to the next stop.
    -   **Validation**: GPS-based "Check-In" to prove physical presence.
    -   **Challenge**: Context-aware Trivia or Tasks at the stop.
    -   **Reward**: Instant XP and Currency (`Tokens`) upon completion.

### 4. Retention & Social
*Screens: `TourCompleted`, `ProfileScreen`*
-   Post-game, users see a Summary (Podium/Confetti).
-   **Logic**: XP gained levels up the User Profile.
-   **Goal**: The "Level Up" loop creates a sunk cost and sense of progress, incentivizing the user to return for another tour.

---

## 🔮 Roadmap Priorities

Based on the current codebase structure, the immediate next steps for the product are:
1.  **Monetization**: Implementation of `BuyTokensModal` suggests a "Freemium" model where premium tours or customization require Tokens.
2.  **User Generated Content**: The `CreateTourWizard` is present, indicating a move towards a "Creator Economy" where locals can build and sell their own tours.

---

*Verified from codebase analysis - Jan 2026*
