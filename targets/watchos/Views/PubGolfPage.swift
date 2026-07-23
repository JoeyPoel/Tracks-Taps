import SwiftUI

// MARK: - Page 3: Pub Golf Page

struct PubGolfPage: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    /// Finds the Pub Golf hole details for the current stop (1-based index).
    var currentHole: WatchPubGolfStop? {
        let currentStopNumber = manager.completedStops + 1
        return manager.pubGolfStops.first { $0.stopNumber == currentStopNumber }
    }

    var scoreDeltaText: String {
        let played = manager.pubGolfStops.filter { $0.sips > 0 }
        guard !played.isEmpty else { return "–" }
        let sips = played.reduce(0) { $0 + $1.sips }
        let par = played.reduce(0) { $0 + $1.par }
        let delta = sips - par
        if delta == 0 { return "E" }
        return delta > 0 ? "+\(delta)" : "\(delta)"
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    // Header
                    HStack {
                        Text("⛳")
                            .font(.system(size: 12))
                        Text(manager.t("pubgolf").uppercased())
                            .wFont(size: 10, weight: .bold)
                            .foregroundColor(Color(hex: "#22C55E"))
                        Spacer()
                        Text(scoreDeltaText)
                            .wFont(size: 13, weight: .bold)
                            .foregroundColor(scoreDeltaText == "E" ? .green :
                                            (scoreDeltaText.hasPrefix("+") ? Color(hex: "#EF4444") : .green))
                    }

                    // Current Stop Hole Card
                    if let hole = currentHole {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("CURRENT HOLE")
                                .wFont(size: 9, weight: .bold)
                                .foregroundColor(.gray)
                            
                            PubGolfRow(stop: hole)
                        }
                        .padding(8)
                        .background(Color.white.opacity(0.06))
                        .cornerRadius(8)
                    } else {
                        VStack(spacing: 4) {
                            Image(systemName: "hand.thumbsup.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                            Text("Current stop is not a Pub Golf hole.")
                                .wFont(size: 10)
                                .foregroundColor(textSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.white.opacity(0.04))
                        .cornerRadius(8)
                    }

                    // Navigation to Scoreboard and Penalties
                    VStack(spacing: 6) {
                        NavigationLink(destination: PubGolfScoreboardView()) {
                            HStack {
                                Image(systemName: "list.bullet.clipboard.fill")
                                    .font(.system(size: 10))
                                Text("Scoreboard")
                                    .wFont(size: 11, weight: .medium)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 8))
                            }
                            .foregroundColor(.white)
                            .padding(.vertical, 8)
                            .padding(.horizontal, 10)
                            .background(Color.white.opacity(0.08))
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)

                        NavigationLink(destination: PubGolfPenaltiesView()) {
                            HStack {
                                Image(systemName: "exclamationmark.octagon.fill")
                                    .font(.system(size: 10))
                                Text("Penalties (\(manager.pubGolfPenalties.count))")
                                    .wFont(size: 11, weight: .medium)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 8))
                            }
                            .foregroundColor(.white)
                            .padding(.vertical, 8)
                            .padding(.horizontal, 10)
                            .background(Color.white.opacity(0.08))
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.top, 4)
                }
                .padding(10)
                .background(Color(hex: manager.themeBgSecondary))
                .cornerRadius(12)
                .padding(.horizontal, 4)
                .padding(.vertical, 6)
            }
        }
    }
}

// MARK: - Pub Golf Scoreboard View (Detailed Scorecard)

struct PubGolfScoreboardView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var totalSips: Int { manager.pubGolfStops.reduce(0) { $0 + $1.sips } }
    var totalPar: Int { manager.pubGolfStops.reduce(0) { $0 + $1.par } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(manager.pubGolfStops) { stop in
                    PubGolfRow(stop: stop)
                    Divider()
                        .background(Color.white.opacity(0.1))
                }

                // Total Summary
                HStack {
                    Text(manager.t("total"))
                        .wFont(size: 10, weight: .bold)
                        .foregroundColor(textPrimary)
                    Spacer()
                    Text("\(totalSips + manager.pubGolfTotalPenalties) / \(manager.t("par")) \(totalPar)")
                        .wFont(size: 10, weight: .bold)
                        .foregroundColor(textPrimary)
                }
                .padding(.top, 4)
            }
            .padding(10)
            .background(Color(hex: manager.themeBgSecondary))
            .cornerRadius(12)
            .padding(.horizontal, 4)
        }
        .navigationTitle("Scoreboard")
    }
}

