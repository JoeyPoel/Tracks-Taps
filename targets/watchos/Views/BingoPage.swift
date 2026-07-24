import SwiftUI

// MARK: - Page 4: Bingo

struct BingoPage: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.6) : Color(hex: "#475569") }

    /// Find a bingo cell for a given row/col (0-indexed)
    func cell(row: Int, col: Int) -> WatchBingoCell? {
        manager.bingoChallenges.first { $0.row == row && $0.col == col }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 8) {
                    // Header
                    HStack {
                        Text("🎰")
                            .font(.system(size: 12))
                        Text(manager.t("bingo").uppercased())
                            .wFont(size: 10, weight: .bold)
                            .foregroundColor(Color(hex: manager.themePrimary))
                        Spacer()
                        let done = manager.bingoChallenges.filter(\.isCompleted).count
                        Text("\(done)/\(manager.bingoChallenges.count)")
                            .wFont(size: 10)
                            .foregroundColor(textSecondary)
                    }

                    // 3×3 Grid
                    VStack(spacing: 4) {
                        ForEach(0..<3, id: \.self) { row in
                            HStack(spacing: 4) {
                                ForEach(0..<3, id: \.self) { col in
                                    if let cellData = cell(row: row, col: col) {
                                        NavigationLink(destination: ChallengeDetailView(challenge: cellData.challenge)) {
                                            BingoCell(cell: cellData)
                                        }
                                        .buttonStyle(.plain)
                                    } else {
                                        BingoCell(cell: nil)
                                    }
                                }
                            }
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

struct BingoCell: View {
    let cell: WatchBingoCell?
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }

    var typeEmoji: String {
        guard let type = cell?.type else { return "⭐" }
        switch type.uppercased() {
        case "TRIVIA":     return "❓"
        case "PICTURE":    return "📸"
        case "DARE":       return "🎯"
        case "LOCATION", "CHECK_IN": return "📍"
        case "RIDDLE":     return "🧩"
        case "TRUE_FALSE": return "✅"
        default:           return "⭐"
        }
    }

    var body: some View {
        let isCompleted = cell?.isCompleted ?? false
        let isFailed = cell?.isFailed ?? false
        let title = cell?.title ?? ""

        ZStack {
            RoundedRectangle(cornerRadius: 6)
                .fill(isCompleted
                      ? Color(hex: manager.themeSecondary).opacity(0.35)
                      : (isFailed ? Color(hex: "#EF4444").opacity(0.2) : (isDark ? Color.white.opacity(0.08) : Color.black.opacity(0.06))))
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(isCompleted
                                ? Color(hex: manager.themeSecondary).opacity(0.7)
                                : (isFailed ? Color(hex: "#EF4444").opacity(0.7) : Color.clear), lineWidth: 1.5)
                )

            VStack(spacing: 2) {
                if isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(Color(hex: manager.themeSecondary))
                        .font(.system(size: 11))
                } else if isFailed {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(Color(hex: "#EF4444"))
                        .font(.system(size: 11))
                } else {
                    Text(typeEmoji)
                        .font(.system(size: 12))
                }
                
                if !title.isEmpty {
                    Text(title)
                        .font(.system(size: 6.5, weight: .medium))
                        .foregroundColor(isDark ? .white.opacity(0.8) : Color(hex: "#1E293B"))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .padding(.horizontal, 2)
                }
            }
            .padding(.vertical, 4)
        }
        .frame(maxWidth: .infinity)
        .aspectRatio(1, contentMode: .fit)
    }
}
