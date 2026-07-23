import Foundation
import WatchConnectivity
import Combine

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    @Published var userName: String = ""
    @Published var userXp: Int = 0
    @Published var userLevel: Int = 1
    
    @Published var activeTourName: String? = nil
    @Published var completedStops: Int = 0
    @Published var totalStops: Int = 0
    @Published var currentStopName: String? = nil
    @Published var currentStopDescription: String? = nil
    @Published var currentStopLatitude: Double? = nil
    @Published var currentStopLongitude: Double? = nil
    @Published var hasActiveTour: Bool = false
    
    // Theme Colors (dynamic)
    @Published var themeBgPrimary: String = "#0F172A"
    @Published var themeBgSecondary: String = "#1E293B"
    @Published var themePrimary: String = "#E91E63"
    @Published var themeSecondary: String = "#2AC3FF"
    @Published var themeAccent: String = "#FFD700"
    @Published var themeMode: String = "dark"
    
    static let shared = WatchConnectivityManager()
    
    private override init() {
        super.init()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }
    
    func sendAction(_ actionName: String) {
        if WCSession.default.isReachable {
            WCSession.default.sendMessage(["action": actionName], replyHandler: nil) { error in
                print("Error sending action to iPhone: \(error.localizedDescription)")
            }
        } else {
            // Attempt application context update as fallback
            try? WCSession.default.updateApplicationContext(["action": actionName])
        }
    }
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("watchOS WCSession activation complete. State: \(activationState.rawValue)")
    }
    
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        DispatchQueue.main.async {
            self.processContext(applicationContext)
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        DispatchQueue.main.async {
            self.processContext(message)
        }
    }
    
    private func processContext(_ context: [String : Any]) {
        // Process User State
        if let userData = context["user"] as? [String: Any] {
            self.userName = userData["name"] as? String ?? "Explorer"
            self.userXp = userData["xp"] as? Int ?? 0
            self.userLevel = userData["level"] as? Int ?? 1
        }
        
        // Process Active Tour State
        if let tourData = context["activeTour"] as? [String: Any] {
            self.hasActiveTour = true
            self.activeTourName = tourData["name"] as? String
            self.completedStops = tourData["completedStops"] as? Int ?? 0
            self.totalStops = tourData["totalStops"] as? Int ?? 0
            self.currentStopName = tourData["currentStopName"] as? String
            self.currentStopDescription = tourData["currentStopDescription"] as? String
            self.currentStopLatitude = tourData["currentStopLatitude"] as? Double
            self.currentStopLongitude = tourData["currentStopLongitude"] as? Double
        } else if let noTour = context["hasActiveTour"] as? Bool, !noTour {
            self.hasActiveTour = false
            self.activeTourName = nil
            self.currentStopName = nil
            self.currentStopDescription = nil
            self.currentStopLatitude = nil
            self.currentStopLongitude = nil
        }
        
        // Process Theme State
        if let themeData = context["theme"] as? [String: Any] {
            self.themeBgPrimary = themeData["bgPrimary"] as? String ?? "#0F172A"
            self.themeBgSecondary = themeData["bgSecondary"] as? String ?? "#1E293B"
            self.themePrimary = themeData["primary"] as? String ?? "#E91E63"
            self.themeSecondary = themeData["secondary"] as? String ?? "#2AC3FF"
            self.themeAccent = themeData["accent"] as? String ?? "#FFD700"
            self.themeMode = themeData["mode"] as? String ?? "dark"
        }
    }
}
