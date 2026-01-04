import WidgetKit
import SwiftUI

// MARK: - LifeSet Brand Colors
extension Color {
    static let lifesetBlue = Color(red: 0.306, green: 0.561, blue: 0.918) // #4e8fea
    static let lifesetBlueLight = Color(red: 0.38, green: 0.62, blue: 0.92)
    static let widgetBorder = Color(uiColor: .systemBackground) // Adapts to light/dark mode
}

// MARK: - Data Structures
struct HabitData: Codable, Identifiable {
    let id: String
    let name: String
    let completed: Bool
}

struct GoalData: Codable, Identifiable {
    let id: String
    let title: String
    let progress: Int
    let target: Int
    let percentage: Int
}

struct WidgetData: Codable {
    let userId: String
    let streak: Int
    let longestStreak: Int
    let todayCompletions: Int
    let todayTotal: Int
    let todayHabits: [HabitData]
    let activeGoals: [GoalData]
    let lastUpdated: String
}

// MARK: - Timeline Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let streak: Int
    let longestStreak: Int
    let todayCompletions: Int
    let todayTotal: Int
    let todayHabits: [HabitData]
    let activeGoals: [GoalData]
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            streak: 18,
            longestStreak: 25,
            todayCompletions: 3,
            todayTotal: 5,
            todayHabits: [
                HabitData(id: "1", name: "Morning Meditation", completed: true),
                HabitData(id: "2", name: "Exercise", completed: true),
                HabitData(id: "3", name: "Read 30 min", completed: true),
                HabitData(id: "4", name: "Journal", completed: false),
                HabitData(id: "5", name: "Water 8 glasses", completed: false),
            ],
            activeGoals: [
                GoalData(id: "1", title: "Build Morning Routine", progress: 45, target: 60, percentage: 75),
                GoalData(id: "2", title: "Get Fit", progress: 20, target: 30, percentage: 67),
            ]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = loadWidgetData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = loadWidgetData()
        
        // Update every hour, or when app updates data
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadWidgetData() -> SimpleEntry {
        // Load data from App Groups UserDefaults (ExtensionStorage stores as string)
        let sharedDefaults = UserDefaults(suiteName: "group.com.lifesetwellbeing.lifeset")
        
        // ExtensionStorage stores data as strings, not Data
        guard let jsonString = sharedDefaults?.string(forKey: "widgetData"),
              let jsonData = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            // Return placeholder if no data
            return SimpleEntry(
                date: Date(),
                streak: 0,
                longestStreak: 0,
                todayCompletions: 0,
                todayTotal: 0,
                todayHabits: [],
                activeGoals: []
            )
        }
        
        let streak = json["streak"] as? Int ?? 0
        let longestStreak = json["longestStreak"] as? Int ?? 0
        let todayCompletions = json["todayCompletions"] as? Int ?? 0
        let todayTotal = json["todayTotal"] as? Int ?? 0
        
        // Parse habits
        var habits: [HabitData] = []
        if let habitsArray = json["todayHabits"] as? [[String: Any]] {
            habits = habitsArray.compactMap { habitDict in
                guard let id = habitDict["id"] as? String,
                      let name = habitDict["name"] as? String,
                      let completed = habitDict["completed"] as? Bool else {
                    return nil
                }
                return HabitData(id: id, name: name, completed: completed)
            }
        }
        
        // Parse goals
        var goals: [GoalData] = []
        if let goalsArray = json["activeGoals"] as? [[String: Any]] {
            goals = goalsArray.compactMap { goalDict in
                guard let id = goalDict["id"] as? String,
                      let title = goalDict["title"] as? String,
                      let progress = goalDict["progress"] as? Int,
                      let target = goalDict["target"] as? Int,
                      let percentage = goalDict["percentage"] as? Int else {
                    return nil
                }
                return GoalData(id: id, title: title, progress: progress, target: target, percentage: percentage)
            }
        }
        
        return SimpleEntry(
            date: Date(),
            streak: streak,
            longestStreak: longestStreak,
            todayCompletions: todayCompletions,
            todayTotal: todayTotal,
            todayHabits: habits,
            activeGoals: goals
        )
    }
}

