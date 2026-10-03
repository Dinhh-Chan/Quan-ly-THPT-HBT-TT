/** Loại sự việc */
export enum IncidentType {
    HUT_THUOC = "HUT_THUOC",
    DANH_NHAU = "DANH_NHAU",
    VO_LE = "VO_LE",
    PHA_TAI_SAN = "PHA_TAI_SAN",
    ATGT = "ATGT",
    TAI_NAN = "TAI_NAN",
    KHAC = "KHAC",
}

/** Mức độ */
export enum IncidentSeverity {
    KHAN_CAP = "KHAN_CAP",
    THONG_THUONG = "THONG_THUONG",
}

/** Vòng đời sự việc */
export enum IncidentStatus {
    MOI = "MOI",
    DA_TIEP_NHAN = "DA_TIEP_NHAN",
    DA_XAC_MINH = "DA_XAC_MINH",
    DA_XU_LY = "DA_XU_LY",
}

/** Kết quả xác minh */
export enum VerifyResult {
    VI_PHAM = "VI_PHAM",
    KHONG_VI_PHAM = "KHONG_VI_PHAM",
}