// MARK: - Pub Golf Penalties View (Matches phone presets)

struct PubGolfPenaltiesView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared
    
    @State private var showingPresetList = false
    @State private var showingCustomForm = false
    @State private var customDesc = ""
    @State private var customSips = 1

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    // Hazards matching the phone app
    var presets: [(name: String, sips: Int, emoji: String)] = [
        ("Bunker Hazard", 1, "🍺"),
        ("Water Hazard", 2, "🚽"),
        ("Out of Bounds (Time)", 2, "🏃"),
        ("Out of Bounds (Venue)", 3, "🗺️"),
        ("Unfinished Drink", 5, "🍹"),
        ("Vomit Hazard", 10, "🤮")
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                
                // Add penalty selector buttons
                if !showingPresetList && !showingCustomForm {
                    HStack(spacing: 6) {
                        Button(action: { showingPresetList = true }) {
                            HStack {
                                Image(systemName: "exclamationmark.shield.fill")
                                Text("Presets")
                                    .wFont(size: 10, weight: .bold)
                            }
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color(hex: "#EF4444"))
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)

                        Button(action: { showingCustomForm = true }) {
                            HStack {
                                Image(systemName: "plus.circle")
                                Text("Custom")
                                    .wFont(size: 10, weight: .bold)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color.white.opacity(0.12))
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.bottom, 4)
                }

                // Preset List Panel
                if showingPresetList {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Select Hazard preset")
                                .wFont(size: 10, weight: .bold)
                                .foregroundColor(Color(hex: manager.themeSecondary))
                            Spacer()
                            Button("Close") { showingPresetList = false }
                                .wFont(size: 9)
                                .foregroundColor(.gray)
                                .buttonStyle(.plain)
                        }
                        .padding(.bottom, 2)

                        ForEach(presets, id: \.name) { preset in
                            Button(action: {
                                WatchConnectivityManager.shared.sendPayload([
                                    "action": "addPubGolfPenalty",
                                    "description": "\(preset.emoji) \(preset.name)",
                                    "sips": preset.sips
                                ])
                                showingPresetList = false
                            }) {
                                HStack {
                                    Text(preset.emoji).font(.system(size: 11))
                                    Text(preset.name)
                                        .wFont(size: 10, weight: .medium)
                                        .foregroundColor(textPrimary)
                                    Spacer()
                                    Text("+\(preset.sips)")
                                        .wFont(size: 10, weight: .bold)
                                        .foregroundColor(Color(hex: "#EF4444"))
                                }
                                .padding(6)
                                .background(Color.white.opacity(0.06))
                                .cornerRadius(6)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(8)
                    .background(Color.white.opacity(0.06))
                    .cornerRadius(8)
                }

                // Custom Penalty Form Panel
                if showingCustomForm {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Add Custom Penalty")
                            .wFont(size: 11, weight: .bold)
                            .foregroundColor(Color(hex: manager.themeSecondary))

                        TextField("Reason (e.g. Swore)", text: $customDesc)
                            .wFont(size: 10)
                            .padding(6)
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(6)

                        Stepper(value: $customSips, in: 1...10) {
                            Text("Penalty: \(customSips) sips")
                                .wFont(size: 10)
                        }

                        HStack(spacing: 8) {
                            Button("Cancel") { showingCustomForm = false }
                                .wFont(size: 9)
                                .foregroundColor(.gray)
                                .buttonStyle(.plain)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                                .background(Color.white.opacity(0.12))
                                .cornerRadius(6)

                            Button("Add") {
                                let desc = customDesc.trimmingCharacters(in: .whitespacesAndNewlines)
                                if !desc.isEmpty {
                                    WatchConnectivityManager.shared.sendPayload([
                                        "action": "addPubGolfPenalty",
                                        "description": desc,
                                        "sips": customSips
                                    ])
                                    customDesc = ""
                                    customSips = 1
                                    showingCustomForm = false
                                }
                            }
                            .wFont(size: 10, weight: .bold)
                            .foregroundColor(.black)
                            .buttonStyle(.plain)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                            .background(Color(hex: "#EF4444"))
                            .cornerRadius(6)
                        }
                    }
                    .padding(8)
                    .background(Color.white.opacity(0.06))
                    .cornerRadius(8)
                }

                // Applied Penalties List Header
                Text("Applied Penalties")
                    .wFont(size: 10, weight: .bold)
                    .foregroundColor(textSecondary)
                    .padding(.top, 4)

                if manager.pubGolfPenalties.isEmpty {
                    Text("No penalties logged yet.")
                        .wFont(size: 10)
                        .foregroundColor(textSecondary)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity, alignment: .center)
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(manager.pubGolfPenalties) { penalty in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(penalty.description)
                                        .wFont(size: 10, weight: .bold)
                                        .foregroundColor(textPrimary)
                                    Text("+\(penalty.sips) sips")
                                        .wFont(size: 9)
                                        .foregroundColor(Color(hex: "#EF4444"))
                                }
                                Spacer()
                                
                                Button(action: {
                                    WatchConnectivityManager.shared.sendPayload([
                                        "action": "deletePubGolfPenalty",
                                        "penaltyId": penalty.id
                                    ])
                                }) {
                                    Image(systemName: "trash.fill")
                                        .font(.system(size: 11))
                                        .foregroundColor(textSecondary)
                                }
                                .buttonStyle(.plain)
                            }
                            .padding(.vertical, 4)
                            Divider()
                                .background(Color.white.opacity(0.1))
                        }
                    }
                }
            }
            .padding(10)
            .background(Color(hex: manager.themeBgSecondary))
            .cornerRadius(12)
            .padding(.horizontal, 4)
        }
        .navigationTitle("Penalties")
    }
}

