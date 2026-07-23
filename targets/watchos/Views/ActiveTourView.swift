import SwiftUI
import WatchKit
import MapKit

// MARK: - Active Tour Root View (Paged Tabs)

struct ActiveTourView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var hasPubGolf: Bool { !manager.pubGolfStops.isEmpty }
    var hasBingo: Bool { manager.tourModes.contains("BINGO") && !manager.bingoChallenges.isEmpty }
    var hasChallenges: Bool { !manager.stopChallenges.isEmpty || !manager.bonusChallenges.isEmpty }

    /// True when there are additional pages beyond the main stop info page.
    var hasExtraPages: Bool { hasChallenges || hasPubGolf || hasBingo }

    var body: some View {
        TabView {
            // Page 0: Detailed tour information (swiping right to reveal)
            TourDetailPage()
                .tag(-1)

            // Page 1: Stop info + navigation (Main Page)
            StopInfoPage(showSwipeHint: hasExtraPages)
                .tag(0)

            // Page 2: Challenges (if any)
            if hasChallenges {
                ChallengesPage()
                    .tag(1)
            }

            // Page 3: Pub Golf scorecard (if applicable)
            if hasPubGolf {
                PubGolfPage()
                    .tag(2)
            }

            // Page 4: Bingo grid (if applicable)
            if hasBingo {
                BingoPage()
                    .tag(3)
            }
        }
        .tabViewStyle(.page)
        .background(Color(hex: manager.themeBgPrimary))
    }
}

// MARK: - Page 0: Tour Detail Page

struct TourDetailPage: View {
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.7) : Color(hex: "#475569") }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 6) {
                // Header
                HStack(spacing: 4) {
                    Image(systemName: "info.circle.fill")
                        .foregroundColor(Color(hex: manager.themeSecondary))
                        .font(.system(size: 11))
                    Text("TOUR DETAILS")
                        .wFont(size: 10, weight: .bold)
                        .foregroundColor(Color(hex: manager.themeSecondary))
                }

                // Title
                Text(manager.tx(manager.activeTourName))
                    .wFont(size: 13, weight: .bold)
                    .foregroundColor(textPrimary)
                    .lineLimit(3)
                    .padding(.top, 2)

                // Meta metadata (curator, stops, difficulty)
                VStack(alignment: .leading, spacing: 2) {
                    if !manager.creatorName.isEmpty {
                        Text("Curated by \(manager.creatorName)")
                            .wFont(size: 10)
                            .foregroundColor(textSecondary)
                    }

                    HStack(spacing: 8) {
                        Text("\(manager.totalStops) stops")
                            .wFont(size: 9, weight: .semibold)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.white.opacity(0.12))
                            .cornerRadius(4)

                        Text(manager.difficulty.uppercased())
                            .wFont(size: 9, weight: .bold)
                            .foregroundColor(difficultyColor)
                    }
                    .padding(.top, 2)
                }

                Divider()
                    .background(isDark ? Color.white.opacity(0.2) : Color.black.opacity(0.1))
                    .padding(.vertical, 2)

                // Description
                if !manager.tourDescription.isEmpty {
                    Text(manager.tx(manager.tourDescription))
                        .wFont(size: 10)
                        .foregroundColor(textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                } else {
                    Text("No overview details provided.")
                        .wFont(size: 10)
                        .foregroundColor(textSecondary)
                }
            }
            .padding(10)
            .background(Color(hex: manager.themeBgSecondary))
            .cornerRadius(12)
            .padding(.horizontal, 4)
            .padding(.vertical, 6)
        }
    }

    private var difficultyColor: Color {
        switch manager.difficulty.lowercased() {
        case "easy":   return .green
        case "medium": return .orange
        case "hard":   return .red
        default:       return .gray
        }
    }
}

// MARK: - Page 1: Stop Info + Controls

struct StopInfoPage: View {
    var showSwipeHint: Bool = false
    @ObservedObject var manager = WatchConnectivityManager.shared

    var isDark: Bool { manager.themeMode != "light" }
    var textPrimary: Color { isDark ? .white : Color(hex: "#1E293B") }
    var textSecondary: Color { isDark ? Color.white.opacity(0.7) : Color(hex: "#475569") }

