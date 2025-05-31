import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useMemo } from "react"

type Props = {
    data: { course: string; gpa: number; createdAt: string }[]
}

export default function GpaTrendChart({ data }: Props) {
    // Generate sample data when there are 0 or 1 courses
    const chartData = useMemo(() => {
        if (data.length > 1) {
            return data; // Use actual data if we have more than 1 course
        }
        
        // Always use sample data for demonstration when fewer than 2 courses exist
        // Add sample courses to show a trend
        const sampleCourses = [
            { course: "Sample Course 1", gpa: 3.2, createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
            { course: "Sample Course 2", gpa: 2.8, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
            { course: "Sample Course 3", gpa: 3.4, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
            { course: "Sample Course 4", gpa: 3.6, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        ];
        
        // Always return only sample courses when fewer than 2 real courses
        return sampleCourses;
    }, [data]);

    return (
        <div className="bg-white rounded-xl shadow p-4 w-full">
            <h2 className="text-lg font-semibold">
                GPA Trend (9.0 Scale)
            </h2>

            <div className="relative">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis
                            dataKey="course"
                            stroke="#888"
                            tick={{ fill: "var(--text-muted)" }}
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            domain={[0, 9.0]}
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
                
                {data.length < 2 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white rounded-md">
                        <div className="text-center p-4 max-w-xs">
                            <p className="text-sm font-medium">Add at least 2 completed courses to view your actual GPA trendline</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


