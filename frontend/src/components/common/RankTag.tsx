import { Tag } from "antd";
import { RANK_COLOR, RANK_LABEL } from "@/constants";
import type { Rank } from "@/types";

export default function RankTag({ rank, full }: { rank: Rank; full?: boolean }) {
    return <Tag color={RANK_COLOR[rank]}>{full ? RANK_LABEL[rank] : rank}</Tag>;
}
