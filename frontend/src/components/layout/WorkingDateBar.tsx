import { DatePicker, Flex, Tag, Tooltip, Typography, Button } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useWorkingWeek } from "@/hooks/useData";
import { useWorkingDate } from "@/stores/workingDate";
import { todayStr, WEEKDAY_LABEL } from "@/utils/date";

/** Ngày làm việc dùng chung cho mọi màn hình; đổi màu khi khác hôm nay để tránh nhập nhầm */
export default function WorkingDateBar({ compact }: { compact?: boolean }) {
    const { date, setDate, resetToday } = useWorkingDate();
    const { week, isLocked } = useWorkingWeek();
    const notToday = date !== todayStr();
    return (
        <Flex
            align="center"
            gap={8}
            wrap
            style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: notToday ? "#fff1b8" : "transparent",
                border: notToday ? "1px solid #faad14" : "1px solid transparent",
            }}
        >
            {notToday && (
                <Tooltip title="Đang làm việc trên ngày khác hôm nay">
                    <WarningOutlined style={{ color: "#d48806" }} />
                </Tooltip>
            )}
            <DatePicker
                value={dayjs(date)}
                format={(d) => `${WEEKDAY_LABEL[d.day()]}, ${d.format("DD/MM/YYYY")}`}
                allowClear={false}
                onChange={(d) => d && setDate(d.format("YYYY-MM-DD"))}
                style={{ width: compact ? 180 : 210 }}
            />
            {!compact && (
                <Typography.Text strong>
                    {week ? `Tuần ${week.weekNo} – Học kỳ ${week.semester}` : "Ngoài năm học"}
                </Typography.Text>
            )}
            {isLocked && <Tag color="purple">Đã chốt</Tag>}
            {notToday && (
                <Button size="small" onClick={resetToday}>
                    Về hôm nay
                </Button>
            )}
        </Flex>
    );
}
