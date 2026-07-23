import SwiftUI
import WatchConnectivity

@main
struct WatchApp: App {
    /// Observes scene phase changes (foreground / background / inactive).
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        // Re-activate WCSession and request a full resync every time
        // the watch app moves to the foreground (from clock face, sleep, etc.)
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .active {
                WatchConnectivityManager.shared.activateSession()
                WatchConnectivityManager.shared.requestResync()
            }
        }
    }
}
