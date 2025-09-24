# Card Collection Feature Enhancement

## Overview

The POST `/characters` endpoint has been enhanced to automatically add newly created characters to the authenticated user's collection when specified. The system uses the user ID from the authentication token for security.

## Changes Made

### 1. Updated Controller (`controllers/charactersController.js`)

-   Added optional `addToMyCollection` parameter to use authenticated user's ID from token
-   Added optional `obtainedFrom` parameter (defaults to "Admin")
-   Implemented transaction-based logic to:
    -   Create the character
    -   Add it to authenticated user's collection if `addToMyCollection` is true
    -   Handle duplicate cards by incrementing quantity
    -   Update user collection statistics
-   Uses `req.user.id` from JWT token for security

### 2. Updated Validation (`middleware/validation.js`)

-   Added `addToMyCollection` as optional boolean field
-   Added `obtainedFrom` as optional enum field with values:
    -   "Booster", "Trade", "Reward", "Purchase", "Event", "Starter", "Admin"

### 3. Updated API Documentation (`routes/characters.js`)

-   Added Swagger documentation for new optional parameters

## Usage Examples

### Creating a character without adding to collection (existing behavior):

```json
POST /characters
{
  "name": "Fire Dragon",
  "description": "A powerful fire-breathing dragon",
  "rarity": "Legendary",
  "element": "Fire",
  "characterClass": "Warrior",
  "health": 800,
  "attack": 120,
  "defense": 80,
  "speed": 6,
  "manaCost": 8,
  "cardImage": "https://example.com/fire-dragon.jpg",
  "cardNumber": "FD-001",
  "setId": "set-id-here"
}
```

### Creating a character and adding to authenticated user's collection (using token):

```json
POST /characters
{
  "name": "Fire Dragon",
  "description": "A powerful fire-breathing dragon",
  "rarity": "Legendary",
  "element": "Fire",
  "characterClass": "Warrior",
  "health": 800,
  "attack": 120,
  "defense": 80,
  "speed": 6,
  "manaCost": 8,
  "cardImage": "https://example.com/fire-dragon.jpg",
  "cardNumber": "FD-001",
  "setId": "set-id-here",
  "addToMyCollection": true,
  "obtainedFrom": "Admin"
}
```

## Response Examples

### Without user collection:

```json
{
    "success": true,
    "message": "Character created successfully",
    "data": {
        "character": {
            /* character data */
        },
        "userCard": null
    }
}
```

### With authenticated user's collection (using addToMyCollection):

```json
{
    "success": true,
    "message": "Character created and added to your collection successfully",
    "data": {
        "character": {
            /* character data */
        },
        "userCard": {
            "id": "usercard-id",
            "quantity": 1,
            "obtainedFrom": "Admin",
            "character": {
                "id": "character-id",
                "name": "Fire Dragon",
                "rarity": "Legendary"
            }
        }
    }
}
```

### With authenticated user's collection (using addToMyCollection):

```json
{
    "success": true,
    "message": "Character created and added to your collection successfully",
    "data": {
        "character": {
            /* character data */
        },
        "userCard": {
            "id": "usercard-id",
            "quantity": 1,
            "obtainedFrom": "Admin",
            "character": {
                "id": "character-id",
                "name": "Fire Dragon",
                "rarity": "Legendary"
            }
        }
    }
}
```

## Key Features

-   **Token-based User ID**: Use `addToMyCollection: true` to automatically add cards to the authenticated user's collection
-   **Secure**: Uses JWT token to identify the user, no need to provide user ID manually
-   **Simple**: Only one boolean parameter to add to collection

## Error Handling

-   If user already has the character, quantity is incremented
-   All operations are wrapped in database transaction for consistency
-   User collection statistics are automatically updated

## Security

-   Endpoint requires admin authentication (existing security)
-   Uses authenticated user's ID from JWT token for security
