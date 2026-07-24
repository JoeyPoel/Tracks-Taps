import SwiftUI

struct PreTourLobbyView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.7) : Color(hex: "#475569") }

    var myTeam: WatchTeam? {
        manager.teams.first { $0.id == manager.myTeamId }
    }

    var formattedTourCode: String {
        guard let id = manager.activeTourId else { return "" }
        let s = String(id)
        if s.count == 9 {
            let index3 = s.index(s.startIndex, offsetBy: 3)
            let index6 = s.index(s.startIndex, offsetBy: 6)
            return "\(s[..<index3]) \(s[index3..<index6]) \(s[index6...])"
        }
        return s
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

                // Tour code
                if manager.activeTourId != nil {
                    HStack(spacing: 4) {
                        Text("CODE:")
                            .wFont(size: 8, weight: .bold)
                            .foregroundColor(.gray)
                        Text(formattedTourCode)
                            .wFont(size: 10, weight: .semibold, design: .monospaced)
                            .foregroundColor(Color(hex: manager.themeAccent))
                    }
                    .padding(.top, -2)
                }

                Divider()
                    .background(Color.white.opacity(0.15))
                    .padding(.vertical, 2)

                // My Team Details (Rendered separately with full styling)
                if let team = myTeam {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("YOUR TEAM")
                            .wFont(size: 8, weight: .bold)
                            .foregroundColor(.gray)
                        
                        HStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(Color(hex: team.color).opacity(0.2))
                                    .frame(width: 24, height: 24)
                                Text(team.emoji)
                                    .font(.system(size: 14))
                            }

                            VStack(alignment: .leading, spacing: 1) {
                                Text(team.name)
                                    .wFont(size: 11, weight: .bold)
                                    .foregroundColor(Color(hex: team.color))
                                
                                Text("Player: \(team.userName)")
                                    .wFont(size: 9)
                                    .foregroundColor(textSecondary)
                            }
                            Spacer()
                        }
                        .padding(6)
                        .background(Color.white.opacity(0.04))
                        .cornerRadius(8)
                    }
                    .padding(8)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(hex: team.color), lineWidth: 1.5)
                    )
                    .padding(.bottom, 4)
                }

                // Teams List Header
                Text("Joined Teams (\(manager.teams.count))")
                    .wFont(size: 10, weight: .bold)
                    .foregroundColor(textSecondary)
                    .padding(.top, 4)

                // List of other teams (excluding current user's team)
                VStack(spacing: 6) {
                    let otherTeams = manager.teams.filter { $0.id != manager.myTeamId }
                    if otherTeams.isEmpty {
                        Text("Waiting for other players...")
                            .wFont(size: 9)
                            .foregroundColor(.gray)
                            .padding(.vertical, 4)
                            .frame(maxWidth: .infinity, alignment: .center)
                    } else {
                        ForEach(otherTeams) { team in
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
