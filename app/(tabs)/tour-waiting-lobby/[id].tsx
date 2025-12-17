import { useLocalSearchParams } from 'expo-router';
import PostTourLobbyScreen from '../../../src/screens/PostTourLobbyScreen';

export default function Page() {
    const { id } = useLocalSearchParams();
    return <PostTourLobbyScreen activeTourId={Number(id)} />;
}
