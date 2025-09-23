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

const { width, height } = Dimensions.get('window');

interface BoosterPackProps {
    packType?: 'rare' | 'epic' | 'legendary';
    title?: string;
    backgroundImage?: any; // Pour l'image de fond
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
        // Animation de lueur continue
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

    const handlePress = () => {
        // Animation de secousse avant ouverture
        Animated.sequence([
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
            })
        ]).start(() => {
            onOpenPack?.();
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
                {/* Effet de lueur */}
                <Animated.View
                    style={[
                        styles.glowEffect,
                        {
                            backgroundColor: packGlow[packType],
                            opacity: glowOpacity,
                        }
                    ]}
                />

                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handlePress}
                    activeOpacity={0.9}
                    style={styles.packTouchable}
                >
                    {backgroundImage ? (
                        <ImageBackground
                            source={backgroundImage}
                            style={styles.packGradient}
                            resizeMode="contain" // ← Changé pour voir l'image complète
                            imageStyle={styles.backgroundImageStyle} // ← Style pour l'image
                        >
                            {/* Overlay semi-transparent pour garder la lisibilité */}
                            <View style={styles.imageOverlay} />

                            {/* Motif décoratif */}
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

                            {/* Contenu du pack */}
                            <View style={styles.packContent}>
                                <Text style={styles.packTitle}>{title}</Text>
                                <Text style={styles.packSubtitle}>{packType.toUpperCase()}</Text>

                                <View style={styles.cardCountContainer}>
                                    <Text style={styles.cardCountText}>5 CARDS</Text>
                                </View>

                                {/* Indicateur de rareté */}
                                <View style={styles.rarityIndicator}>
                                    {[...Array(packType === 'legendary' ? 5 : packType === 'epic' ? 4 : 3)].map((_, index) => (
                                        <View key={index} style={styles.star} />
                                    ))}
                                </View>
                            </View>

                            {/* Reflet */}
                            <View style={styles.shine} />
                        </ImageBackground>
                    ) : (
                        <View
                            style={[styles.packGradient, { backgroundColor: packColors[packType] }]}
                        >
                            {/* Motif décoratif */}
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

                            {/* Contenu du pack */}
                            <View style={styles.packContent}>
                                <Text style={styles.packTitle}>{title}</Text>
                                <Text style={styles.packSubtitle}>{packType.toUpperCase()}</Text>

                                <View style={styles.cardCountContainer}>
                                    <Text style={styles.cardCountText}>5 CARDS</Text>
                                </View>

                                {/* Indicateur de rareté */}
                                <View style={styles.rarityIndicator}>
                                    {[...Array(packType === 'legendary' ? 5 : packType === 'epic' ? 4 : 3)].map((_, index) => (
                                        <View key={index} style={styles.star} />
                                    ))}
                                </View>
                            </View>

                            {/* Reflet */}
                            <View style={styles.shine} />
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>

            <Text style={styles.tapHint}>Tap to open!</Text>
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
        width: width * 0.2 + 20,
        height: width * 0.35 + 20,
        borderRadius: 20,
        top: -10,
        left: -10,
        zIndex: 0,
    },
    packTouchable: {
        width: width * 0.2,
        height: width * 0.35,
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
        backgroundColor: 'rgba(0,0,0,0.3)', // Overlay semi-transparent
        borderRadius: 15,
    },
    backgroundImageStyle: {
        borderRadius: 15,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        // Tu peux ajouter d'autres styles ici pour positionner l'image
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
    tapHint: {
        marginTop: 20,
        color: '#666',
        fontSize: 16,
        fontStyle: 'italic',
    },
});

export default BoosterPack;