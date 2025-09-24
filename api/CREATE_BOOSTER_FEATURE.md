# Create Booster Pack Feature

## Overview

A new route has been added to create booster packs for the card game. This endpoint allows administrators to create new booster packs with customizable properties.

## Changes Made

### 1. Added Controller Function (`controllers/boostersController.js`)

-   `createBooster`: Creates a new booster pack with specified properties
-   Validates set existence before creating the booster
-   Supports guaranteed rarities configuration
-   Uses database transaction for data consistency

### 2. Added Validation Schema (`middleware/validation.js`)

-   `createBoosterSchema`: Validates all booster pack creation parameters
-   Supports optional parameters with sensible defaults
-   Validates enum values for packType, guaranteedElement, and rarities

### 3. Added Route (`routes/boosters.js`)

-   `POST /boosters`: Admin-only endpoint to create booster packs
-   Includes comprehensive Swagger documentation
-   Requires authentication and admin authorization

## API Usage

### Create Booster Pack Endpoint

```http
POST /boosters
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Request Body Example

```json
{
    "packId": "fire-starter-pack",
    "packType": "Standard",
    "priceCoins": 500,
    "priceGems": 50,
    "cardsCount": 5,
    "foilChance": 15.0,
    "bonusCardChance": 10.0,
    "guaranteedElement": "Fire",
    "packImage": "https://example.com/images/fire-starter-pack.jpg",
    "openingAnimation": "https://example.com/animations/fire-pack-opening.mp4",
    "isActive": true,
    "isLimited": false,
    "setId": "fire-set-2024",
    "guaranteedRarities": [
        {
            "rarity": "Common",
            "quantity": 3
        },
        {
            "rarity": "Rare",
            "quantity": 1
        }
    ]
}
```

### Required Fields

-   `packId`: Unique identifier for the pack
-   `priceCoins`: Cost in coins
-   `packImage`: URL to pack image
-   `setId`: ID of the associated card set

### Optional Fields

-   `packType`: Type of pack (Standard, Premium, Legendary, Special)
-   `priceGems`: Alternative cost in gems (default: 0)
-   `cardsCount`: Number of cards in pack (default: 5)
-   `foilChance`: Percentage chance for foil cards (default: 10.0)
-   `bonusCardChance`: Percentage chance for bonus cards (default: 5.0)
-   `guaranteedElement`: Element guaranteed in pack
-   `openingAnimation`: URL to opening animation
-   `isActive`: Whether pack is available (default: true)
-   `isLimited`: Whether pack has limited quantity (default: false)
-   `limitedQuantity`: Maximum number if limited
-   `availableFrom`: Start date for availability (default: now)
-   `availableUntil`: End date for availability
-   `guaranteedRarities`: Array of guaranteed rarities and quantities

### Response Example

```json
{
    "success": true,
    "message": "Booster pack created successfully",
    "data": {
        "id": "booster-pack-id",
        "packId": "fire-starter-pack",
        "packType": "Standard",
        "priceCoins": 500,
        "priceGems": 50,
        "cardsCount": 5,
        "foilChance": 15.0,
        "bonusCardChance": 10.0,
        "guaranteedElement": "Fire",
        "packImage": "https://example.com/images/fire-starter-pack.jpg",
        "openingAnimation": "https://example.com/animations/fire-pack-opening.mp4",
        "isActive": true,
        "isLimited": false,
        "limitedQuantity": null,
        "soldCount": 0,
        "availableFrom": "2025-09-24T00:00:00.000Z",
        "availableUntil": null,
        "createdAt": "2025-09-24T10:30:00.000Z",
        "updatedAt": "2025-09-24T10:30:00.000Z",
        "set": {
            "id": "fire-set-2024",
            "name": "Fire Starter Set",
            "code": "FSS"
        },
        "guaranteedRarities": [
            {
                "id": "rarity-1",
                "rarity": "Common",
                "quantity": 3
            },
            {
                "id": "rarity-2",
                "rarity": "Rare",
                "quantity": 1
            }
        ]
    }
}
```

## Error Handling

-   Validates all input parameters according to schema
-   Checks if specified set exists before creating booster
-   Returns appropriate error messages for validation failures
-   Uses database transactions to ensure data consistency

## Security

-   Requires admin authentication
-   Only users with admin role can create booster packs
-   Input validation prevents malicious data

## Pack Types

-   **Standard**: Regular booster packs
-   **Premium**: Enhanced packs with better odds
-   **Legendary**: Special packs with guaranteed legendary cards
-   **Special**: Event or limited-time packs

## Integration

This endpoint integrates with:

-   Set management system (validates setId)
-   User authentication system (admin check)
-   Card rarity system (guaranteedRarities)
-   Purchase system (pricing configuration)
