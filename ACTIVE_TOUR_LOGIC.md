# Active Tour Logic Documentation

This document describes the architecture and logic behind the "Active Tour" functionality in Tracks & Taps.

## Overview
An **Active Tour** represents a live session of a user (or team of users) participating in a **Tour**. It tracks their current location (stop), progress, score, streak, and interaction with challenges.

## Data Model

### 1. ActiveTour
The parent container for a session.
- **`tourId`**: Links to the static Tour content (stops, challenges).
- **`status`**: `IN_PROGRESS`, `COMPLETED`, or `ABANDONED`.
- **`teams`**: A list of teams participating in this session (supports multiplayer/competitive modes).
- **`winnerTeamId`**: Records the winner upon completion.

### 2. Team
Represents a single user or a group of users progressing together.
- **`currentStop`**: 1-based index of the stop they are currently at.
- **`score`**: Total points earned from challenges.
- **`streak`**: Current streak of successful challenges.
- **`activeChallenges`**: Record of completed/failed challenges to prevent re-doing them.
- **`pubGolfStops`**: Specific data for the "Pub Golf" gamemode (sips per stop).

## Key Workflows

### 1. Starting a Tour
- **User Action**: Clicks "Start Tour" on a Tour Detail screen.
- **Backend**:
    - Checks for existing active tours (conflict check).
    - Creates a new `ActiveTour`.
    - Creates a `Team` for the user.
    - If `PubGolf` mode is active, pre-populates `PubGolfStop` entries.
- **Frontend**: API returns the full `ActiveTour` object with all relations.

### 2. Joining a Tour (Multiplayer)
- **User Action**: Enters a join code or clicks a join link.
- **Backend**:
    - Finds the existing `ActiveTour`.
    - Creates a new `Team` for the joining user attached to that `ActiveTour`.
- **frontend**: The new user receives the same `ActiveTour` ID but their own `Team` ID.

### 3. Gameplay & Progress (The "Push" Model)
To optimize performance, the application uses a **push-update** strategy for gameplay actions.

#### Static vs. Dynamic Data
- **Static**: Tour Stops, Descriptions, Challenge Questions, Coordinates. (Loaded ONCE at start).
- **Dynamic**: Current Stop, Score, Completed Challenges, Sips. (Updated frequently).

#### Code Architecture of Push Updates

The "Push" model is implemented across the stack to ensure data consistency without redundant fetching.

1.  **Frontend Hook (`useActiveTour.ts`)**:
    - The user triggers an action (e.g., `handleChallengeComplete`).
    - The hook calls `activeTourService.completeChallenge(...)`.
    - Critically, it **waits** for the response of this call, which now contains the *updated progress*.
    - It immediately calls `updateActiveTourLocal(response)` to merge this new data into the global store.

2.  **Frontend Service (`src/services/activeTourService.ts`)**:
    - Sends the POST request to the backend.
    - Returns the `response.data` directly, which matches the `ActiveTour` (or `Team`) shape.

3.  **Backend Controller (`backend-mock/controllers/activeTourController.ts`)**:
    - Receives the request.
    - Calls the corresponding service method.
    - Returns the result as JSON.

4.  **Backend Service (`backend-mock/services/activeTourService.ts`)**:
    - Performs the logic (e.g., updates DB, adds XP).
    - **CRITICAL STEP**: Instead of just returning "Success", it calls `this.getActiveTourProgress(activeTourId, userId)` at the end of the method.
    - This ensures the return value is always the *most up-to-date state* of the tour.

5.  **Frontend Store (`src/store/store.ts`)**:
    - The `updateActiveTourLocal` action uses `Map` logic to intelligently merge the updated Team object into the array of teams.
    - It preserves the heavy `activeTour.tour` (static data) while replacing the `activeTour.teams` (dynamic data) with the fresh data from the server.
    
**Why this matters**:
- **Latency**: Users see updates instantly (optimistic) but get "truth" from the server milliseconds later.
- **Bandwidth**: We don't re-download the massive Tour object (stops, images, text) every time a user scores a point.
- **Consistency**: Use of a single "Progress" query source in the backend ensures all clients get the exact same shape of data.

### 4. Pub Golf
A special mode where users track "learning sips" against a "par".
- **Logic**: Linked via `PubGolfStop` entries on the `Team`.
- **Updates**: Updating sips triggers the same "Push" update flow to ensure scores are persisted and synced immediately.

### 5. Finishing
- When a team reaches the last stop and clicks finish:
- **Backend**: Marks `finishedAt` timestamp.
- **Winner Check**: If all teams are finished, calculates the winner (Score > Time) and updates `ActiveTour` status to `COMPLETED`.

## Directory Structure
- **Backend Services**: `backend-mock/services/activeTourService.ts` (Core logic)
- **Frontend Store**: `src/store/store.ts` (State management & merging logic)
- **Hooks**: `src/hooks/useActiveTour.ts` (View logic & action handlers)
