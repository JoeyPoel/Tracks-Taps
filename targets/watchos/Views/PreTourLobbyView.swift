import SwiftUI

struct PreTourLobbyView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.7) : Color(hex: "#475569") }

    var myTeam: WatchTeam? {
        manager.teams.first { $0.id == manager.myTeamId }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack(spacing: 4) {
                    Image(systemName: "person.3.fill")
                        .foregroundColor(Color(hex: manager.themeSecondary))
                        .font(.system(size: 11))
                    Text("PRE-TOUR LOBBY")
                        .wFont(size: 10, weight: .bold)
                        .foregroundColor(Color(hex: manager.themeSecondary))
                }

                // Tour name
                Text(manager.tx(manager.activeTourName))
                    .wFont(size: 13, weight: .bold)
                    .foregroundColor(textPrimary)
                    .lineLimit(2)

                Divider()
                    .background(Color.white.opacity(0.15))
                    .padding(.vertical, 2)

                // My Team Details
                if let team = myTeam {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("YOUR TEAM")
                            .wFont(size: 9, weight: .bold)
                            .foregroundColor(.gray)
                        HStack(spacing: 6) {
                            Text(team.emoji)
                                .font(.system(size: 13))
                            Text(team.name)
                                .wFont(size: 11, weight: .semibold)
                                .foregroundColor(Color(hex: team.color))
                        }
                    }
                    .padding(6)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white.opacity(0.06))
                    .cornerRadius(8)
                }

                // Teams List Header
                Text("Joined Teams (\(manager.teams.count))")
                    .wFont(size: 10, weight: .bold)
                    .foregroundColor(textSecondary)
                    .padding(.top, 4)

                // List of teams
                VStack(spacing: 6) {
                    ForEach(manager.teams) { team in
                        HStack(spacing: 6) {
                            Text(team.emoji)
                                .font(.system(size: 11))
                            
                            VStack(alignment: .leading, spacing: 1) {
                                Text(team.name)
                                    .wFont(size: 10, weight: .semibold)
                                    .foregroundColor(Color(hex: team.color))
                                Text("Player: \(team.userName)")
                                    .wFont(size: 8)
                                    .foregroundColor(.gray)
                            }
                            Spacer()
                        }
                        .padding(6)
                        .background(Color.white.opacity(0.04))
                        .cornerRadius(6)
                    }
                }

                // Status text footer
                VStack {
                    ProgressView()
                        .scaleEffect(0.6)
                        .padding(.vertical, 2)
                    Text("Waiting for host to start...")
                        .wFont(size: 9)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                }
                .padding(.top, 8)
            }
            .padding(10)
            .background(Color(hex: manager.themeBgSecondary))
            .cornerRadius(12)
            .padding(.horizontal, 4)
            .padding(.vertical, 6)
        }
    }
}
