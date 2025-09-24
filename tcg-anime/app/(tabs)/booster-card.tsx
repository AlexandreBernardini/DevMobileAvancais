import BoosterPack from '../../components/booster-pack'; // Ajuste le chemin
import { View } from 'react-native';

export default function BoosterCardScreen() {
    const handleOpenPack = () => {
        console.log('Ouverture du pack !');
        // Ici tu pourras ajouter la logique d'ouverture
        // Navigation vers les cartes obtenues, animations, etc.
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
            <BoosterPack
                packType="legendary"
                title="One Piece"
                backgroundImage={require('../../assets/images/booster.jpg')}
                onOpenPack={handleOpenPack}

            />
        </View>
    );
}