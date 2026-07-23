import SwiftUI

// MARK: - Color Extension

extension Color {
    /// Initializes a SwiftUI Color from a hex string (supports #RGB, #RRGGBB, #AARRGGBB).
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB,
                  red: Double(r) / 255,
                  green: Double(g) / 255,
                  blue: Double(b) / 255,
                  opacity: Double(a) / 255)
    }
}

// MARK: - Accessibility & Translation Helpers

extension WatchConnectivityManager {
    /**
     Returns a localized UI string for a given key, falling back to the key itself.
     Used for static labels like "Challenges", "Submit", "Par", etc.
     - Parameter key: The string key matching those in strings.ts.
     */
    func t(_ key: String) -> String {
        watchStrings[key] ?? key
    }

    /**
     Returns a translated tour content string from the cache.
     If not yet translated, returns the original text unchanged.
     Used for dynamic content like stop names, challenge descriptions, etc.
     - Parameter original: The original (English) text from the tour data.
     */
    func tx(_ original: String?) -> String {
        guard let original = original, !original.isEmpty else { return "" }
        return translateCache[original] ?? original
    }

    /**
     Scales a base font size by the user's font scale multiplier.
     - Parameter base: The base point size at normal (1.0×) scale.
     */
    func fs(_ base: CGFloat) -> CGFloat {
        return base * CGFloat(fontScaleMultiplier)
    }
}

// MARK: - Dyslexic Mode Environment Key

private struct DyslexicModeKey: EnvironmentKey {
    static let defaultValue: Bool = false
}

extension EnvironmentValues {
    var watchDyslexicMode: Bool {
        get { self[DyslexicModeKey.self] }
        set { self[DyslexicModeKey.self] = newValue }
    }
}

// MARK: - View Extensions for Font Scaling and Dyslexia

struct WatchFontModifier: ViewModifier {
    @Environment(\.watchDyslexicMode) var dyslexicMode
    var size: CGFloat
    var weight: Font.Weight

    func body(content: Content) -> some View {
        if dyslexicMode {
            content.font(.custom("OpenDyslexic", size: size))
        } else {
            content.font(.system(size: size, weight: weight, design: .rounded))
        }
    }
}

extension View {
    /// Apply scaled, optionally dyslexic font. Prefers environment-injected dyslexicMode.
    func wFont(size: CGFloat, weight: Font.Weight = .regular) -> some View {
        self.modifier(WatchFontModifier(size: size, weight: weight))
    }

    /**
     Conditionally applies a custom font to support dyslexic users.
     When dyslexicMode is true, uses OpenDyslexic (must be bundled in the watch target).
     Falls back gracefully — if the font isn't found, SwiftUI uses the system font.
     */
    func watchFont(size: CGFloat, weight: Font.Weight = .regular) -> some View {
        let manager = WatchConnectivityManager.shared
        let scaledSize = size * CGFloat(manager.fontScaleMultiplier)
        if manager.dyslexicMode {
            return self.font(.custom("OpenDyslexic", size: scaledSize))
        } else {
            return self.font(.system(scaledSize, weight: weight, design: .rounded))
        }
    }
}