    var progressFraction: Double {
        manager.totalStops > 0 ? Double(manager.completedStops) / Double(manager.totalStops) : 0.0
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 8) {

                    // Active tour badge
                    HStack {
                        Circle()
                            .fill(Color(hex: manager.themeSecondary))
                            .frame(width: 8, height: 8)
                        Text("ACTIVE TOUR")
                            .wFont(size: 10, weight: .bold)
                            .foregroundColor(Color(hex: manager.themeSecondary))
                        Spacer()
                    }

                    // Tour name (translated if auto-translate is on)
                    Text(manager.tx(manager.activeTourName) )
                        .wFont(size: 13, weight: .bold)
                        .foregroundColor(textPrimary)
                        .lineLimit(2)

                    // Progress bar
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(manager.t("progress"))
                                .wFont(size: 10)
                                .foregroundColor(.gray)
                            Spacer()
                            Text("\(manager.completedStops)/\(manager.totalStops)")
                                .wFont(size: 10, weight: .bold)
                                .foregroundColor(textPrimary)
                        }
                        ProgressView(value: progressFraction)
                            .accentColor(Color(hex: manager.themeSecondary))
                    }
                    .padding(.vertical, 2)

                    // Route Map Preview button
                    if !manager.allStops.isEmpty {
                        NavigationLink(destination: RouteMapView()) {
                            HStack {
                                Image(systemName: "map.fill")
                                    .font(.system(size: 10))
                                Text("View Route Map")
                                    .wFont(size: 10, weight: .semibold)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 8))
                            }
                            .foregroundColor(.white)
                            .padding(.vertical, 6)
                            .padding(.horizontal, 8)
                            .background(Color(hex: manager.themeSecondary).opacity(0.2))
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)
                        .padding(.vertical, 2)
                    }

                    // Current stop name
                    if let stop = manager.currentStopName {
                        HStack(alignment: .top, spacing: 4) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("CURRENT STOP")
                                    .wFont(size: 9, weight: .semibold)
                                    .foregroundColor(.gray)
                                HStack(alignment: .top, spacing: 4) {
                                    Image(systemName: "mappin.circle.fill")
                                        .foregroundColor(Color(hex: manager.themePrimary))
                                        .font(.caption)
                                    Text(manager.tx(stop))
                                        .wFont(size: 12, weight: .semibold)
                                        .foregroundColor(textPrimary)
                                        .lineLimit(2)
                                }
                                
                                // Mention if it is a pub golf hole
                                let currentStopNumber = manager.completedStops + 1
                                if let pgHole = manager.pubGolfStops.first(where: { $0.stopNumber == currentStopNumber }) {
                                    HStack(spacing: 4) {
                                        Text("⛳")
                                            .font(.system(size: 8))
                                        Text("Pub Golf: Par \(pgHole.par) (\(pgHole.drink))")
                                            .wFont(size: 9, weight: .bold)
                                            .foregroundColor(Color(hex: "#22C55E"))
                                    }
                                    .padding(.top, 2)
                                }
                            }
                            Spacer()

                            // Maps navigation button
                            if let lat = manager.currentStopLatitude, let lng = manager.currentStopLongitude {
                                Button(action: {
                                    let urlString = "http://maps.apple.com/?daddr=\(lat),\(lng)&dirflg=w"
                                    if let url = URL(string: urlString) {
                                        WKApplication.shared().openSystemURL(url)
                                    }
                                }) {
                                    Image(systemName: "arrow.triangle.turn.up.right.circle.fill")
                                        .foregroundColor(.white)
                                        .font(.title3)
                                        .padding(6)
                                        .background(Color(hex: manager.themePrimary))
                                        .clipShape(Circle())
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.top, 2)
                    }

                    // Description
                    if let desc = manager.currentStopDescription, !desc.isEmpty {
                        Text(manager.tx(desc))
                            .wFont(size: 11)
                            .foregroundColor(textSecondary)
                            .padding(.top, 2)
                            .lineLimit(4)
                    }

                    Divider()
                        .background(isDark ? Color.white.opacity(0.2) : Color.black.opacity(0.1))
                        .padding(.vertical, 4)

                    // Prev / Next arrow buttons (no text labels)
                    HStack(spacing: 16) {
                        Button(action: {
                            WatchConnectivityManager.shared.sendAction("prevStop")
                        }) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(textPrimary)
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        .tint(isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.1))

                        Button(action: {
                            WatchConnectivityManager.shared.sendAction("nextStop")
                        }) {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        .tint(Color(hex: manager.themeSecondary).opacity(0.5))
                    }

                    // Swipe hint — only shown if extra pages exist
                    if showSwipeHint {
                        HStack(spacing: 4) {
                            Spacer()
                            Image(systemName: "chevron.left.2")
                                .font(.system(size: 8, weight: .semibold))
                                .foregroundColor(Color(hex: manager.themeSecondary).opacity(0.7))
                            Text(manager.t("done") == "Done" ? "swipe for more" : manager.t("next"))
                                .wFont(size: 9)
                                .foregroundColor(Color(hex: manager.themeSecondary).opacity(0.7))
                        }
                        .padding(.top, 2)
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

// MARK: - Route Map View

struct RouteMapView: View {
    @ObservedObject var manager = WatchConnectivityManager.shared
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 52.3702, longitude: 4.8952), // Default Amsterdam fallback
        span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
    )

    var stopsWithCoords: [WatchStop] {
        manager.allStops.filter { $0.latitude != nil && $0.longitude != nil }
    }

    var body: some View {
        Group {
            if stopsWithCoords.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "map")
                        .font(.title2)
                        .foregroundColor(.gray)
                    Text("No coordinates loaded yet")
                        .wFont(size: 10)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                }
            } else {
                Map(coordinateRegion: $region, annotationItems: stopsWithCoords) { stop in
                    MapAnnotation(coordinate: CLLocationCoordinate2D(latitude: stop.latitude!, longitude: stop.longitude!)) {
                        VStack(spacing: 2) {
                            Image(systemName: stop.isCurrent ? "mappin.circle.fill" : (stop.isCompleted ? "checkmark.circle.fill" : "circle.fill"))
                                .foregroundColor(stop.isCurrent ? Color(hex: manager.themePrimary) : (stop.isCompleted ? Color.green : Color(hex: manager.themeSecondary)))
                                .font(.system(size: stop.isCurrent ? 14 : 10))
                                .background(Color.black.clipShape(Circle()))
                            
                            Text(stop.name)
                                .wFont(size: 7, weight: .bold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 1)
                                .background(Color.black.opacity(0.75))
                                .cornerRadius(4)
                        }
                    }
                }
                .cornerRadius(12)
                .padding(4)
                .onAppear {
                    centerMapOnStops()
                }
            }
        }
        .background(Color(hex: manager.themeBgPrimary))
        .navigationTitle("Route")
    }

    private func centerMapOnStops() {
        let coords = stopsWithCoords.compactMap { stop -> CLLocationCoordinate2D? in
            guard let lat = stop.latitude, let lng = stop.longitude else { return nil }
            return CLLocationCoordinate2D(latitude: lat, longitude: lng)
        }
        guard !coords.isEmpty else { return }

        var minLat = coords[0].latitude
        var maxLat = coords[0].latitude
        var minLng = coords[0].longitude
        var maxLng = coords[0].longitude

        for coord in coords {
            if coord.latitude < minLat { minLat = coord.latitude }
            if coord.latitude > maxLat { maxLat = coord.latitude }
            if coord.longitude < minLng { minLng = coord.longitude }
            if coord.longitude > maxLng { maxLng = coord.longitude }
        }

        let centerLat = (minLat + maxLat) / 2.0
        let centerLng = (minLng + maxLng) / 2.0
        let deltaLat = max(0.015, (maxLat - minLat) * 1.6)
        let deltaLng = max(0.015, (maxLng - minLng) * 1.6)

        region = MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: centerLat, longitude: centerLng),
            span: MKCoordinateSpan(latitudeDelta: deltaLat, longitudeDelta: deltaLng)
        )
    }
}