// MARK: - Widget Views

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(Color.widgetBorder, for: .widget)
        }
        .configurationDisplayName("LifeSet")
        .description("Track your habits, goals, and streak on your home screen and lock screen.")
        .supportedFamilies([
            .systemSmall, 
            .systemMedium, 
            .systemLarge,
            .accessoryRectangular,
            .accessoryCircular,
            .accessoryInline
        ])
    }
}

struct widgetEntryView: View {
    var entry: Provider.Entry
    
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        case .accessoryRectangular:
            LockScreenRectangularView(entry: entry)
        case .accessoryCircular:
            LockScreenCircularView(entry: entry)
        case .accessoryInline:
            LockScreenInlineView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget (2x2)
struct SmallWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        ZStack {
            Color.widgetBorder
                .ignoresSafeArea(.all)
                .clipShape(RoundedRectangle(cornerRadius: 0))
            
            VStack(spacing: 6) {
                HStack {
                    Text("🔥")
                        .font(.system(size: 24))
                    Text("\(entry.streak)")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(.primary)
                }
                
                Text("day streak")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
                
                Divider()
                    .background(Color.secondary.opacity(0.3))
                    .padding(.vertical, 4)
                
                VStack(spacing: 4) {
                    Text("\(entry.todayCompletions)/\(entry.todayTotal)")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                    
                    Text("habits today")
                        .font(.system(size: 11, weight: .regular))
                        .foregroundColor(.secondary)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            VStack {
                HStack {
                    Spacer()
                    Image(systemName: "arrow.right.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color.secondary.opacity(0.8))
                        .padding(.trailing, 12)
                        .padding(.top, 12)
                }
                Spacer()
            }
        }
        .widgetURL(URL(string: "lifeset://habits"))
    }
}

// MARK: - Medium Widget (4x2)
struct MediumWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        ZStack {
            Color.widgetBorder
                .ignoresSafeArea(.all)
                .clipShape(RoundedRectangle(cornerRadius: 0))
            
            VStack {
                HStack {
                    Spacer()
                    Image(systemName: "arrow.right.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color.secondary.opacity(0.8))
                        .padding(.trailing, 12)
                        .padding(.top, 12)
                }
                
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("🔥")
                                .font(.system(size: 28))
                            Text("\(entry.streak)")
                                .font(.system(size: 36, weight: .bold, design: .rounded))
                                .foregroundColor(.primary)
                        }
                        
                        Text("day streak")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.secondary)
                        
                        Text("\(entry.todayCompletions)/\(entry.todayTotal) today")
                            .font(.system(size: 12, weight: .regular))
                            .foregroundColor(.secondary)
                            .padding(.top, 2)
                    }
                    
                    Divider()
                        .background(Color.secondary.opacity(0.3))
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Today")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)
                        
                        ForEach(Array(entry.todayHabits.prefix(6).enumerated()), id: \.element.id) { _, habit in
                            HStack(spacing: 6) {
                                Image(systemName: habit.completed ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 14))
                                    .foregroundColor(habit.completed ? .green : .secondary)
                                
                                Text(habit.name)
                                    .font(.system(size: 12, weight: .regular))
                                    .foregroundColor(.primary)
                                    .lineLimit(1)
                            }
                        }
                    }
                }
                .padding(12)
                Spacer()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .widgetURL(URL(string: "lifeset://habits"))
    }
}

// MARK: - Large Widget (4x4)
struct LargeWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        ZStack {
            Color.widgetBorder
                .ignoresSafeArea(.all)
                .clipShape(RoundedRectangle(cornerRadius: 0))
            
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Spacer()
                    Image(systemName: "arrow.right.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color.secondary.opacity(0.8))
                        .padding(.trailing, 12)
                        .padding(.top, 12)
                }
                
