import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface UnderlinedTextProps {
  text: string;
  color: string;
}

export default function SectionHeader({ text, color }: UnderlinedTextProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text]}>{text}</Text>
      <View style={[styles.underline, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    fontSize: 19,
  },
  underline: {
    height: 2.5,
    marginTop: 2,
  },
});
