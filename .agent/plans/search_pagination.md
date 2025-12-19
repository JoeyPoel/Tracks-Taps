---
title: Search and Pagination Improvements
description: Implemented fuzzy search and pagination for the Tours list.
---

## Changes

### Backend
1.  **Controller (`backend/controllers/tourController.ts`)**:
    -   Updated `getAllTours` to extract `page` and `limit` from the request query parameters.
    -   Defaults: `page` = 1, `limit` = 20.

2.  **Repository (`backend/repositories/tourRepository.ts`)**:
    -   Updated `getAllTours` to accept pagination parameters (`page`, `limit`).
    -   Implemented `skip` and `take` in the Prisma query to enable pagination (loading 20 tours at a time).
    -   Improved `searchQuery` logic:
        -   Splits the search string into individual terms.
        -   Uses an `AND` condition for terms (all terms must be present).
        -   Uses an `OR` condition for fields (term can be in Title, Description, or Location).
        -   This provides a "fuzzy-like" experience where searching for "Amsterdam Walk" finds "Amsterdam City Walk".
        -   Case-insensitive matching is preserved.

### Verification
-   **Search**: Typing "Amsterdam" should return tours in Amsterdam. Typing "Amsterdam Walk" should return tours with both words.
-   **Empty Search**: Returns all tours (or adheres to other filters).
-   **Pagination**: The tour list requests 20 items at a time. improved infinite scrolling behavior.
