import SwiftUI
import WatchKit

// MARK: - Page 3: Pub Golf Page

struct PubGolfPage: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var totalSips: Int { manager.pubGolfStops.reduce(0) { $0 + $1.sips } }
    var totalPar: Int { manager.pubGolfStops.reduce(0) { $0 + $1.par } }
    var finalScore: Int { (totalSips + manager.pubGolfTotalPenalties) - totalPar }

    var statusText: String {
        if finalScore < 0 { return "Under Par" }
        if finalScore > 0 { return "Over Par" }
        return "Even Par"
    }

    var statusIcon: String {
        if finalScore < 0 { return "flame.fill" }
        if finalScore > 0 { return "exclamationmark.triangle.fill" }
        return "flag.fill"
    }

    var statusColor: Color {
        if finalScore < 0 { return .yellow }
        if finalScore > 0 { return .white }
        return .white
    }

    /// Finds the Pub Golf hole details for the current stop (1-based index).
    var currentHole: WatchPubGolfStop? {
        let currentStopNumber = manager.completedStops + 1
        return manager.pubGolfStops.first { $0.stopNumber == currentStopNumber }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    
                    // ── Gradient Total Score Card ──
                    VStack(alignment: .center, spacing: 4) {
                        Text("TOTAL SCORE")
                            .wFont(size: 8, weight: .bold)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text("\(totalSips + manager.pubGolfTotalPenalties) / \(totalPar)")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        
                        HStack(spacing: 4) {
                            Image(systemName: statusIcon)
                                .font(.system(size: 9))
                                .foregroundColor(statusColor)
                            Text(statusText.uppercased())
                                .wFont(size: 8, weight: .bold)
                                .foregroundColor(statusColor)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: manager.themeAccent), Color(hex: manager.themePrimary)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(16)
                    .shadow(radius: 4)

                    // ── Current Stop Hole Card ──
                    if let hole = currentHole {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("CURRENT HOLE")
                                .wFont(size: 8, weight: .bold)
                                .foregroundColor(.gray)
                            
                            PubGolfRow(stop: hole)
                        }
                        .padding(8)
                        .background(Color.white.opacity(0.06))
                        .cornerRadius(8)
                    } else {
                        VStack(spacing: 4) {
                            Image(systemName: "hand.thumbsup.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                            Text("Current stop is not a Pub Golf hole.")
                                .wFont(size: 9)
                                .foregroundColor(textSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color.white.opacity(0.04))
                        .cornerRadius(8)
                    }

                    // ── Full Scorecard Inline ──
                    VStack(alignment: .leading, spacing: 6) {
                        Text("HOLES SCORECARD")
                            .wFont(size: 8, weight: .bold)
                            .foregroundColor(textSecondary)
                            .padding(.top, 4)

                        ForEach(manager.pubGolfStops) { stop in
                            PubGolfRow(stop: stop)
                            Divider()
                                .background(Color.white.opacity(0.08))
                        }
                    }

                    // ── Penalties Manager Link ──
                    NavigationLink(destination: PubGolfPenaltiesView()) {
                        HStack {
                            Image(systemName: "exclamationmark.octagon.fill")
                                .font(.system(size: 10))
                            Text("Penalties (\(manager.pubGolfPenalties.count))")
                                .wFont(size: 10, weight: .medium)
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

// MARK: - Pub Golf Stop Row View (Tapping opens vertical picker)

struct PubGolfRow: View {
    let stop: WatchPubGolfStop
    @State private var showingSipsPicker = false
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var delta: Int { stop.sips - stop.par }

    func scoreColors(for sips: Int, par: Int) -> (text: Color, border: Color, bg: Color) {
        let diff = sips - par
        if sips == 1 {
            return (Color(hex: "#FFD700"), Color(hex: "#F59E0B"), Color(hex: "#291c06")) // Hole in One
        }
        if diff == -3 {
            return (Color(hex: "#A855F7"), Color(hex: "#9333EA"), Color(hex: "#1e1b4b")) // Albatross
        }
        if diff == -2 {
            return (Color(hex: "#E879F9"), Color(hex: "#D946EF"), Color(hex: "#1f0f21")) // Eagle
        }
        if diff == -1 {
            return (Color(hex: "#4ADE80"), Color(hex: "#22C55E"), Color(hex: "#062115")) // Birdie
        }
        if diff == 0 {
            return (Color(hex: "#60A5FA"), Color(hex: "#3B82F6"), Color(hex: "#0f172a")) // Par
        }
        if diff == 1 {
            return (Color(hex: "#FB923C"), Color(hex: "#F97316"), Color(hex: "#27150a")) // Bogey
        }
        if diff == 2 {
            return (Color(hex: "#F87171"), Color(hex: "#EF4444"), Color(hex: "#2b0e0e")) // Double Bogey
        }
        // diff >= 3
        return (Color(hex: "#9CA3AF"), Color(hex: "#6B7280"), Color(hex: "#111827")) // Triple Bogey+
    }

    var body: some View {
        Button(action: { 
            showingSipsPicker = true 
            WKInterfaceDevice.current().play(.click)
        }) {
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
                    
                    HStack(spacing: 3) {
                        if !stop.drink.isEmpty {
                            Text(stop.drink)
                                .font(.system(size: 8))
                                .foregroundColor(textSecondary)
                                .lineLimit(1)
                        }
                        if stop.sips > 0 {
                            if !stop.drink.isEmpty {
                                Text("•")
                                    .font(.system(size: 7))
                                    .foregroundColor(textSecondary)
                            }
                            
                            let label: String = stop.sips == 1 ? "Hole in One" : (delta == -3 ? "Albatross" : (delta == -2 ? "Eagle" : (delta == -1 ? "Birdie" : (delta == 0 ? "Par" : (delta == 1 ? "Bogey" : (delta == 2 ? "Double Bogey" : "Triple Bogey+"))))))
                            let colors = scoreColors(for: stop.sips, par: stop.par)
                            
                            Text(label)
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(colors.text)
                        }
                    }
                }

                Spacer()

                HStack(spacing: 8) {
                    Text("Par \(stop.par)")
                        .font(.system(size: 9))
                        .foregroundColor(textSecondary)

                    // Score Display (Clickable Badge styled matching phone)
                    if stop.sips > 0 {
                        let colors = scoreColors(for: stop.sips, par: stop.par)
                        Text("\(stop.sips)")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundColor(colors.text)
                            .frame(width: 22, height: 22)
                            .background(
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(colors.bg)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(colors.border, lineWidth: 1)
                            )
                    } else {
                        Text("–")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundColor(textSecondary)
                            .frame(width: 22, height: 22)
                            .background(
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.white.opacity(0.08))
                            )
                    }
                }
            }
            .padding(.vertical, 2)
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showingSipsPicker) {
            SipsSelectorSheet(stop: stop)
        }
    }
}

// MARK: - Sips Selector Sheet

struct SipsSelectorSheet: View {
    let stop: WatchPubGolfStop
    @Environment(\.dismiss) var dismiss
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }

    // Generates values from 1 to par + 3
    var sipsOptions: [Int] {
        Array(1...(stop.par + 3))
    }

    func scoreColors(for sips: Int, par: Int) -> (text: Color, border: Color, bg: Color) {
        let diff = sips - par
        if sips == 1 {
            return (Color(hex: "#FFD700"), Color(hex: "#F59E0B"), Color(hex: "#291c06")) // Hole in One
        }
        if diff == -3 {
            return (Color(hex: "#A855F7"), Color(hex: "#9333EA"), Color(hex: "#1e1b4b")) // Albatross
        }
        if diff == -2 {
            return (Color(hex: "#E879F9"), Color(hex: "#D946EF"), Color(hex: "#1f0f21")) // Eagle
        }
        if diff == -1 {
            return (Color(hex: "#4ADE80"), Color(hex: "#22C55E"), Color(hex: "#062115")) // Birdie
        }
        if diff == 0 {
            return (Color(hex: "#60A5FA"), Color(hex: "#3B82F6"), Color(hex: "#0f172a")) // Par
        }
        if diff == 1 {
            return (Color(hex: "#FB923C"), Color(hex: "#F97316"), Color(hex: "#27150a")) // Bogey
        }
        if diff == 2 {
            return (Color(hex: "#F87171"), Color(hex: "#EF4444"), Color(hex: "#2b0e0e")) // Double Bogey
        }
        // diff >= 3
        return (Color(hex: "#9CA3AF"), Color(hex: "#6B7280"), Color(hex: "#111827")) // Triple Bogey+
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                // Header
                Text(stop.stopName)
                    .wFont(size: 10, weight: .bold)
                    .foregroundColor(textPrimary)
                    .lineLimit(1)
                
                if !stop.drink.isEmpty {
                    Text(stop.drink)
                        .wFont(size: 9, weight: .medium)
                        .foregroundColor(Color(hex: manager.themeSecondary))
                        .lineLimit(1)
                }

                Text("Select Sips (Par \(stop.par))")
                    .wFont(size: 9)
                    .foregroundColor(.gray)
                    .padding(.bottom, 4)

                // Vertical Stack of buttons
                ForEach(sipsOptions, id: \.self) { num in
                    let isSelected = stop.sips == num
                    let colors = scoreColors(for: num, par: stop.par)

                    Button(action: {
                        let payload: [String: Any] = [
                            "action": "updatePubGolf",
                            "stopIndex": stop.stopNumber - 1,
                            "sips": num
                        ]
                        // Haptic feedback & optimistic update
                        WKInterfaceDevice.current().play(.click)
                        WatchConnectivityManager.shared.updatePubGolfSipsOptimistically(stopIndex: stop.stopNumber - 1, sips: num)
                        WatchConnectivityManager.shared.sendPayload(payload)
                        dismiss()
                    }) {
                        HStack {
                            Text("\(num) \(num == 1 ? "sip" : "sips")")
                                .wFont(size: 11, weight: .bold)
                                .foregroundColor(isSelected ? .white : colors.text)
                            
                            Spacer()
                            
                            // Performance badge text matching phone naming
                            let diff = num - stop.par
                            let scoreLabel = num == 1 ? "Hole in One" : (diff == -3 ? "Albatross" : (diff == -2 ? "Eagle" : (diff == -1 ? "Birdie" : (diff == 0 ? "Par" : (diff == 1 ? "Bogey" : (diff == 2 ? "Double Bogey" : "Triple Bogey+"))))))
                            
                            Text(scoreLabel)
                                .wFont(size: 8, weight: .semibold)
                                .foregroundColor(isSelected ? .white.opacity(0.8) : colors.text.opacity(0.8))

                            if isSelected {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.white)
                                    .font(.system(size: 10))
                            }
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(isSelected ? Color(hex: manager.themeSecondary) : colors.bg)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(isSelected ? Color.white : colors.border, lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                }

                // Clear Score Option
                if stop.sips > 0 {
                    Button(action: {
                        let payload: [String: Any] = [
                            "action": "updatePubGolf",
                            "stopIndex": stop.stopNumber - 1,
                            "sips": 0
                        ]
                        WatchConnectivityManager.shared.updatePubGolfSipsOptimistically(stopIndex: stop.stopNumber - 1, sips: 0)
                        WatchConnectivityManager.shared.sendPayload(payload)
                        dismiss()
                    }) {
                        Text("Clear Score")
                            .wFont(size: 10, weight: .semibold)
                            .foregroundColor(.red)
                            .padding(.vertical, 8)
                            .frame(maxWidth: .infinity)
                            .background(Color.red.opacity(0.15))
                            .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 4)
                }
            }
            .padding(.horizontal, 6)
            .padding(.vertical, 10)
        }
        .background(Color(hex: manager.themeBgPrimary))
    }
}

// MARK: - Pub Golf Penalties View

struct PubGolfPenaltiesView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared
    
    @State private var showingPresetList = false
    @State private var showingCustomForm = false
    @State private var customDesc = ""
    @State private var customSips = 1

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

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
                
                if !showingPresetList && !showingCustomForm {
                    HStack(spacing: 6) {
                        Button(action: { 
                            showingPresetList = true 
                            WKInterfaceDevice.current().play(.click)
                        }) {
                            HStack {
                                Image(systemName: "exclamationmark.shield.fill")
                                Text("Presets")
                                    .wFont(size: 10, weight: .bold)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color(hex: manager.themePrimary))
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)

                        Button(action: { 
                            showingCustomForm = true 
                            WKInterfaceDevice.current().play(.click)
                        }) {
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
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(hex: manager.themeSecondary).opacity(0.4), lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.bottom, 4)
                }

                if showingPresetList {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Select Hazard preset")
                                .wFont(size: 10, weight: .bold)
                                .foregroundColor(Color(hex: manager.themeSecondary))
                            Spacer()
                            Button("Close") { 
                                showingPresetList = false 
                                WKInterfaceDevice.current().play(.click)
                            }
                            .wFont(size: 9)
                            .foregroundColor(.gray)
                            .buttonStyle(.plain)
                        }
                        .padding(.bottom, 2)

                        ForEach(presets, id: \.name) { preset in
                            Button(action: {
                                let label = "\(preset.emoji) \(preset.name)"
                                WatchConnectivityManager.shared.sendPayload([
                                    "action": "addPubGolfPenalty",
                                    "description": label,
                                    "sips": preset.sips
                                ])
                                WatchConnectivityManager.shared.addPubGolfPenaltyOptimistically(description: label, sips: preset.sips)
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
                                        .foregroundColor(Color(hex: manager.themePrimary))
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
                            Button("Cancel") { 
                                showingCustomForm = false 
                                WKInterfaceDevice.current().play(.click)
                            }
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
                                    WatchConnectivityManager.shared.addPubGolfPenaltyOptimistically(description: desc, sips: customSips)
                                    customDesc = ""
                                    customSips = 1
                                    showingCustomForm = false
                                }
                            }
                            .wFont(size: 10, weight: .bold)
                            .foregroundColor(.white)
                            .buttonStyle(.plain)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                            .background(Color(hex: manager.themePrimary))
                            .cornerRadius(6)
                        }
                    }
                    .padding(8)
                    .background(Color.white.opacity(0.06))
                    .cornerRadius(8)
                }

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
                                        .foregroundColor(Color(hex: manager.themePrimary))
                                }
                                Spacer()
                                
                                Button(action: {
                                    WatchConnectivityManager.shared.sendPayload([
                                        "action": "deletePubGolfPenalty",
                                        "penaltyId": penalty.id
                                    ])
                                    WatchConnectivityManager.shared.deletePubGolfPenaltyOptimistically(penaltyId: penalty.id)
                                }) {
                                    Image(systemName: "trash.fill")
                                        .font(.system(size: 11))
                                        .foregroundColor(Color(hex: manager.themePrimary).opacity(0.8))
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
