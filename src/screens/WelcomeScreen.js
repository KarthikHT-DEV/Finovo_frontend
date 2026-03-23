import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Pressable,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Typography from '../styles/typography';
import { useTheme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onCreateAccount, onSignIn }) {
    const { colors } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);

    // Reveal animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Top Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('../../assets/welcome_bg.png')}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            {/* Bottom Content Section */}
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <View style={styles.brandRow}>
                    <View style={styles.iconBox}>
                        <Image 
                            source={require('../../assets/app-icon.png')} 
                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <Text style={styles.title}>Finovo</Text>
                <Text style={styles.subtitle}>ELEVATED BUDGETING</Text>

                <View style={styles.buttonGroup}>
                    <Pressable
                        style={styles.primaryButton}
                        onPress={onCreateAccount}
                    >
                        <Text style={styles.primaryButtonText}>Create Account</Text>
                    </Pressable>

                    <Pressable
                        style={styles.secondaryButton}
                        onPress={onSignIn}
                    >
                        <Text style={styles.secondaryButtonText}>Sign In</Text>
                    </Pressable>
                </View>

                <Text style={styles.footerText}>
                    By continuing, you agree to our Terms of Service and{'\n'}Privacy Policy.
                </Text>
            </Animated.View>
        </View>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center', // Centers components horizontally
    },
    imageContainer: {
        width: width - 40,
        height: '50%',
        marginTop: 60, // padding top
        marginBottom: 30,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5, // Android shadow
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    brandRow: {
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        backgroundColor: colors.textPrimary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 44,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        letterSpacing: -1,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: Typography.weight.medium,
        color: '#607D8B', // Muted Gray-blue
        letterSpacing: 1.5,
        marginBottom: 40,
    },
    buttonGroup: {
        width: '100%',
        gap: 16,
        marginBottom: 40,
    },
    primaryButton: {
        width: '100%',
        height: 60,
        backgroundColor: colors.textPrimary,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    primaryButtonText: {
        color: colors.backgroundPrimary,
        fontSize: 16,
        fontWeight: Typography.weight.semibold,
    },
    secondaryButton: {
        width: '100%',
        height: 60,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.textPrimary,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: Typography.weight.semibold,
    },
    footerText: {
        fontSize: 11,
        color: '#9E9E9E',
        textAlign: 'center',
        lineHeight: 18,
    },
});