                HStack {
                    Text("🔥")
                        .font(.system(size: 32))
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(entry.streak) day streak")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.primary)
                        Text("Best: \(entry.longestStreak) days")
                            .font(.system(size: 12, weight: .regular))
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Text("\(entry.todayCompletions)/\(entry.todayTotal)")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                }
                .padding(.horizontal, 12)
                
                Divider()
                    .background(Color.secondary.opacity(0.3))
                    .padding(.horizontal, 12)
                
                VStack(alignment: .leading, spacing: 6) {
                    Text("Today's Habits")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.secondary)
                    
                    ForEach(Array(entry.todayHabits.prefix(10).enumerated()), id: \.element.id) { _, habit in
                        HStack(spacing: 8) {
                            Image(systemName: habit.completed ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 16))
                                .foregroundColor(habit.completed ? .green : .secondary)
                            
                            Text(habit.name)
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.primary)
                            
                            Spacer()
                        }
                    }
                }
                .padding(.horizontal, 12)
                
                if !entry.activeGoals.isEmpty {
                    Divider()
                        .background(Color.secondary.opacity(0.3))
                        .padding(.horizontal, 12)
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Active Goals")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.secondary)
                        
                        ForEach(Array(entry.activeGoals.prefix(3).enumerated()), id: \.element.id) { _, goal in
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(goal.title)
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(.primary)
                                    Spacer()
                                    Text("\(goal.percentage)%")
                                        .font(.system(size: 12, weight: .semibold))
                                        .foregroundColor(.secondary)
                                }
                                
                                GeometryReader { geometry in
                                    ZStack(alignment: .leading) {
                                        Rectangle()
                                            .fill(Color.secondary.opacity(0.3))
                                            .frame(height: 10)
                                            .cornerRadius(5)
                                        
                                        Rectangle()
                                            .fill(Color.lifesetBlue)
                                            .frame(width: geometry.size.width * CGFloat(goal.percentage) / 100, height: 10)
                                            .cornerRadius(5)
                                    }
                                }
                                .frame(height: 10)
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                }
                Spacer()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetURL(URL(string: "lifeset://habits"))
    }
}

// MARK: - Lock Screen Widgets

struct LockScreenRectangularView: View {
    let entry: SimpleEntry
    
    var body: some View {
        HStack(spacing: 8) {
            Text("🔥")
                .font(.system(size: 16))
            Text("\(entry.streak) day streak")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.primary)
            Spacer()
            Text("\(entry.todayCompletions)/\(entry.todayTotal) habits")
                .font(.system(size: 12, weight: .regular))
                .foregroundColor(.secondary)
        }
        .widgetURL(URL(string: "lifeset://habits"))
    }
}

struct LockScreenCircularView: View {
    let entry: SimpleEntry
    
    var body: some View {
        Gauge(value: Double(entry.todayCompletions), in: 0...Double(max(entry.todayTotal, 1))) {
            Text("🔥")
                .font(.system(size: 12))
        } currentValueLabel: {
            Text("\(entry.streak)")
                .font(.system(size: 10, weight: .bold))
        }
        .tint(Color.lifesetBlue)
        .gaugeStyle(.accessoryCircular)
        .widgetURL(URL(string: "lifeset://habits"))
    }
}

struct LockScreenInlineView: View {
    let entry: SimpleEntry
    
    var body: some View {
        Label {
            Text("🔥 \(entry.streak) day streak • \(entry.todayCompletions)/\(entry.todayTotal) habits")
                .font(.system(size: 13, weight: .medium))
        } icon: {
            EmptyView()
        }
        .widgetURL(URL(string: "lifeset://habits"))
    }
}

#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(
        date: .now,
        streak: 18,
        longestStreak: 25,
        todayCompletions: 3,
        todayTotal: 5,
        todayHabits: [
            HabitData(id: "1", name: "Morning Meditation", completed: true),
            HabitData(id: "2", name: "Exercise", completed: true),
            HabitData(id: "3", name: "Read 30 min", completed: true),
        ],
        activeGoals: []
    )
}
