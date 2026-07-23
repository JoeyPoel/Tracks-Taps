import SwiftUI

struct DashboardView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared
    @Environment(\.watchDyslexicMode) var dyslexicMode

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                // Brand header
                HStack(spacing: 6) {
                    Image(systemName: "map.fill")
                        .foregroundColor(Color(hex: manager.themePrimary))
                        .font(.title3)
                    Text("Tracks & Taps")
                        .wFont(size: 14, weight: .bold)
                        .foregroundColor(textPrimary)
                }
                .padding(.bottom, 4)

                if manager.isLoggedIn {
                    VStack(spacing: 4) {
                        Text("Hello, \(manager.userName.isEmpty ? "Explorer" : manager.userName)!")
                            .wFont(size: 11)
                            .foregroundColor(textSecondary)
                            .lineLimit(1)

                        Text("\(manager.t("level")) \(manager.userLevel)")
                            .wFont(size: 16, weight: .bold)
                            .foregroundColor(Color(hex: manager.themeAccent))
                    }

                    VStack(spacing: 4) {
                        Text("\(manager.userXp) \(manager.t("xp"))")
                            .wFont(size: 10)
                            .foregroundColor(textSecondary)

                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Capsule()
                                    .fill(isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.1))
                                    .frame(height: 6)
                                Capsule()
                                    .fill(Color(hex: manager.themeAccent))
                                    .frame(width: geo.size.width * CGFloat(Double(manager.userXp % 1000) / 1000.0), height: 6)
                            }
                        }
                        .frame(height: 6)
                        .padding(.horizontal, 8)
                    }

                    Divider()
                        .background(isDark ? Color.white.opacity(0.2) : Color.black.opacity(0.1))
                        .padding(.vertical, 4)

                    Text("Start a tour on your iPhone to track it here.")
                        .wFont(size: 11)
                        .foregroundColor(textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 4)

                } else {
                    VStack(spacing: 8) {
                        Image(systemName: "iphone.and.arrow.forward")
                            .font(.title2)
                            .foregroundColor(Color(hex: manager.themePrimary))

                        Text("Open Tracks & Taps on your iPhone and log in to sync your tour here.")
                            .wFont(size: 11)
                            .foregroundColor(textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 4)
                    }
                    .padding(.vertical, 8)
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 8)
        }
    }
}
