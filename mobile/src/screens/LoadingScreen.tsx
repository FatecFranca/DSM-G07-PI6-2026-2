import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { styles } from '../styles';

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <ActivityIndicator color="#166534" size="large" />
      </View>
    </SafeAreaView>
  );
}
