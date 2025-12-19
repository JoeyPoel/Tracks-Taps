# Animation & Haptics System

This system provides a unified way to add life and tactility to the app using `react-native-reanimated` and `expo-haptics`.

## Core Components

### 1. `AnimatedPressable`
The foundational component for all interactive elements. Replaces `TouchableOpacity` / `Pressable`.

**Usage:**
```tsx
import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';

<AnimatedPressable 
  onPress={handlePress} 
  interactionScale="medium" // 'subtle' (0.98), 'medium' (0.97), 'deep' (0.92)
  haptic="light"            // 'light', 'medium', 'heavy', 'success', 'warning', 'error'
>
  <YourContent />
</AnimatedPressable>
```

### 2. `AnimatedButton`
A consolidated button component that uses `AnimatedPressable` internally.

**Usage:**
```tsx
import { AnimatedButton } from '@/src/components/common/AnimatedButton';

<AnimatedButton 
  title="Submit" 
  onPress={handleSubmit} 
  variant="primary" // 'primary', 'secondary', 'outline', 'danger'
  loading={isLoading}
/>
```

### 3. `ScreenWrapper`
Wraps your screen content to provide a consistent "Soft Slide-in & Fade" entry animation (Spring-based).

**Usage:**
```tsx
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';

export default function MyScreen() {
  return (
    <ScreenWrapper withScrollView>
      {/* Screen Content */}
    </ScreenWrapper>
  );
}
```

### 4. `Shimmer`
A loading skeleton effect.

**Usage:**
```tsx
import { Shimmer } from '@/src/components/common/Shimmer';

<Shimmer width={200} height={20} borderRadius={4} />
```

## Utilities

### Haptics
Centralized haptic trigger.

```tsx
import { triggerHaptic } from '@/src/utils/haptics';

triggerHaptic('success');
```

## Configuration
Animation constants are defined in `src/theme/animations.ts`. You can tweak physics (stiffness, damping) there.

## Integration Guide
1. **Identify Buttons/Cards**: Replace `TouchableOpacity` with `AnimatedPressable`.
2. **Screens**: Wrap top-level screen views with `ScreenWrapper`.
3. **Loading**: Replace static loaders with `Shimmer`.
