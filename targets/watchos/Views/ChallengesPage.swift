import SwiftUI

// MARK: - Page 2: Challenges (with navigation to detail)

struct ChallengesPage: View {
    @ObservedObject var manager = WatchConnectivityManager.shared
    @State private var selectedChallenge: WatchChallenge? = nil

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var allChallenges: [WatchChallenge] { manager.stopChallenges + manager.bonusChallenges }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 6) {
                    // Header
                    HStack {
                        Image(systemName: "bolt.fill")
                            .foregroundColor(Color(hex: manager.themeAccent))
                            .font(.caption)
                        Text(manager.t("challenges").uppercased())
                            .wFont(size: 10, weight: .bold)
                            .foregroundColor(Color(hex: manager.themeAccent))
                        Spacer()
                        Text("\(allChallenges.filter(\.isCompleted).count)/\(allChallenges.count)")
                            .wFont(size: 10)
                            .foregroundColor(textSecondary)
                    }

                    if allChallenges.isEmpty {
                        Text("No challenges for this stop.")
                            .wFont(size: 11)
                            .foregroundColor(textSecondary)
                            .padding(.vertical, 8)
                    } else {
                        ForEach(allChallenges) { challenge in
                            NavigationLink(destination: ChallengeDetailView(challenge: challenge)) {
                                ChallengeRow(challenge: challenge)
                            }
                            .buttonStyle(.plain)
                        }
                    }
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

// MARK: - Challenge List Row

struct ChallengeRow: View {
    let challenge: WatchChallenge
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var statusColor: Color {
        if challenge.isCompleted { return Color(hex: "#22C55E") }
        if challenge.isFailed    { return Color(hex: "#EF4444") }
        return Color(hex: manager.themeAccent)
    }

    var statusIcon: String {
        if challenge.isCompleted { return "checkmark.circle.fill" }
        if challenge.isFailed    { return "xmark.circle.fill" }
        return "circle"
    }

    var typeEmoji: String {
        switch challenge.type.uppercased() {
        case "TRIVIA":     return "❓"
        case "PICTURE":    return "📸"
        case "DARE":       return "🎯"
        case "LOCATION":   return "📍"
        case "RIDDLE":     return "🧩"
        case "TRUE_FALSE": return "✅"
        default:           return "⭐"
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: statusIcon)
                .foregroundColor(statusColor)
                .font(.caption)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(typeEmoji).font(.system(size: 10))
                    Text(challenge.title)
                        .wFont(size: 11, weight: .semibold)
                        .foregroundColor(textPrimary)
                        .lineLimit(2)
                }
                if !challenge.description.isEmpty && challenge.description != challenge.title {
                    Text(manager.tx(challenge.description))
                        .wFont(size: 10)
                        .foregroundColor(textSecondary)
                        .lineLimit(2)
                }
            }
            Spacer()
            if !challenge.isCompleted && !challenge.isFailed {
                Image(systemName: "chevron.right")
                    .font(.system(size: 9))
                    .foregroundColor(textSecondary.opacity(0.5))
            }
        }
        .padding(.vertical, 4)
        .padding(.horizontal, 2)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(isDark ? Color.white.opacity(0.05) : Color.black.opacity(0.04))
        )
    }
}

// MARK: - Challenge Detail / Play View

struct ChallengeDetailView: View {
    let challenge: WatchChallenge
    @ObservedObject var manager = WatchConnectivityManager.shared
    @Environment(\.dismiss) var dismiss

    /// Tracks the selected option index for TRIVIA / TRUE_FALSE before submitting.
    @State private var selectedOptionIndex: Int? = nil
    /// Whether the user has submitted and is waiting for the result to come back via sync.
    @State private var submitted = false

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    var challengeType: String { challenge.type.uppercased() }
    var isPicture: Bool { challengeType == "PICTURE" }
    var isTrivia: Bool  { challengeType == "TRIVIA" }
    var isTrueFalse: Bool { challengeType == "TRUE_FALSE" }
    var isClaimable: Bool { challengeType == "LOCATION" || challengeType == "CHECK_IN" || challengeType == "DARE" || challengeType == "RIDDLE" }

    /// Question text: prefer `content`, fall back to `description`, then `title`.
    var questionText: String {
        if let c = challenge.content, !c.isEmpty { return c }
        if !challenge.description.isEmpty { return challenge.description }
        return challenge.title
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {

                // Status banner (if already done)
                if challenge.isCompleted {
                    resultBanner(icon: "checkmark.circle.fill", text: "Completed!", color: Color(hex: "#22C55E"))
                } else if challenge.isFailed {
                    resultBanner(icon: "xmark.circle.fill", text: "Failed", color: Color(hex: "#EF4444"))
                } else if submitted {
                    resultBanner(icon: "hourglass", text: "Syncing…", color: .gray)
                }

                // Type badge + title
                HStack(spacing: 6) {
                    Text(typeEmoji)
                        .font(.system(size: 14))
                    Text(challenge.title)
                        .wFont(size: 12, weight: .bold)
                        .foregroundColor(textPrimary)
                        .lineLimit(3)
                }

                // Question / instruction text
                Text(manager.tx(questionText))
                    .wFont(size: 11)
                    .foregroundColor(textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                // Hint
                if let hint = challenge.hint, !hint.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "lightbulb.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 9))
                        Text(manager.tx(hint))
                            .wFont(size: 10)
                            .foregroundColor(.yellow.opacity(0.85))
                            .lineLimit(3)
                    }
                    .padding(6)
                    .background(Color.yellow.opacity(0.12))
                    .cornerRadius(8)
                }

                Divider()
                    .background(isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.1))

                // ── Interactive area ──────────────────────────────────────

