import SwiftUI

struct PostTourResultsView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.7) : Color(hex: "#475569") }

    // Sorted teams by score descending
    var sortedTeams: [WatchTeam] {
        manager.teams.sorted { $0.score > $1.score }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack(spacing: 4) {
                    Image(systemName: "trophy.fill")
                        .foregroundColor(Color(hex: manager.themeAccent))
                        .font(.system(size: 11))
                    Text("TOUR COMPLETED")
                        .wFont(size: 10, weight: .bold)
                        .foregroundColor(Color(hex: manager.themeAccent))
                }

                Text(manager.tx(manager.activeTourName))
                    .wFont(size: 13, weight: .bold)
                    .foregroundColor(textPrimary)
                    .lineLimit(2)

                Divider()
                    .background(Color.white.opacity(0.15))
                    .padding(.vertical, 2)

                // ── Podium Section (Top 3) ──
                VStack(alignment: .leading, spacing: 5) {
                    Text("PODIUM WINNERS")
                        .wFont(size: 9, weight: .bold)
                        .foregroundColor(.gray)
                        .padding(.bottom, 2)

                    let teamsCount = sortedTeams.count

                    if teamsCount > 0 {
                        PodiumRow(medal: "🥇", team: sortedTeams[0], badgeColor: Color(hex: "#FFD700")) // Gold
                    }
                    if teamsCount > 1 {
                        PodiumRow(medal: "🥈", team: sortedTeams[1], badgeColor: Color(hex: "#C0C0C0")) // Silver
                    }
                    if teamsCount > 2 {
                        PodiumRow(medal: "🥉", team: sortedTeams[2], badgeColor: Color(hex: "#CD7F32")) // Bronze
                    }
                }
                .padding(8)
                .background(Color.white.opacity(0.06))
                .cornerRadius(8)

                // ── Full Scoreboard ──
                Text("All Teams Scoreboard")
                    .wFont(size: 10, weight: .bold)
                    .foregroundColor(textSecondary)
                    .padding(.top, 6)

                VStack(spacing: 6) {
                    ForEach(Array(sortedTeams.enumerated()), id: \.offset) { index, team in
                        HStack(spacing: 6) {
                            Text("\(index + 1)")
                                .wFont(size: 10, weight: .bold)
                                .foregroundColor(.gray)
                                .frame(width: 14, alignment: .center)
                            
                            Text(team.emoji)
                                .font(.system(size: 11))

                            Text(team.name)
                                .wFont(size: 10, weight: team.id == manager.myTeamId ? .bold : .semibold)
                                .foregroundColor(Color(hex: team.color))
                            
                            Spacer()

                            Text("\(team.score) pts")
                                .wFont(size: 10, weight: .bold)
                                .foregroundColor(textPrimary)
                        }
                        .padding(6)
                        .background(team.id == manager.myTeamId ? Color(hex: manager.themeSecondary).opacity(0.15) : Color.white.opacity(0.04))
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(team.id == manager.myTeamId ? Color(hex: manager.themeSecondary) : Color.clear, lineWidth: 1)
                        )
                        .cornerRadius(6)
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

struct PodiumRow: View {
    let medal: String
    let team: WatchTeam
    let badgeColor: Color

    var body: some View {
        HStack(spacing: 6) {
            Text(medal)
                .font(.system(size: 14))
            
            Text(team.emoji)
                .font(.system(size: 11))

            Text(team.name)
                .wFont(size: 10, weight: .bold)
                .foregroundColor(Color(hex: team.color))
                .lineLimit(1)

            Spacer()

            Text("\(team.score) pts")
                .wFont(size: 9, weight: .bold)
                .foregroundColor(.black)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(badgeColor)
                .cornerRadius(4)
        }
    }
}
