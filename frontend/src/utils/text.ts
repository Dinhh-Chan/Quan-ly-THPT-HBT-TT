/** Bỏ dấu tiếng Việt, chữ thường: "Nguyễn Thị Hà" -> "nguyen thi ha" */
export const removeAccent = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

/**
 * Điểm khớp tên với từ khóa (đã bỏ dấu). 0 = không khớp.
 * Ưu tiên: khớp đúng có dấu > tên gọi bắt đầu bằng từ khóa > họ đệm bắt đầu bằng từ khóa > chứa chuỗi.
 * Gõ "h" sẽ ra mọi bạn có một từ bắt đầu bằng H; "ha" ra "Hà".
 */
export const matchNameScore = (fullname: string, keyword: string) => {
    const kw = removeAccent(keyword);
    if (!kw) return 0;
    const name = removeAccent(fullname);
    const words = name.split(" ");
    const given = words[words.length - 1];
    const kwWords = kw.split(" ");
    let score = 0;

    if (kwWords.length === 1) {
        if (given.startsWith(kw)) score = given === kw ? 100 : 80;
        else if (words.some((w) => w.startsWith(kw))) score = 50;
        else if (name.includes(kw)) score = 20;
    } else {
        // Nhiều từ: mọi từ khóa phải là tiền tố của một từ trong tên theo đúng thứ tự
        let idx = 0;
        for (const w of words) {
            if (idx < kwWords.length && w.startsWith(kwWords[idx])) idx++;
        }
        if (idx === kwWords.length) score = name.endsWith(kw) ? 90 : 60;
        else if (name.includes(kw)) score = 20;
    }
    // Gõ có dấu và khớp đúng dấu thì xếp trên
    if (score && fullname.toLowerCase().includes(keyword.toLowerCase().trim())) score += 5;
    return score;
};

export function searchByName<T extends { fullname: string }>(
    items: T[],
    keyword: string,
    limit = 20,
): T[] {
    if (!keyword.trim()) return [];
    return items
        .map((item) => ({ item, score: matchNameScore(item.fullname, keyword) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || a.item.fullname.localeCompare(b.item.fullname, "vi"))
        .slice(0, limit)
        .map((x) => x.item);
}

/** Đọc số chấp nhận cả dấu phẩy và dấu chấm thập phân */
export const parseDecimal = (v: string | number | null | undefined): number | null => {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number") return v;
    const n = Number(v.replace(",", ".").trim());
    return Number.isFinite(n) ? n : null;
};
