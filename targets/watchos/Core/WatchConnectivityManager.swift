import Foundation
import WatchConnectivity
import Combine

// MARK: - Watch Data Models

/// A single challenge displayed on the watch.
struct WatchChallenge: Identifiable {
    let id: Int
    let title: String
    let description: String
    let type: String
    /// For trivia/riddle: the question text (may differ from title/description).
    let content: String?
    /// Optional hint text shown to the user.
    let hint: String?
    /// Answer options for TRIVIA / TRUE_FALSE challenges.
    let options: [String]
    /// Correct answer string used to validate the user's selection locally.
    let answer: String?
    let isCompleted: Bool
    let isFailed: Bool
}

/// A pub golf stop entry shown in the watch scorecard.
struct WatchPubGolfStop: Identifiable {
    let id: Int
    let stopName: String
    let stopNumber: Int
    let par: Int
    let drink: String
    let sips: Int
}

/// A cell in the bingo grid, carrying the full challenge to view and play.
struct WatchBingoCell: Identifiable {
    let id: Int
    let title: String
    let row: Int
    let col: Int
    let isCompleted: Bool
    let challenge: WatchChallenge
}

/// A pub golf penalty logged in the tour.
struct WatchPubGolfPenalty: Identifiable {
    let id: Int
    let description: String
    let sips: Int
}

/// A team in the tour lobby or results list.
struct WatchTeam: Identifiable {
    let id: Int
    let name: String
    let emoji: String
    let color: String
    let score: Int
    let currentStop: Int
    let finishedAt: String?
    let userName: String
}

/// A tour stop with its coordinates, used to draw the route map.
struct WatchStop: Identifiable {
    let id: Int              // index
    let name: String
    let latitude: Double?
    let longitude: Double?
    let isCurrent: Bool
    let isCompleted: Bool
}