// MARK: - Pub Golf Stop Row View

struct PubGolfRow: View {
    let stop: WatchPubGolfStop
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var delta: Int { stop.sips - stop.par }

    var deltaColor: Color {
        guard stop.sips > 0 else { return textSecondary }
        if delta < 0 { return .green }
        if delta == 0 { return Color(hex: "#22C55E") }
        return Color(hex: "#EF4444")
    }

    var body: some View {
        HStack(spacing: 4) {
            Text("\(stop.stopNumber)")
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(textSecondary)
                .frame(width: 14)

            VStack(alignment: .leading, spacing: 0) {
                Text(stop.stopName)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(textPrimary)
                    .lineLimit(1)
                if !stop.drink.isEmpty {
                    Text(stop.drink)
                        .font(.system(size: 9))
                        .foregroundColor(textSecondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            HStack(spacing: 6) {
                Text("Par \(stop.par)")
                    .font(.system(size: 9))
                    .foregroundColor(textSecondary)

                HStack(spacing: 3) {
                    Button(action: {
                        let newSips = max(0, stop.sips - 1)
                        let payload: [String: Any] = [
                            "action": "updatePubGolf",
                            "stopIndex": stop.stopNumber - 1,
                            "sips": newSips
                        ]
                        WatchConnectivityManager.shared.sendPayload(payload)
                    }) {
                        Image(systemName: "minus.circle.fill")
                            .font(.system(size: 13))
                            .foregroundColor(textSecondary)
                    }
                    .buttonStyle(.plain)

                    Text(stop.sips > 0 ? "\(stop.sips)" : "–")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(deltaColor)
                        .frame(minWidth: 16, alignment: .center)

                    Button(action: {
                        let newSips = stop.sips + 1
                        let payload: [String: Any] = [
                            "action": "updatePubGolf",
                            "stopIndex": stop.stopNumber - 1,
                            "sips": newSips
                        ]
                        WatchConnectivityManager.shared.sendPayload(payload)
                    }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 13))
                            .foregroundColor(Color(hex: manager.themeSecondary))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.vertical, 2)
    }
}
