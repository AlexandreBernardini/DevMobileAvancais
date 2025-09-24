# Card Collection Feature Enhancement

## Overview

The POST `/characters` endpoint has been enhanced to automatically add newly created characters to a user's collection when specified. The system now supports getting the user ID from the authentication token.

## Changes Made

### 1. Updated Controller (`controllers/charactersController.js`)

-   Added optional `userId` parameter
-   Added optional `addToMyCollection` parameter to use authenticated user's ID from token
-   Added optional `obtainedFrom` parameter (defaults to "Admin")
-   Implemented transaction-based logic to:
    -   Create the character
    -   Add it to user's collection if `userId` is provided or `addToMyCollection` is true
    -   Handle duplicate cards by incrementing quantity
    -   Update user collection statistics
-   Uses `req.user.id` from JWT token when `addToMyCollection` is true

### 2. Updated Validation (`middleware/validation.js`)

-   Added `userId` as optional string field
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

### Creating a character and adding to a user's collection:

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
  "userId": "user-id-here",
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

### With specific user's collection (using userId):

```json
{
    "success": true,
    "message": "Character created and added to user collection successfully",
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
-   **Specific User ID**: Use `userId` parameter to add cards to a specific user's collection
-   **Flexible Usage**: Can specify both parameters, with `userId` taking precedence over `addToMyCollection`

## Error Handling

-   If `userId` is provided but user doesn't exist, returns error
-   If user already has the character, quantity is incremented
-   All operations are wrapped in database transaction for consistency
-   User collection statistics are automatically updated

## Security

-   Endpoint requires admin authentication (existing security)
-   User ID validation prevents adding cards to non-existent users
