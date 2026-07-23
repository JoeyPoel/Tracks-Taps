import SwiftUI

// MARK: - Root Content View

struct ContentView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    /// Map fontScaleMultiplier to watchOS DynamicTypeSize so ALL Text scales automatically.
    var dynamicTypeSize: DynamicTypeSize {
        switch manager.fontScaleMultiplier {
        case ..<0.80: return .xSmall
        case 0.80..<0.95: return .small
        case 0.95..<1.10: return .large
        case 1.10..<1.25: return .xLarge
        default: return .xxLarge
        }
    }

    var body: some View {
        Group {
            if manager.hasActiveTour {
                if manager.tourStatus == "PRE_TOUR_LOBBY" || manager.tourStatus == "WAITING" {
                    PreTourLobbyView()
                } else if manager.tourStatus == "POST_TOUR_LOBBY" || manager.tourStatus == "COMPLETED" {
                    PostTourResultsView()
                } else {
                    ActiveTourView()
                }
            } else {
                DashboardView()
            }
        }
        .background(Color(hex: manager.themeBgPrimary))
        // Propagate font scale to all child views via DynamicTypeSize environment
        .dynamicTypeSize(dynamicTypeSize)
        // Propagate dyslexic font to all Text that use .font() — we override via the environment
        .environment(\.watchDyslexicMode, manager.dyslexicMode)
        .onAppear {
            WatchConnectivityManager.shared.requestResync()
        }
    }
}
