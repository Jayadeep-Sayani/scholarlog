import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useMemo } from "react"

type Props = {
    data: { course: string; gpa: number; createdAt: string }[],
    gpaScale: number
}

export default function GpaTrendChart({ data, gpaScale }: Props) {
    // Generate sample data when there are 0 or 1 courses
    const chartData = useMemo(() => {
        if (data.length > 1) {
            return data; // Use actual data if we have more than 1 course
        }
        
        // Create sample data for demonstration when 0 or 1 courses exist
        const sampleData = [];
        
        // If we have 1 course, include it in the sample data
        if (data.length === 1) {
            sampleData.push(data[0]);
        }
        
        // Add sample courses to show a trend
        const sampleCourses = [
            { course: "Sample Course 1", gpa: gpaScale * 0.8, createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
            { course: "Sample Course 2", gpa: gpaScale * 0.7, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
            { course: "Sample Course 3", gpa: gpaScale * 0.85, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        ];
        
        // Only add sample courses if we have 0 actual courses
        if (data.length === 0) {
            return sampleCourses;
        } else {
            // If we have 1 course, add some sample courses after it
            return [...sampleData, ...sampleCourses.slice(1)];
        }
    }, [data, gpaScale]);

    return (
        <div className="bg-white rounded-xl shadow p-4 w-full max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold">
                GPA Trend (Scale {gpaScale})
            </h2>

            <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis
                            dataKey="course"
                            stroke="#888"
                            tick={{ fill: "var(--text-muted)" }}
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            domain={[0, gpaScale]}
                            stroke="#888"
                            tick={{ fill: "var(--text-muted)" }}
                            style={{ fontSize: "12px" }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                            labelStyle={{ color: "#333", fontWeight: 500 }}
                        />
                        <Line
                            dataKey="gpa"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
                
                {data.length <= 1 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white rounded-md">
                        <div className="text-center p-4 max-w-xs">
                            <p className="text-lg font-semibold mb-2">Sample Chart</p>
                            <p className="text-sm">Add at least 2 completed courses to view your actual GPA trendline</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


