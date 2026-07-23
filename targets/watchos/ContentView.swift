import SwiftUI
import WatchKit

// Helper to initialize SwiftUI Color from Hex string
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

struct ContentView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared
    
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if manager.hasActiveTour {
                    ActiveTourView(
                        tourName: manager.activeTourName ?? "Active Tour",
                        completed: manager.completedStops,
                        total: manager.totalStops,
                        currentStop: manager.currentStopName,
                        currentStopDescription: manager.currentStopDescription,
                        currentStopLatitude: manager.currentStopLatitude,
                        currentStopLongitude: manager.currentStopLongitude
                    )
                } else {
                    DashboardView(
                        name: manager.userName.isEmpty ? "Explorer" : manager.userName,
                        level: manager.userLevel,
                        xp: manager.userXp
                    )
                }
            }
            .padding(.horizontal, 8)
        }
        .background(Color(hex: manager.themeBgPrimary))
    }
}

struct DashboardView: View {
    let name: String
    let level: Int
    let xp: Int
    
    @ObservedObject var manager = WatchConnectivityManager.shared
    
    var body: some View {
        VStack(spacing: 10) {
            // Header / Brand Icon
            HStack {
                Image(systemName: "map.fill")
                    .foregroundColor(Color(hex: manager.themePrimary))
                    .font(.title3)
                Text("Tracks & Taps")
                    .font(.system(.headline, design: .rounded))
                    .foregroundColor(manager.themeMode == "light" ? Color(hex: "#1E293B") : .white)
            }
            .padding(.bottom, 4)
            
            // User Greeting
            VStack(spacing: 2) {
                Text("Hello, \(name)!")
                    .font(.footnote)
                    .foregroundColor(.gray)
                    .lineLimit(1)
                
                Text("Level \(level)")
                    .font(.title3)
                    .bold()
                    .foregroundColor(Color(hex: manager.themeAccent))
            }
            
            // XP Display
            VStack(spacing: 4) {
                Text("\(xp) XP")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundColor(manager.themeMode == "light" ? Color(hex: "#475569") : .white.opacity(0.8))
                
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(manager.themeMode == "light" ? Color.black.opacity(0.1) : Color.white.opacity(0.15))
                            .frame(height: 6)
                        
                        Capsule()
                            .fill(Color(hex: manager.themeAccent))
                            .frame(width: geo.size.width * CGFloat(Double(xp % 1000) / 1000.0), height: 6)
                    }
                }
                .frame(height: 6)
                .padding(.horizontal, 16)
            }
            
            Divider()
                .background(manager.themeMode == "light" ? Color.black.opacity(0.1) : Color.white.opacity(0.2))
                .padding(.vertical, 4)
            
            Text("Start a tour on your iPhone to track it on your watch.")
                .font(.system(size: 11))
                .foregroundColor(manager.themeMode == "light" ? Color(hex: "#475569") : .white.opacity(0.6))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 4)
        }
        .padding(.vertical, 8)
    }
}

struct ActiveTourView: View {
    let tourName: String
    let completed: Int
    let total: Int
    let currentStop: String?
    let currentStopDescription: String?
    let currentStopLatitude: Double?
    let currentStopLongitude: Double?
    
    @ObservedObject var manager = WatchConnectivityManager.shared
    
    var progressFraction: Double {
        total > 0 ? Double(completed) / Double(total) : 0.0
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header badge
            HStack {
                Circle()
                    .fill(Color(hex: manager.themeSecondary))
                    .frame(width: 8, height: 8)
                Text("ACTIVE TOUR")
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundColor(Color(hex: manager.themeSecondary))
                Spacer()
            }
            
            Text(tourName)
                .font(.system(.body, design: .rounded))
                .bold()
                .foregroundColor(manager.themeMode == "light" ? Color(hex: "#1E293B") : .white)
                .lineLimit(2)
            
            // Progress Section
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Progress")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    Spacer()
                    Text("\(completed)/\(total) Stops")
                        .font(.caption2)
                        .bold()
                        .foregroundColor(manager.themeMode == "light" ? Color(hex: "#1E293B") : .white)
                }
                
                ProgressView(value: progressFraction)
                    .accentColor(Color(hex: manager.themeSecondary))
            }
            .padding(.vertical, 4)
            
            if let stop = currentStop {
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("CURRENT STOP")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundColor(.gray)
                        
                        HStack(alignment: .top, spacing: 4) {
                            Image(systemName: "mappin.circle.fill")
                               .foregroundColor(Color(hex: manager.themePrimary))
                               .font(.caption)
                            Text(stop)
                               .font(.system(size: 12, weight: .semibold))
                               .foregroundColor(manager.themeMode == "light" ? Color(hex: "#1E293B") : .white)
                               .lineLimit(2)
                        }
                    }
                    Spacer()
                    
                    if let lat = currentStopLatitude, let lng = currentStopLongitude {
                        Button(action: {
                            let urlString = "http://maps.apple.com/?daddr=\(lat),\(lng)"
                            if let url = URL(string: urlString) {
                                WKExtension.shared().openSystemURL(url)
                            }
                        }) {
                            Image(systemName: "paperplane.fill")
                                .foregroundColor(.white)
                                .font(.footnote)
                                .padding(8)
                                .background(Color(hex: manager.themePrimary))
                                .clipShape(Circle())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.top, 4)
            }
            
            if let desc = currentStopDescription, !desc.isEmpty {
                Text(desc)
                    .font(.system(size: 11))
                    .foregroundColor(manager.themeMode == "light" ? Color(hex: "#475569") : .white.opacity(0.8))
                    .padding(.top, 2)
            }
            
            Divider()
                .background(manager.themeMode == "light" ? Color.black.opacity(0.1) : Color.white.opacity(0.2))
                .padding(.vertical, 4)
            
            // Interactive Controls
            HStack(spacing: 12) {
                Button(action: {
                    WatchConnectivityManager.shared.sendAction("prevStop")
                }) {
                    HStack {
                        Image(systemName: "chevron.left.circle.fill")
                        Text("Prev")
                            .font(.caption2)
                    }
                    .foregroundColor(manager.themeMode == "light" ? Color(hex: "#1E293B") : .white)
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(manager.themeMode == "light" ? Color.black.opacity(0.1) : Color.white.opacity(0.2))
                
                Button(action: {
                    WatchConnectivityManager.shared.sendAction("nextStop")
                }) {
                    HStack {
                        Text("Next")
                            .font(.caption2)
                        Image(systemName: "chevron.right.circle.fill")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(Color(hex: manager.themeSecondary).opacity(0.3))
            }
        }
        .padding(8)
        .background(Color(hex: manager.themeBgSecondary))
        .cornerRadius(12)
    }
}
