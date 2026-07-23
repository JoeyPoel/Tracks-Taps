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

    var body: some View {
        let isCompleted = cell?.isCompleted ?? false
        let title = cell?.title ?? ""

        ZStack {
            RoundedRectangle(cornerRadius: 6)
                .fill(isCompleted
                      ? Color(hex: manager.themeSecondary).opacity(0.35)
                      : (isDark ? Color.white.opacity(0.08) : Color.black.opacity(0.06)))
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(isCompleted
                                ? Color(hex: manager.themeSecondary).opacity(0.7)
                                : Color.clear, lineWidth: 1.5)
                )

            if isCompleted {
                VStack(spacing: 1) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(Color(hex: manager.themeSecondary))
                        .font(.system(size: 10))
                    if !title.isEmpty {
                        Text(title)
                            .font(.system(size: 7, weight: .medium))
                            .foregroundColor(isDark ? .white.opacity(0.8) : Color(hex: "#1E293B"))
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .padding(.horizontal, 2)
                    }
                }
            } else if !title.isEmpty {
                Text(title)
                    .font(.system(size: 7, weight: .medium))
                    .foregroundColor(isDark ? .white.opacity(0.7) : Color(hex: "#475569"))
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .padding(4)
            } else {
                Text("?")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(isDark ? Color.white.opacity(0.2) : Color.black.opacity(0.2))
            }
        }
        .frame(maxWidth: .infinity)
        .aspectRatio(1, contentMode: .fit)
    }
}
