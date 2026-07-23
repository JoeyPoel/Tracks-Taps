import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { TextComponent } from '../common/TextComponent';

interface TranslationButtonProps {
  theme: any;
  t: (key: any) => string;
  isTourDetailsStep: boolean;
  isAutoTranslateEnabled: boolean;
  setIsAutoTranslateEnabled: (enabled: boolean) => void;
  isTargetLanguageSet: boolean;
  setIsLangModalVisible: (visible: boolean) => void;
}

export const TranslationButton = ({
  theme,
  t,
  isTourDetailsStep,
  isAutoTranslateEnabled,
  setIsAutoTranslateEnabled,
  isTargetLanguageSet,
  setIsLangModalVisible,
}: TranslationButtonProps) => {
  const pulseValue = useSharedValue(1);

  React.useEffect(() => {
    if (isTourDetailsStep) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800 }),
          withTiming(1.0, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseValue.value = 1;
    }
  }, [isTourDetailsStep]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
      shadowOpacity: isTourDetailsStep ? 0.35 : 0,
      shadowRadius: isTourDetailsStep ? 8 : 0,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 0 },
      elevation: isTourDetailsStep ? 6 : 0,
      borderRadius: 16,
      borderWidth: isTourDetailsStep ? 1.5 : (isAutoTranslateEnabled ? 1 : 0),
      borderColor: isTourDetailsStep ? theme.primary : (isAutoTranslateEnabled ? theme.primary + '30' : 'transparent'),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={() => {
          const newEnabled = !isAutoTranslateEnabled;
          setIsAutoTranslateEnabled(newEnabled);
          if (newEnabled && !isTargetLanguageSet) {
            setIsLangModalVisible(true);
          }
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isAutoTranslateEnabled || isTourDetailsStep ? theme.primary + '15' : theme.bgSecondary,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        }}
      >
        <Ionicons
          name="language"
          size={16}
          color={isAutoTranslateEnabled || isTourDetailsStep ? theme.primary : theme.textSecondary}
        />
        <TextComponent
          variant="caption"
          color={isAutoTranslateEnabled || isTourDetailsStep ? theme.primary : theme.textSecondary}
          bold
          style={{ marginLeft: 6 }}
        >
          {t('translate')}
        </TextComponent>
      </TouchableOpacity>
    </Animated.View>
  );
};
