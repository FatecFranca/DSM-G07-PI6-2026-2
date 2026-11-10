import { Pressable, Text } from 'react-native';
import type { Regiao } from '../api';
import { styles } from '../styles';

interface RegionCardProps {
  regiao: Regiao;
  selected: boolean;
  onPress: (regiao: Regiao) => void;
}

export function RegionCard({ regiao, selected, onPress }: RegionCardProps) {
  return (
    <Pressable
      onPress={() => onPress(regiao)}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <Text style={styles.cardTitle}>{regiao.nomeRegiao}</Text>
      <Text style={styles.cardText}>
        {regiao.pais}{regiao.uf ? ` · ${regiao.uf}` : ''}
      </Text>
      <Text style={styles.cardText}>
        {regiao.latitude ?? '—'}, {regiao.longitude ?? '—'}
      </Text>
      <Text style={styles.cardAction}>Ver clima, produção e compatibilidade →</Text>
    </Pressable>
  );
}
