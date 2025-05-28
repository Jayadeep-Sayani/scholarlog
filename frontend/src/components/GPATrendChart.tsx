import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"


type Props = {
    data: { course: string; gpa: number; createdAt: string }[],
    gpaScale: number
}

export default function GpaTrendChart({ data, gpaScale }: Props) {

    return (
        <div className="bg-white rounded-xl shadow p-4 w-full max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold">
                GPA Trend (Scale {gpaScale})
            </h2>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
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
                        type="monotone"
                        dataKey="gpa"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>

    )
}


