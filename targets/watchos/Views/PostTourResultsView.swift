import SwiftUI

struct PostTourResultsView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared
    @State private var isSortingByGolf = true

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.7) : Color(hex: "#475569") }

    // Sorted teams depending on active score filter
    var sortedTeams: [WatchTeam] {
        if isSortingByGolf {
            // Pub Golf: Lower score is better!
            return manager.teams.sorted { $0.golfScore < $1.golfScore }
        } else {
            // Tour XP: Higher score is better!
            return manager.teams.sorted { $0.score > $1.score }
        }
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

                // ── Score System Switcher (Only if Pub Golf stops are present) ──
                if !manager.pubGolfStops.isEmpty {
                    Button(action: {
                        isSortingByGolf.toggle()
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: isSortingByGolf ? "bolt.fill" : "flag.fill")
                                .font(.system(size: 10))
                            Text(isSortingByGolf ? "Show Tour XP" : "Show Pub Golf Sips")
                                .wFont(size: 9, weight: .bold)
                        }
                        .foregroundColor(.white)
                        .padding(.vertical, 6)
                        .frame(maxWidth: .infinity)
                        .background(Color.white.opacity(0.12))
                        .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                    .padding(.bottom, 4)
                }

                // ── Podium Section (Top 3) ──
                VStack(alignment: .leading, spacing: 5) {
                    Text(isSortingByGolf ? "PUB GOLF PODIUM" : "XP PODIUM")
                        .wFont(size: 9, weight: .bold)
                        .foregroundColor(.gray)
                        .padding(.bottom, 2)

                    let teamsCount = sortedTeams.count

                    if teamsCount > 0 {
                        PodiumRow(medal: "🥇", team: sortedTeams[0], badgeColor: Color(hex: "#FFD700"), showSips: isSortingByGolf)
                    }
                    if teamsCount > 1 {
                        PodiumRow(medal: "🥈", team: sortedTeams[1], badgeColor: Color(hex: "#C0C0C0"), showSips: isSortingByGolf)
                    }
                    if teamsCount > 2 {
                        PodiumRow(medal: "🥉", team: sortedTeams[2], badgeColor: Color(hex: "#CD7F32"), showSips: isSortingByGolf)
                    }
                }
                .padding(8)
                .background(Color.white.opacity(0.06))
                .cornerRadius(8)

                // ── Full Scoreboard ──
                Text(isSortingByGolf ? "Golf Scoreboard" : "XP Scoreboard")
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

                            Text(isSortingByGolf ? "\(team.golfScore) sips" : "\(team.score) pts")
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
        .onAppear {
            // Default to golf score if the tour is a Pub Golf tour
            isSortingByGolf = !manager.pubGolfStops.isEmpty
        }
    }
}

struct PodiumRow: View {
    let medal: String
    let team: WatchTeam
    let badgeColor: Color
    var showSips: Bool

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

            Text(showSips ? "\(team.golfScore) sips" : "\(team.score) pts")
                .wFont(size: 9, weight: .bold)
                .foregroundColor(.black)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(badgeColor)
                .cornerRadius(4)
        }
    }
}
