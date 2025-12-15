import { useLocalSearchParams } from 'expo-router';
import WaitingLobbyScreen from '../../../src/screens/WaitingLobbyScreen';

export default function Page() {
    const { id } = useLocalSearchParams();
    return <WaitingLobbyScreen activeTourId={Number(id)} />;
}