                if isPicture {
                    // PICTURE: phone-only notice
                    VStack(spacing: 6) {
                        Image(systemName: "iphone.and.arrow.forward")
                            .font(.title3)
                            .foregroundColor(Color(hex: manager.themePrimary))
                        Text("Take a photo on your iPhone to complete this challenge.")
                            .wFont(size: 10)
                            .foregroundColor(textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)

                } else if isTrivia, !challenge.options.isEmpty {
                    // TRIVIA: multiple choice
                    triviaOptions()

                } else if isTrueFalse {
                    // TRUE_FALSE
                    trueFalseButtons()

                } else if isClaimable {
                    // LOCATION / DARE / RIDDLE / CHECK_IN: claim or fail
                    claimButtons()
                }
            }
            .padding(10)
        }
        .background(Color(hex: manager.themeBgPrimary))
        .navigationTitle(typeLabel)
    }

    // MARK: Sub-views

    /// Trivia multiple-choice buttons
    @ViewBuilder
    private func triviaOptions() -> some View {
        let isLocked = challenge.isCompleted || challenge.isFailed || submitted
        VStack(spacing: 6) {
            ForEach(Array(challenge.options.enumerated()), id: \.offset) { idx, option in
                Button(action: {
                    guard !isLocked else { return }
                    selectedOptionIndex = idx
                }) {
                    HStack {
                        Text(manager.tx(option))
                            .wFont(size: 11)
                            .foregroundColor(selectedOptionIndex == idx ? .white : textPrimary)
                            .lineLimit(3)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 6)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(selectedOptionIndex == idx
                                  ? Color(hex: manager.themeSecondary)
                                  : (isDark ? Color.white.opacity(0.08) : Color.black.opacity(0.06)))
                    )
                }
                .buttonStyle(.plain)
                .disabled(isLocked)
            }

            if let idx = selectedOptionIndex, !isLocked {
                Button(action: {
                    submitAnswer(answer: challenge.options[idx])
                }) {
                    Text(manager.t("submitAnswer"))
                        .wFont(size: 12, weight: .semibold)
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color(hex: manager.themeAccent))
                        .cornerRadius(10)
                }
                .buttonStyle(.plain)
                .padding(.top, 4)
            }
        }
    }

    /// True / False buttons
    @ViewBuilder
    private func trueFalseButtons() -> some View {
        let isLocked = challenge.isCompleted || challenge.isFailed || submitted
        let options = challenge.options.isEmpty ? ["True", "False"] : challenge.options

        VStack(spacing: 6) {
            ForEach(options, id: \.self) { option in
                Button(action: {
                    guard !isLocked else { return }
                    submitAnswer(answer: option)
                }) {
                    Text(option)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(option.lowercased() == "true"
                                    ? Color(hex: "#22C55E").opacity(0.8)
                                    : Color(hex: "#EF4444").opacity(0.8))
                        .cornerRadius(10)
                }
                .buttonStyle(.plain)
                .disabled(isLocked)
            }
        }
    }

    /// Complete / Fail buttons for location, dare, riddle, check-in
    @ViewBuilder
    private func claimButtons() -> some View {
        let isLocked = challenge.isCompleted || challenge.isFailed || submitted
        VStack(spacing: 8) {
            Button(action: {
                guard !isLocked else { return }
                sendStructuredAction("completeChallenge", challengeId: challenge.id)
                submitted = true
            }) {
                Label(manager.t("claimPoints"), systemImage: "checkmark.circle.fill")
                    .wFont(size: 12, weight: .semibold)
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color(hex: "#22C55E"))
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
            .disabled(isLocked)

            Button(action: {
                guard !isLocked else { return }
                sendStructuredAction("failChallenge", challengeId: challenge.id)
                submitted = true
            }) {
                Label(manager.t("back"), systemImage: "xmark.circle")
                    .wFont(size: 12, weight: .semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(isDark ? Color.white.opacity(0.12) : Color.black.opacity(0.08))
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
            .disabled(isLocked)
        }
    }

    /// Result banner shown after completion/failure
    @ViewBuilder
    private func resultBanner(icon: String, text: String, color: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon).foregroundColor(color)
            Text(text).font(.system(size: 11, weight: .semibold)).foregroundColor(color)
        }
        .padding(6)
        .background(color.opacity(0.15))
        .cornerRadius(8)
    }

    // MARK: Helpers

    private var typeEmoji: String {
        switch challengeType {
        case "TRIVIA":     return "❓"
        case "PICTURE":    return "📸"
        case "DARE":       return "🎯"
        case "LOCATION":   return "📍"
        case "RIDDLE":     return "🧩"
        case "TRUE_FALSE": return "✅"
        default:           return "⭐"
        }
    }

    private var typeLabel: String {
        switch challengeType {
        case "TRIVIA":     return "Trivia"
        case "PICTURE":    return "Photo"
        case "DARE":       return "Dare"
        case "LOCATION":   return "Location"
        case "RIDDLE":     return "Riddle"
        case "TRUE_FALSE": return "True/False"
        default:           return "Challenge"
        }
    }

    /**
     Submits an answer for trivia/true-false challenges.
     Sends `answerChallenge` message with the selected answer string.
     */
    private func submitAnswer(answer: String) {
        guard !submitted else { return }
        WatchConnectivityManager.shared.sendPayload([
            "action": "answerChallenge",
            "challengeId": challenge.id,
            "answer": answer
        ])
        submitted = true
    }

    /**
     Sends a structured action (completeChallenge / failChallenge) with the challenge ID.
     */
    private func sendStructuredAction(_ action: String, challengeId: Int) {
        WatchConnectivityManager.shared.sendPayload([
            "action": action,
            "challengeId": challengeId
        ])
    }
}