// MARK: - Connectivity Manager

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {

    // MARK: User state
    @Published var userName: String = ""
    @Published var userXp: Int = 0
    @Published var userLevel: Int = 1
    @Published var isLoggedIn: Bool = false

    // MARK: Tour state
    @Published var activeTourName: String? = nil
    @Published var completedStops: Int = 0
    @Published var totalStops: Int = 0
    @Published var currentStopName: String? = nil
    @Published var currentStopDescription: String? = nil
    @Published var currentStopLatitude: Double? = nil
    @Published var currentStopLongitude: Double? = nil
    @Published var hasActiveTour: Bool = false
    @Published var tourDescription: String = ""
    @Published var difficulty: String = "medium"
    @Published var creatorName: String = ""
    
    // Status can be: WAITING, PRE_TOUR_LOBBY, IN_PROGRESS, POST_TOUR_LOBBY, COMPLETED, etc.
    @Published var tourStatus: String = "IN_PROGRESS"
    @Published var teams: [WatchTeam] = []
    @Published var myTeamId: Int? = nil
    @Published var winnerTeamId: Int? = nil

    // MARK: Rich tour data
    @Published var stopChallenges: [WatchChallenge] = []
    @Published var bonusChallenges: [WatchChallenge] = []
    @Published var bingoChallenges: [WatchBingoCell] = []
    @Published var pubGolfStops: [WatchPubGolfStop] = []
    @Published var pubGolfPenalties: [WatchPubGolfPenalty] = []
    @Published var pubGolfTotalPenalties: Int = 0
    @Published var tourModes: [String] = []
    /// All tour stops with coordinates for the route map.
    @Published var allStops: [WatchStop] = []

    // MARK: Theme
    @Published var themeBgPrimary: String = "#0F172A"
    @Published var themeBgSecondary: String = "#1E293B"
    @Published var themePrimary: String = "#E91E63"
    @Published var themeSecondary: String = "#2AC3FF"
    @Published var themeAccent: String = "#FFD700"
    @Published var themeMode: String = "dark"

    // MARK: Accessibility
    /// Font scale multiplier mirroring the iPhone's SCALE_MULTIPLIERS.
    @Published var fontScaleMultiplier: Double = 1.0
    /// When true, use the OpenDyslexic font throughout the watch UI.
    @Published var dyslexicMode: Bool = false
    /// Active language code (e.g. "en", "nl", "de").
    @Published var language: String = "en"
    /// Localized UI strings for watch labels, keyed by string key.
    @Published var watchStrings: [String: String] = [:]
    /// Translation cache: original tour text → translated text.
    @Published var translateCache: [String: String] = [:]

    private var keepAliveTimer: Timer?

    static let shared = WatchConnectivityManager()

    private override init() {
        super.init()
        activateSession()
        startKeepAliveTimer()
    }

    // MARK: - Keep-Alive Timer

    private func startKeepAliveTimer() {
        keepAliveTimer?.invalidate()
        keepAliveTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            if WCSession.default.activationState == .activated && WCSession.default.isReachable {
                self.requestResync()
            }
        }
    }

    // MARK: - Session Activation

    /// Activates the WCSession. Safe to call multiple times.
    func activateSession() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        session.activate()
    }

    // MARK: - Watch → Phone Actions

    func sendAction(_ actionName: String) {
        sendPayload(["action": actionName])
    }

    func sendPayload(_ payload: [String: Any]) {
        guard WCSession.default.activationState == .activated else {
            activateSession()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
                self?.sendPayload(payload)
            }
            return
        }

        if WCSession.default.isReachable {
            WCSession.default.sendMessage(payload, replyHandler: nil) { [weak self] error in
                print("[Watch] sendMessage failed: \(error.localizedDescription) — falling back to context")
                try? WCSession.default.updateApplicationContext(payload)
            }
        } else {
            do {
                try WCSession.default.updateApplicationContext(payload)
            } catch {
                print("[Watch] updateApplicationContext failed: \(error.localizedDescription)")
            }
        }
    }

    func requestResync() {
        sendPayload(["action": "requestSync"])
    }

    // MARK: - WCSessionDelegate

    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {
        if let error = error {
            print("[Watch] WCSession activation error: \(error.localizedDescription)")
        } else {
            print("[Watch] WCSession activated. State: \(activationState.rawValue)")
            if activationState == .activated {
                requestResync()
            }
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        if session.isReachable {
            print("[Watch] Phone became reachable — requesting resync.")
            requestResync()
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        DispatchQueue.main.async {
            self.processContext(applicationContext)
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async {
            self.processContext(message)
        }
    }

    func session(
        _ session: WCSession,
        didReceiveMessage message: [String: Any],
        replyHandler: @escaping ([String: Any]) -> Void
    ) {
        DispatchQueue.main.async {
            self.processContext(message)
        }
        replyHandler(["status": "ok"])
    }

    // MARK: - Context Processing

    private func processContext(_ context: [String: Any]) {

        if let loggedIn = context["isLoggedIn"] as? Bool {
            self.isLoggedIn = loggedIn
        }

        if let userData = context["user"] as? [String: Any] {
            self.userName = userData["name"] as? String ?? "Explorer"
            self.userXp = userData["xp"] as? Int ?? 0
            self.userLevel = userData["level"] as? Int ?? 1
            self.isLoggedIn = true
        } else if context["user"] is NSNull || context["user"] == nil, context.keys.contains("isLoggedIn") {
            self.userName = ""
            self.userXp = 0
            self.userLevel = 1
        }

        // --- Active Tour ---
        if let tourData = context["activeTour"] as? [String: Any] {
            self.hasActiveTour = true
            self.activeTourName = tourData["name"] as? String
            self.completedStops = tourData["completedStops"] as? Int ?? 0
            self.totalStops = tourData["totalStops"] as? Int ?? 0
            self.currentStopName = tourData["currentStopName"] as? String
            self.currentStopDescription = tourData["currentStopDescription"] as? String
            self.tourDescription = tourData["tourDescription"] as? String ?? ""
            self.difficulty = tourData["difficulty"] as? String ?? "medium"
            self.creatorName = tourData["creatorName"] as? String ?? ""
            self.tourStatus = tourData["status"] as? String ?? "IN_PROGRESS"
            self.myTeamId = tourData["myTeamId"] as? Int
            self.winnerTeamId = tourData["winnerTeamId"] as? Int

            // Coordinates
            let lat = tourData["currentStopLatitude"] as? Double
            let lng = tourData["currentStopLongitude"] as? Double
            self.currentStopLatitude = (lat != nil && lat != 0) ? lat : nil
            self.currentStopLongitude = (lng != nil && lng != 0) ? lng : nil

            // Tour modes
            self.tourModes = tourData["tourModes"] as? [String] ?? []

            // Stop challenges
            self.stopChallenges = Self.parseChallenges(tourData["stopChallenges"])
            self.bonusChallenges = Self.parseChallenges(tourData["bonusChallenges"])
            self.bingoChallenges = Self.parseBingoCells(tourData["bingoChallenges"])
            self.pubGolfStops = Self.parsePubGolfStops(tourData["pubGolfStops"])
            self.pubGolfPenalties = Self.parsePenalties(tourData["pubGolfPenalties"])
            self.pubGolfTotalPenalties = tourData["pubGolfTotalPenalties"] as? Int ?? 0
            self.allStops = Self.parseAllStops(tourData["allStops"])
            self.teams = Self.parseTeams(tourData["teams"])

        } else if let noTour = context["hasActiveTour"] as? Bool, !noTour {
            self.hasActiveTour = false
            self.activeTourName = nil
            self.currentStopName = nil
            self.currentStopDescription = nil
            self.currentStopLatitude = nil
            self.currentStopLongitude = nil
            self.tourDescription = ""
            self.difficulty = "medium"
            self.creatorName = ""
            self.tourStatus = "IN_PROGRESS"
            self.myTeamId = nil
            self.winnerTeamId = nil
            self.stopChallenges = []
            self.bonusChallenges = []
            self.bingoChallenges = []
            self.pubGolfStops = []
            self.pubGolfPenalties = []
            self.pubGolfTotalPenalties = 0
            self.tourModes = []
            self.allStops = []
            self.teams = []
        }

        // --- Theme ---
        if let themeData = context["theme"] as? [String: Any] {
            self.themeBgPrimary = themeData["bgPrimary"] as? String ?? "#0F172A"
            self.themeBgSecondary = themeData["bgSecondary"] as? String ?? "#1E293B"
            self.themePrimary = themeData["primary"] as? String ?? "#E91E63"
            self.themeSecondary = themeData["secondary"] as? String ?? "#2AC3FF"
            self.themeAccent = themeData["accent"] as? String ?? "#FFD700"
            self.themeMode = themeData["mode"] as? String ?? "dark"
        }

        // --- Accessibility ---
        if let a11y = context["accessibility"] as? [String: Any] {
            self.language = a11y["language"] as? String ?? "en"
            self.dyslexicMode = a11y["dyslexicMode"] as? Bool ?? false

            let scaleKey = a11y["fontScale"] as? String ?? "normal"
            let scaleMap: [String: Double] = [
                "smallest": 0.75, "small": 0.87, "normal": 1.0, "large": 1.15, "largest": 1.3
            ]
            self.fontScaleMultiplier = scaleMap[scaleKey] ?? 1.0

            if let strings = a11y["strings"] as? [String: String] {
                self.watchStrings = strings
            }
            if let cache = a11y["translateCache"] as? [String: String] {
                self.translateCache = cache
            }
        }
    }

    // MARK: - Parsing Helpers

    private static func parseChallenges(_ raw: Any?) -> [WatchChallenge] {
        guard let arr = raw as? [[String: Any]] else { return [] }
        return arr.enumerated().compactMap { (idx, dict) in
            guard let id = dict["id"] as? Int,
                  let title = dict["title"] as? String else { return nil }
            return WatchChallenge(
                id: id,
                title: title,
                description: dict["description"] as? String ?? "",
                type: dict["type"] as? String ?? "",
                content: dict["content"] as? String,
                hint: dict["hint"] as? String,
                options: dict["options"] as? [String] ?? [],
                answer: dict["answer"] as? String,
                isCompleted: dict["isCompleted"] as? Bool ?? false,
                isFailed: dict["isFailed"] as? Bool ?? false
            )
        }
    }

    private static func parseBingoCells(_ raw: Any?) -> [WatchBingoCell] {
        guard let arr = raw as? [[String: Any]] else { return [] }
        return arr.compactMap { dict in
            guard let id = dict["id"] as? Int,
                  let row = dict["row"] as? Int,
                  let col = dict["col"] as? Int else { return nil }
            let challenge = WatchChallenge(
                id: id,
                title: dict["title"] as? String ?? "",
                description: dict["description"] as? String ?? "",
                type: dict["type"] as? String ?? "TRIVIA",
                content: dict["content"] as? String,
                hint: dict["hint"] as? String,
                options: dict["options"] as? [String] ?? [],
                answer: dict["answer"] as? String,
                isCompleted: dict["isCompleted"] as? Bool ?? false,
                isFailed: dict["isFailed"] as? Bool ?? false
            )
            return WatchBingoCell(
                id: id,
                title: dict["title"] as? String ?? "",
                row: row,
                col: col,
                isCompleted: dict["isCompleted"] as? Bool ?? false,
                challenge: challenge
            )
        }
    }

    private static func parsePubGolfStops(_ raw: Any?) -> [WatchPubGolfStop] {
        guard let arr = raw as? [[String: Any]] else { return [] }
        return arr.enumerated().compactMap { (idx, dict) in
            return WatchPubGolfStop(
                id: idx,
                stopName: dict["stopName"] as? String ?? "Stop",
                stopNumber: dict["stopNumber"] as? Int ?? (idx + 1),
                par: dict["par"] as? Int ?? 0,
                drink: dict["drink"] as? String ?? "",
                sips: dict["sips"] as? Int ?? 0
            )
        }
    }

    private static func parsePenalties(_ raw: Any?) -> [WatchPubGolfPenalty] {
        guard let arr = raw as? [[String: Any]] else { return [] }
        return arr.compactMap { dict in
            guard let id = dict["id"] as? Int,
                  let sips = dict["sips"] as? Int else { return nil }
            return WatchPubGolfPenalty(
                id: id,
                description: dict["description"] as? String ?? "Penalty",
                sips: sips
            )
        }
    }

    private static func parseTeams(_ raw: Any?) -> [WatchTeam] {
        guard let arr = raw as? [[String: Any]] else { return [] }
        return arr.compactMap { dict in
            guard let id = dict["id"] as? Int else { return nil }
            return WatchTeam(
                id: id,
                name: dict["name"] as? String ?? "Team",
                emoji: dict["emoji"] as? String ?? "👥",
                color: dict["color"] as? String ?? "#3B82F6",
                score: dict["score"] as? Int ?? 0,
                currentStop: dict["currentStop"] as? Int ?? 1,
                finishedAt: dict["finishedAt"] as? String,
                userName: dict["userName"] as? String ?? "Explorer"
            )
        }
    }

    private static func parseAllStops(_ raw: Any?) -> [WatchStop] {
        guard let arr = raw as? [[String: Any]] else { return [] }
        return arr.compactMap { dict in
            guard let index = dict["index"] as? Int else { return nil }
            let lat = dict["latitude"] as? Double
            let lng = dict["longitude"] as? Double
            return WatchStop(
                id: index,
                name: dict["name"] as? String ?? "Stop \(index + 1)",
                latitude: (lat != nil && lat != 0) ? lat : nil,
                longitude: (lng != nil && lng != 0) ? lng : nil,
                isCurrent: dict["isCurrent"] as? Bool ?? false,
                isCompleted: dict["isCompleted"] as? Bool ?? false
            )
        }
    }
}
