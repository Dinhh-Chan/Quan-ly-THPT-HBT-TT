/** Nhận diện THPT Hai Bà Trưng – Thạch Thất. Màu lấy từ logo trường. */
export const BRAND = {
    /** Cơ quan chủ quản – dòng trên cùng của tiêu đề */
    authority: "Sở Giáo dục và Đào tạo Hà Nội",
    schoolName: "Trường THPT Hai Bà Trưng",
    district: "Thạch Thất",
    fullName: "Trường THPT Hai Bà Trưng - Thạch Thất",
    appName: "Nền nếp & Thi đua",
    founded: "7-2002",
    logo: "/brand/logo.png",
    logoSmall: "/brand/logo-96.png",
    photos: {
        building: "/brand/school-building.webp",
        assembly: "/brand/school-assembly.webp",
        students: "/brand/school-students.webp",
        yard: "/brand/school-yard.webp",
    },
    colors: {
        /** Nền xanh của logo */
        blue: "#0052E0",
        blueDark: "#0A2F86",
        /** Dải chữ tên trường */
        green: "#17A707",
        red: "#E8003A",
        orange: "#F56A0C",
        magenta: "#D6247A",
    },
} as const;
