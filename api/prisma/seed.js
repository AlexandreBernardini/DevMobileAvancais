const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../utils/auth");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seeding...");

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const admin = await prisma.user.upsert({
        where: { email: "admin@tcg.com" },
        update: {},
        create: {
            username: "admin",
            email: "admin@tcg.com",
            password: adminPassword,
            displayName: "Administrator",
            role: "admin",
            level: 50,
            experience: 100000,
            coins: 100000,
            gems: 10000,
            dust: 5000,
            emailVerified: true,
        },
    });

    // Create test users
    const testUsers = [];
    for (let i = 1; i <= 5; i++) {
        const password = await hashPassword("password123");
        const user = await prisma.user.upsert({
            where: { email: `player${i}@tcg.com` },
            update: {},
            create: {
                username: `player${i}`,
                email: `player${i}@tcg.com`,
                password,
                displayName: `Player ${i}`,
                level: Math.floor(Math.random() * 20) + 1,
                experience: Math.floor(Math.random() * 10000),
                coins: Math.floor(Math.random() * 1000) + 100,
                gems: Math.floor(Math.random() * 100) + 10,
                wins: Math.floor(Math.random() * 50),
                losses: Math.floor(Math.random() * 30),
                emailVerified: true,
            },
        });
        testUsers.push(user);
    }

    // Create sets
    const sets = [
        {
            name: "Genesis Heroes",
            code: "GH",
            description:
                "The first set of legendary heroes from the dawn of time",
            theme: "Ancient Legends",
            totalCards: 150,
            setIcon: "https://example.com/icons/genesis.png",
            setSymbol: "https://example.com/symbols/genesis.png",
            releaseDate: new Date("2024-01-01"),
            boosterPrice: 50,
            cardsPerPack: 5,
            commonCount: 60,
            uncommonCount: 40,
            rareCount: 30,
            epicCount: 15,
            legendaryCount: 4,
            mythicCount: 1,
        },
        {
            name: "Elemental Fury",
            code: "EF",
            description: "Harness the power of the elements in epic battles",
            theme: "Elemental Magic",
            totalCards: 120,
            setIcon: "https://example.com/icons/elemental.png",
            setSymbol: "https://example.com/symbols/elemental.png",
            releaseDate: new Date("2024-03-01"),
            boosterPrice: 60,
            cardsPerPack: 5,
            commonCount: 50,
            uncommonCount: 35,
            rareCount: 25,
            epicCount: 8,
            legendaryCount: 2,
            mythicCount: 0,
        },
    ];

    const createdSets = [];
    for (const setData of sets) {
        const set = await prisma.set.upsert({
            where: { code: setData.code },
            update: {},
            create: setData,
        });
        createdSets.push(set);
    }

    // Create characters
    const characters = [
        {
            name: "Flame Warrior Ignis",
            title: "The Burning Blade",
            description:
                "A fierce warrior who commands the power of eternal flames",
            rarity: "Legendary",
            element: "Fire",
            characterClass: "Warrior",
            health: 120,
            attack: 85,
            defense: 70,
            speed: 6,
            manaCost: 7,
            cardImage: "https://example.com/cards/ignis.png",
            fullArtwork: "https://example.com/art/ignis.png",
            lore: "Born in the heart of a volcano, Ignis wields flames that never die.",
            cardNumber: "GH-001",
            setId: createdSets[0].id,
            tags: ["Fire", "Warrior", "Legendary"],
            abilities: {
                create: [
                    {
                        name: "Inferno Strike",
                        description: "Deal massive fire damage to target enemy",
                        damage: 45,
                        type: "Attack",
                    },
                    {
                        name: "Flame Shield",
                        description:
                            "Protect from next attack and deal burn damage",
                        damage: 20,
                        type: "Defense",
                    },
                ],
            },
        },
        {
            name: "Aqua Mage Nerida",
            title: "Mistress of Tides",
            description:
                "A powerful mage who controls the very essence of water",
            rarity: "Epic",
            element: "Water",
            characterClass: "Mage",
            health: 90,
            attack: 95,
            defense: 45,
            speed: 7,
            manaCost: 6,
            cardImage: "https://example.com/cards/nerida.png",
            fullArtwork: "https://example.com/art/nerida.png",
            lore: "From the deepest oceans, Nerida emerges to bring balance.",
            cardNumber: "GH-002",
            setId: createdSets[0].id,
            tags: ["Water", "Mage", "Epic"],
            abilities: {
                create: [
                    {
                        name: "Tidal Wave",
                        description: "Damage all enemies with a massive wave",
                        damage: 35,
                        type: "Attack",
                    },
                    {
                        name: "Healing Spring",
                        description: "Restore health to self and allies",
                        damage: 0,
                        type: "Heal",
                    },
                ],
            },
        },
        {
            name: "Earth Guardian Grok",
            description: "A stalwart defender made of living stone",
            rarity: "Rare",
            element: "Earth",
            characterClass: "Tank",
            health: 150,
            attack: 60,
            defense: 95,
            speed: 3,
            manaCost: 5,
            cardImage: "https://example.com/cards/grok.png",
            cardNumber: "GH-003",
            setId: createdSets[0].id,
            tags: ["Earth", "Tank", "Guardian"],
            abilities: {
                create: [
                    {
                        name: "Stone Wall",
                        description: "Create an impenetrable barrier",
                        damage: 0,
                        type: "Defense",
                    },
                    {
                        name: "Earthquake",
                        description: "Shake the ground, damaging all enemies",
                        damage: 30,
                        type: "Attack",
                    },
                ],
            },
        },
        {
            name: "Wind Archer Zephyr",
            description: "Swift archer who never misses their mark",
            rarity: "Uncommon",
            element: "Air",
            characterClass: "Archer",
            health: 80,
            attack: 70,
            defense: 40,
            speed: 9,
            manaCost: 4,
            cardImage: "https://example.com/cards/zephyr.png",
            cardNumber: "GH-004",
            setId: createdSets[0].id,
            tags: ["Air", "Archer", "Swift"],
            abilities: {
                create: [
                    {
                        name: "Wind Arrow",
                        description:
                            "Fast piercing shot that cannot be blocked",
                        damage: 40,
                        type: "Attack",
                    },
                    {
                        name: "Evasive Maneuvers",
                        description: "Increase speed and dodge chance",
                        damage: 0,
                        type: "Buff",
                    },
                ],
            },
        },
        {
            name: "Lightning Assassin Volt",
            description: "Strikes faster than lightning itself",
            rarity: "Epic",
            element: "Lightning",
            characterClass: "Assassin",
            health: 70,
            attack: 100,
            defense: 30,
            speed: 10,
            manaCost: 6,
            cardImage: "https://example.com/cards/volt.png",
            cardNumber: "EF-001",
            setId: createdSets[1].id,
            tags: ["Lightning", "Assassin", "Speed"],
            abilities: {
                create: [
                    {
                        name: "Thunder Strike",
                        description:
                            "Lightning-fast attack that stuns the enemy",
                        damage: 55,
                        type: "Attack",
                    },
                    {
                        name: "Electric Dash",
                        description: "Move instantly and gain extra attack",
                        damage: 0,
                        type: "Buff",
                    },
                ],
            },
        },
    ];

    const createdCharacters = [];
    for (const charData of characters) {
        const character = await prisma.character.create({
            data: charData,
            include: { abilities: true },
        });
        createdCharacters.push(character);
    }

    // Create booster packs
    const boosterPacks = [
        {
            packId: "GH-STANDARD",
            packType: "Standard",
            priceCoins: 50,
            priceGems: 0,
            cardsCount: 5,
            foilChance: 10.0,
            bonusCardChance: 5.0,
            packImage: "https://example.com/packs/genesis-standard.png",
            setId: createdSets[0].id,
            guaranteedRarities: {
                create: [
                    { rarity: "Common", quantity: 3 },
                    { rarity: "Uncommon", quantity: 1 },
                    { rarity: "Rare", quantity: 1 },
                ],
            },
        },
        {
            packId: "EF-PREMIUM",
            packType: "Premium",
            priceCoins: 100,
            priceGems: 1,
            cardsCount: 7,
            foilChance: 25.0,
            bonusCardChance: 15.0,
            packImage: "https://example.com/packs/elemental-premium.png",
            setId: createdSets[1].id,
            guaranteedRarities: {
                create: [
                    { rarity: "Common", quantity: 3 },
                    { rarity: "Uncommon", quantity: 2 },
                    { rarity: "Rare", quantity: 1 },
                    { rarity: "Epic", quantity: 1 },
                ],
            },
        },
    ];

    for (const packData of boosterPacks) {
        await prisma.boosterPack.create({
            data: packData,
        });
    }

    // Give some cards to test users
    for (const user of testUsers) {
        // Give random cards from the created characters
        for (let i = 0; i < 10; i++) {
            const randomCharacter =
                createdCharacters[
                    Math.floor(Math.random() * createdCharacters.length)
                ];
            const quantity = Math.floor(Math.random() * 3) + 1;

            await prisma.userCard.upsert({
                where: {
                    userId_characterId: {
                        userId: user.id,
                        characterId: randomCharacter.id,
                    },
                },
                update: {
                    quantity: {
                        increment: quantity,
                    },
                },
                create: {
                    userId: user.id,
                    characterId: randomCharacter.id,
                    quantity,
                    obtainedFrom: "Starter",
                    foil: Math.random() < 0.1, // 10% chance of foil
                },
            });
        }

        // Update user card counts
        const userCardCount = await prisma.userCard.aggregate({
            where: { userId: user.id },
            _sum: { quantity: true },
            _count: { id: true },
        });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalCards: userCardCount._sum.quantity || 0,
                uniqueCards: userCardCount._count.id || 0,
            },
        });
    }

    console.log("✅ Database seeding completed!");
    console.log(`📊 Created:`);
    console.log(`   - ${testUsers.length + 1} users (including admin)`);
    console.log(`   - ${createdSets.length} sets`);
    console.log(`   - ${createdCharacters.length} characters`);
    console.log(`   - ${boosterPacks.length} booster packs`);
    console.log(`   - User card collections`);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
