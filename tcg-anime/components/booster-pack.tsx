import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ImageBackground,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface BoosterPackProps {
    packType?: 'rare' | 'epic' | 'legendary';
    title?: string;
    backgroundImage?: any;
    onOpenPack?: () => void;
}

const BoosterPack: React.FC<BoosterPackProps> = ({
                                                     packType = 'rare',
                                                     title = 'Anime Booster Pack',
                                                     backgroundImage,
                                                     onOpenPack
                                                 }) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [rotateAnim] = useState(new Animated.Value(0));
    const [glowAnim] = useState(new Animated.Value(0));
    const [flashAnim] = useState(new Animated.Value(0));
    const [raysAnim] = useState(new Animated.Value(0));
    const [bloomAnim] = useState(new Animated.Value(0));
    const [isOpening, setIsOpening] = useState(false);

    const packColors = {
        rare: '#4A90E2',
        epic: '#9013FE',
        legendary: '#07f8f8'
    };

    const packGlow = {
        rare: '#4A90E2',
        epic: '#9013FE',
        legendary: '#07f8f8'
    };

    React.useEffect(() => {
        const glowLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: false,
                })
            ])
        );
        glowLoop.start();

        return () => glowLoop.stop();
    }, []);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePress = async () => {
        if (isOpening) return;

        setIsOpening(true);

        // 4 vibrations rapides
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);

        // Animation d'ouverture avec effet lumineux
        Animated.sequence([
            // Secousse initiale
            Animated.timing(rotateAnim, {
                toValue: 0.5,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: -0.5,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 0.5,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
            // Effet lumineux éclatant
            Animated.parallel([
                // Flash intense
                Animated.sequence([
                    Animated.timing(flashAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(flashAnim, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: false,
                    })
                ]),
                // Rayons qui se déploient
                Animated.timing(raysAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                // Bloom/glow qui s'étend
                Animated.sequence([
                    Animated.timing(bloomAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bloomAnim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    })
                ]),
                // Scale up léger
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 800,
                    useNativeDriver: true,
                })
            ])
        ]).start(() => {
            onOpenPack?.();
            // Reset après animation
            setTimeout(() => {
                setIsOpening(false);
                flashAnim.setValue(0);
                raysAnim.setValue(0);
                bloomAnim.setValue(0);
                scaleAnim.setValue(1);
            }, 500);
        });
    };

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-2deg', '2deg'],
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    // Effet flash blanc éclatant
    const flashOpacity = flashAnim.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 1, 0],
    });

    // Rayons qui tournent et s'étendent
    const raysRotate = raysAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const raysScale = raysAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1.5],
    });

    const raysOpacity = raysAnim.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [0, 1, 0.8, 0],
    });

    // Bloom/glow expansif
    const bloomScale = bloomAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2],
    });

    const bloomOpacity = bloomAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.6, 0],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.packContainer,
                    {
                        transform: [
                            { scale: scaleAnim },
                            { rotate: rotateInterpolate }
                        ]
                    }
                ]}
            >
                {/* Effet de lueur de base */}
                <Animated.View
                    style={[
                        styles.glowEffect,
                        {
                            backgroundColor: packGlow[packType],
                            opacity: glowOpacity,
                        }
                    ]}
                />

                {/* Bloom expansif lors de l'ouverture */}
                <Animated.View
                    style={[
                        styles.bloomEffect,
                        {
                            backgroundColor: packGlow[packType],
                            opacity: bloomOpacity,
                            transform: [{ scale: bloomScale }]
                        }
                    ]}
                />

                {/* Rayons lumineux */}
                <Animated.View
                    style={[
                        styles.raysContainer,
                        {
                            opacity: raysOpacity,
                            transform: [
                                { scale: raysScale },
                                { rotate: raysRotate }
                            ]
                        }
                    ]}
                >
                    {[...Array(8)].map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.ray,
                                {
                                    backgroundColor: packGlow[packType],
                                    transform: [{ rotate: `${index * 45}deg` }]
                                }
                            ]}
                        />
                    ))}
                </Animated.View>

                <View style={styles.packTouchable}>
                    {backgroundImage ? (
                        <ImageBackground
                            source={backgroundImage}
                            style={styles.packGradient}
                            resizeMode="contain"
                            imageStyle={styles.backgroundImageStyle}
                        >
                            <View style={styles.imageOverlay} />

                            <View style={styles.decorativePattern}>
                                {[...Array(12)].map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.patternDot,
                                            {
                                                left: `${(index % 4) * 25 + 12.5}%`,
                                                top: `${Math.floor(index / 4) * 33 + 16.5}%`,
                                            }
                                        ]}
                                    />
                                ))}
                            </View>

                            <View style={styles.packContent}>
                                <Text style={styles.packTitle}>{title}</Text>
                                <Text style={styles.packSubtitle}>{packType.toUpperCase()}</Text>

                                <View style={styles.cardCountContainer}>
                                    <Text style={styles.cardCountText}>5 CARDS</Text>
                                </View>

                                <View style={styles.rarityIndicator}>
                                    {[...Array(packType === 'legendary' ? 5 : packType === 'epic' ? 4 : 3)].map((_, index) => (
                                        <View key={index} style={styles.star} />
                                    ))}
                                </View>
                            </View>

                            <View style={styles.shine} />

                            {/* Flash blanc éclatant */}
                            <Animated.View
                                style={[
                                    styles.flashOverlay,
                                    { opacity: flashOpacity }
                                ]}
                            />
                        </ImageBackground>
                    ) : (
                        <View style={[styles.packGradient, { backgroundColor: packColors[packType] }]}>
                            <View style={styles.decorativePattern}>
                                {[...Array(12)].map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.patternDot,
                                            {
                                                left: `${(index % 4) * 25 + 12.5}%`,
                                                top: `${Math.floor(index / 4) * 33 + 16.5}%`,
                                            }
                                        ]}
                                    />
                                ))}
                            </View>

                            <View style={styles.packContent}>
                                <Text style={styles.packTitle}>{title}</Text>
                                <Text style={styles.packSubtitle}>{packType.toUpperCase()}</Text>

                                <View style={styles.cardCountContainer}>
                                    <Text style={styles.cardCountText}>5 CARDS</Text>
                                </View>

                                <View style={styles.rarityIndicator}>
                                    {[...Array(packType === 'legendary' ? 5 : packType === 'epic' ? 4 : 3)].map((_, index) => (
                                        <View key={index} style={styles.star} />
                                    ))}
                                </View>
                            </View>

                            <View style={styles.shine} />

                            {/* Flash blanc éclatant */}
                            <Animated.View
                                style={[
                                    styles.flashOverlay,
                                    { opacity: flashOpacity }
                                ]}
                            />
                        </View>
                    )}
                </View>
            </Animated.View>

            <TouchableOpacity
                style={[
                    styles.openButton,
                    {
                        backgroundColor: packGlow[packType],
                        opacity: isOpening ? 0.5 : 1
                    }
                ]}
                onPress={handlePress}
                disabled={isOpening}
            >
                <Text style={styles.openButtonText}>
                    {isOpening ? 'OPENING...' : 'OPEN'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    packContainer: {
        position: 'relative',
    },
    glowEffect: {
        position: 'absolute',
        width: width * 0.8 + 20,
        height: width * 1.4 + 20,
        borderRadius: 20,
        top: -10,
        left: -10,
        zIndex: 0,
    },
    bloomEffect: {
        position: 'absolute',
        width: width * 0.8 + 60,
        height: width * 1.4 + 60,
        borderRadius: 40,
        top: -30,
        left: -30,
        zIndex: 0,
    },
    raysContainer: {
        position: 'absolute',
        width: width * 0.8 + 100,
        height: width * 1.4 + 100,
        top: -50,
        left: -50,
        zIndex: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ray: {
        position: 'absolute',
        width: 4,
        height: width * 0.6,
        borderRadius: 2,
        opacity: 0.8,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    packTouchable: {
        width: width * 0.8,
        height: width * 1.4,
        borderRadius: 15,
        elevation: 10,
        shadowColor: '#76fafa',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        zIndex: 1,
    },
    packGradient: {
        flex: 1,
        borderRadius: 15,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 15,
    },
    backgroundImageStyle: {
        borderRadius: 15,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    decorativePattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
    },
    patternDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: 'white',
        borderRadius: 4,
    },
    packContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    packTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    packSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 2,
        marginTop: 5,
    },
    cardCountContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginVertical: 20,
    },
    cardCountText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    rarityIndicator: {
        flexDirection: 'row',
        gap: 5,
    },
    star: {
        width: 12,
        height: 12,
        backgroundColor: '#07f8f8',
        transform: [{ rotate: '45deg' }],
    },
    shine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: '50%',
        bottom: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
    },
    flashOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        borderRadius: 15,
        zIndex: 2,
    },
    openButton: {
        marginTop: 20,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    openButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
});

export default BoosterPack;