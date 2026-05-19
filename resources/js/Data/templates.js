import {
    FileText,
    Tag,
    CreditCard,
    Calendar,
    CheckSquare,
    Image as ImageIcon,
    BookOpen,
    Box,
} from "lucide-vue-next";

/**
 * Paper size presets in millimeters
 */
export const PAPER_SIZES = {
    A4: { width: 210, height: 297, label: "A4", unit: "mm" },
    A5: { width: 148, height: 210, label: "A5", unit: "mm" },
    A6: { width: 105, height: 148, label: "A6", unit: "mm" },
    Letter: { width: 216, height: 279, label: "Letter", unit: "mm" },
    F4: { width: 215, height: 330, label: "F4 (Folio)", unit: "mm" },
};

/**
 * Template & Category data store — all client-side, no database needed.
 */

export const CATEGORIES = [
    {
        id: "invoice",
        name: "Invoice & Kwitansi",
        slug: "invoice",
        description: "Template penagihan profesional dan bukti pembayaran.",
        icon: "FileText",
        iconComponent: FileText,
    },
    {
        id: "label",
        name: "Label & Barcode",
        slug: "label",
        description: "Label pengiriman, label harga, dan kode QR.",
        icon: "Tag",
        iconComponent: Tag,
    },
    {
        id: "kartu-nama",
        name: "Kartu Nama",
        slug: "kartu-nama",
        description: "Identitas profesional untuk networking dan branding.",
        icon: "CreditCard",
        iconComponent: CreditCard,
    },
    {
        id: "kalender-planner",
        name: "Kalender & Planner",
        slug: "kalender-planner",
        description: "Perencanaan harian, bulanan, dan tracker kebiasaan.",
        icon: "Calendar",
        iconComponent: Calendar,
    },
    {
        id: "daftar-hadir",
        name: "Absensi & Checklist",
        slug: "daftar-hadir",
        description: "Pencatatan kehadiran dan daftar tugas operasional.",
        icon: "CheckSquare",
        iconComponent: CheckSquare,
    },
    {
        id: "inventaris",
        name: "Laporan Inventaris",
        slug: "inventaris",
        description: "Pencatatan stok barang dan manajemen gudang.",
        icon: "Box",
        iconComponent: Box,
    },
    {
        id: "foto",
        name: "Pas Foto",
        slug: "foto",
        description: "Template cetak foto untuk kebutuhan identitas.",
        icon: "Image",
        iconComponent: ImageIcon,
    },
    {
        id: "edukasi",
        name: "Edukasi & Belajar",
        slug: "edukasi",
        description: "Materi belajar, flashcard, dan kertas khusus sekolah.",
        icon: "BookOpen",
        iconComponent: BookOpen,
    },
];

export const TEMPLATES = [
    // ═══════════════════════════════════════
    // BISNIS & LOGISTIK
    // ═══════════════════════════════════════
    {
        id: "label-pengiriman-10",
        name: "Label Pengiriman A4",
        slug: "label-pengiriman-10",
        description:
            "Layout 10 label pengiriman dalam satu lembar A4 dengan area barcode. Cocok untuk pengemasan produk massal.",
        categoryId: "bisnis-logistik",
        subcategoryId: "label-pengiriman",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 2,
        gridRows: 5,
        isFeatured: true,
        tags: ["label", "pengiriman", "shipping", "barcode"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Nama Pengirim",
                placeholder: "PT. Contoh Indonesia",
                fontSize: 9,
                fontWeight: "bold",
            },
            {
                type: "text",
                label: "Alamat",
                placeholder: "Jl. Contoh No.1, Jakarta",
                fontSize: 8,
            },
            { type: "divider" },
            {
                type: "text",
                label: "Kepada",
                placeholder: "Nama Penerima",
                fontSize: 9,
                fontWeight: "bold",
            },
            {
                type: "text",
                label: "Alamat Tujuan",
                placeholder: "Jl. Tujuan No.2, Bandung",
                fontSize: 8,
            },
            { type: "barcode", label: "No. Resi", value: "JKT2024001234" },
        ],
    },
    {
        id: "invoice-profesional",
        name: "Invoice Profesional",
        slug: "invoice-profesional",
        description:
            "Desain invoice profesional dengan tabel dinamis. Bisa mengatur jumlah baris item secara otomatis.",
        categoryId: "invoice",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 1,
        gridRows: 1,
        isFeatured: true,
        tags: ["invoice", "faktur", "bisnis", "tagihan"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "columns",
                colCount: 3,
                children: [
                    [
                        {
                            type: "text",
                            placeholder: "Alamat Perusahaan",
                            align: "left",
                            fontSize: 10,
                        },
                    ],
                    [
                        {
                            type: "text",
                            placeholder: "Nama Perusahaan",
                            align: "center",
                            fontWeight: "bold",
                            fontSize: 10,
                        },
                    ],
                    [
                        {
                            type: "text",
                            placeholder: "No. Telp Perusahaan",
                            align: "right",
                            fontSize: 10,
                        },
                    ],
                ],
            },
            { type: "divider", style: "transparent", height: 10 }, // Spacer
            {
                type: "columns",
                colCount: 2,
                colWidths: [2, 1],
                children: [
                    [
                        {
                            type: "text",
                            value: "INVOICE",
                            align: "left",
                            fontWeight: "bold",
                            fontSize: 16,
                        },
                    ],
                    [
                        {
                            type: "text",
                            value: "Kepada",
                            align: "left",
                            fontWeight: "bold",
                            fontSize: 12,
                        },
                    ],
                ],
            },
            {
                type: "columns",
                colCount: 2,
                colWidths: [2, 1],
                children: [
                    [
                        {
                            type: "text",
                            placeholder: "No. Invoice",
                            align: "left",
                            fontSize: 10,
                        },
                    ],
                    [
                        {
                            type: "text",
                            placeholder: "Nama Pelanggan",
                            align: "left",
                            fontSize: 10,
                        },
                    ],
                ],
            },
            {
                type: "columns",
                colCount: 2,
                colWidths: [2, 1],
                children: [
                    [
                        {
                            type: "text",
                            placeholder: "Tanggal Invoice",
                            align: "left",
                            fontSize: 10,
                        },
                    ],
                    [
                        {
                            type: "text",
                            placeholder: "Alamat Pelanggan",
                            align: "left",
                            fontSize: 10,
                        },
                    ],
                ],
            },
            {
                type: "columns",
                colCount: 2,
                colWidths: [2, 1],
                children: [
                    [{ type: "text", placeholder: "" }],
                    [
                        {
                            type: "text",
                            placeholder: "Kontak Pelanggan",
                            align: "left",
                            fontSize: 10,
                        },
                    ],
                ],
            },
            { type: "divider", style: "transparent", height: 6 }, // Spacer
            {
                type: "table",
                label: "Detail Item",
                columns: ["DESKRIPSI BARANG", "HARGA", "JUMLAH", "TOTAL"],
                rows: 4,
                summaryRows: ["SUBTOTAL", "PAJAK", "TOTAL BAYAR"],
            },
            { type: "divider", style: "transparent", height: 12 }, // Spacer
            { type: "text", value: "Info Pembayaran", fontSize: 10 },
            {
                type: "text",
                value: "[Nama bank] a.n. [Pemilik rekening] no. rek [...............]",
                fontSize: 10,
                fontWeight: "bold",
            },
        ],
    },
    {
        id: "kartu-nama-2x5",
        name: "Kartu Nama Standard",
        slug: "kartu-nama-2x5",
        description:
            "Grid 2x5 kartu nama profesional (90x53mm) dalam satu lembar A4. Desain 2 kolom dengan logo dan data diri.",
        categoryId: "kartu-nama",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 2,
        gridRows: 5,
        marginMm: 15, // This forces exactly 90mm width (210 - 30 = 180 / 2)
        gridGapMm: 0,
        isFeatured: true,
        tags: ["kartu nama", "business card", "name card"],
        previewColor: "#0F172A",
        widgets: [
            {
                type: "columns",
                label: "Layout Kartu Nama",
                colCount: 2,
                colWidths: [1.2, 2.5],
                gap: 4,
                childGap: 1.5,
                children: [
                    // Kiri: Logo/Foto
                    [
                        { type: "image", label: "Logo/Foto", fit: "contain" }
                    ],
                    // Kanan: Data Diri
                    [
                        { type: "divider", style: "transparent", height: 2 },
                        { type: "text", label: "Perusahaan", placeholder: "PT. NUSANTARA TECH", fontSize: 10, fontWeight: "800", color: "#0f172a", letterSpacing: 1 },
                        { type: "divider", style: "solid", color: "#e2e8f0", height: 3 },
                        { type: "text", label: "Nama", placeholder: "Ahmad Rasyid, S.Kom", fontSize: 12, fontWeight: "bold", color: "#1e293b" },
                        { type: "text", label: "Jabatan", placeholder: "Lead Software Engineer", fontSize: 8, fontWeight: "500", color: "#64748b" },
                        { type: "divider", style: "transparent", height: 4 },
                        { type: "text", label: "Telepon", placeholder: "📞 +62 812-3456-7890", fontSize: 7, color: "#334155" },
                        { type: "text", label: "Email", placeholder: "✉️ ahmad@nusantara.co.id", fontSize: 7, color: "#334155" },
                        { type: "text", label: "Website", placeholder: "🌐 www.nusantara.tech", fontSize: 7, color: "#334155" },
                        { type: "text", label: "Alamat", placeholder: "📍 Jl. Sudirman Kav. 21, Jakarta", fontSize: 7, color: "#334155" }
                    ]
                ]
            }
        ],
    },
    {
        id: "label-harga-grid",
        name: "Label Harga Produk",
        slug: "label-harga-grid",
        description:
            "Layout grid 3×7 label harga kecil dengan nama produk, harga, dan barcode.",
        categoryId: "label",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 3,
        gridRows: 7,
        isFeatured: false,
        tags: ["label harga", "price tag", "produk", "stiker"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Nama Produk",
                placeholder: "Kopi Arabica 250g",
                fontSize: 8,
                fontWeight: "bold",
            },
            {
                type: "text",
                label: "Harga",
                placeholder: "Rp 85.000",
                fontSize: 11,
                fontWeight: "bold",
            },
            {
                type: "barcode",
                label: "Barcode",
                value: "8991234567890",
                format: "EAN13",
            },
        ],
    },

    // ═══════════════════════════════════════
    // MANAJEMEN & DOKUMENTASI
    // ═══════════════════════════════════════
    {
        id: "jurnal-harian",
        name: "Jurnal Harian Bergaris",
        slug: "jurnal-harian",
        description:
            "Layout jurnal bergaris untuk pencatatan harian. Cocok untuk log kegiatan atau catatan pribadi.",
        categoryId: "edukasi",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 1,
        gridRows: 1,
        isFeatured: false,
        tags: ["jurnal", "diary", "log", "catatan"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Judul",
                placeholder: "Jurnal Harian",
                fontSize: 16,
                fontWeight: "bold",
            },
            {
                type: "text",
                label: "Tanggal",
                placeholder: "____/____/________",
                fontSize: 10,
            },
            {
                type: "lines",
                label: "Area Tulis",
                lineCount: 30,
                lineSpacing: 8,
            },
        ],
    },
    {
        id: "checklist-operasional",
        name: "Checklist Operasional",
        slug: "checklist-operasional",
        description:
            "Daftar periksa satu halaman untuk rutinitas harian, pengecekan sistem, atau jadwal perawatan.",
        categoryId: "daftar-hadir",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 1,
        gridRows: 1,
        isFeatured: true,
        tags: ["checklist", "periksa", "operasional", "maintenance"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Judul Checklist",
                placeholder: "Checklist Harian",
                fontSize: 16,
                fontWeight: "bold",
            },
            {
                type: "text",
                label: "Departemen",
                placeholder: "Dept. Operasional",
                fontSize: 10,
            },
            {
                type: "text",
                label: "Tanggal",
                placeholder: "____/____/________",
                fontSize: 10,
            },
            { type: "divider" },
            { type: "checklist", label: "Daftar Periksa", items: 20 },
        ],
    },
    {
        id: "laporan-inventaris",
        name: "Laporan Inventaris",
        slug: "laporan-inventaris",
        description:
            "Tabel bersih dengan kolom sisa stok, tanggal masuk, dan kondisi barang.",
        categoryId: "inventaris",
        paperSize: "A4",
        orientation: "landscape",
        gridCols: 1,
        gridRows: 1,
        isFeatured: false,
        tags: ["inventaris", "stok", "gudang", "inventory"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Judul",
                placeholder: "LAPORAN INVENTARIS",
                fontSize: 16,
                fontWeight: "bold",
                align: "center",
            },
            {
                type: "text",
                label: "Periode",
                placeholder: "Periode: Mei 2026",
                fontSize: 10,
                align: "center",
            },
            {
                type: "table",
                label: "Data Inventaris",
                columns: [
                    "No",
                    "Nama Barang",
                    "Kode",
                    "Stok",
                    "Satuan",
                    "Tgl Masuk",
                    "Kondisi",
                    "Keterangan",
                ],
                rows: 15,
            },
        ],
    },

    // ═══════════════════════════════════════
    // PERSONAL & KELUARGA
    // ═══════════════════════════════════════
    {
        id: "planner-bulanan",
        name: "Planner Bulanan",
        slug: "planner-bulanan",
        description:
            "Layout kalender bulanan yang customizable. Bisa memasukkan hari libur dan acara pribadi.",
        categoryId: "kalender-planner",
        paperSize: "A4",
        orientation: "landscape",
        gridCols: 1,
        gridRows: 1,
        isFeatured: true,
        defaultPages: 12,
        autoIncrementMonth: true,
        enableQuantity: false,
        enableGrid: false,
        tags: ["planner", "kalender", "bulanan", "monthly"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Judul Bulan",
                value: "{{month}} {{year}}",
                fontSize: 28,
                fontWeight: "bold",
                align: "center",
                color: "#1e293b",
            },
            {
                type: "calendar",
                label: "Kalender Bulanan",
                showDates: true,
                showHolidays: true,
                titleStyle: {
                    show: false,
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#1e293b",
                    align: "center",
                    marginBottom: 8,
                },
                headerStyle: {
                    fontSize: 10,
                    fontWeight: "bold",
                    color: "#1e293b",
                    bg: "#f1f5f9",
                    height: 10,
                },
                dateStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#334155",
                    bg: "#ffffff",
                    height: 25,
                },
                holidayStyle: {
                    color: "#be123c",
                    bg: "#fff1f2",
                    detailSize: 7,
                    detailColor: "#e11d48",
                    detailWeight: "bold",
                },
                holidayListStyle: {
                    show: true,
                    fontSize: 8,
                    color: "#1e293b",
                    fontWeight: "normal",
                },
                eventStyle: { show: true, color: "#a8a8a8", fontSize: 22 },
            },
        ],
    },
    {
        id: "planner-mingguan",
        name: "Planner Mingguan",
        slug: "planner-mingguan",
        description:
            "Layout planner mingguan dengan 7 kolom (Senin-Minggu) dan area catatan.",
        categoryId: "kalender-planner",
        paperSize: "A4",
        orientation: "landscape",
        gridCols: 1,
        gridRows: 1,
        isFeatured: false,
        tags: ["planner", "mingguan", "weekly"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Minggu ke-",
                placeholder: "Minggu ke-1, Mei 2026",
                fontSize: 14,
                fontWeight: "bold",
            },
            { type: "weekplanner", label: "Planner Mingguan" },
        ],
    },
    {
        id: "kartu-ucapan-a6",
        name: "Kartu Ucapan A6",
        slug: "kartu-ucapan-a6",
        description:
            "Desain kartu lipat A6 untuk merayakan momen keluarga. Print di A4, lipat jadi kartu.",
        categoryId: "edukasi",
        paperSize: "A4",
        orientation: "landscape",
        gridCols: 2,
        gridRows: 1,
        isFeatured: false,
        tags: ["kartu", "ucapan", "greeting", "milestone"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Judul",
                placeholder: "Selamat!",
                fontSize: 24,
                fontWeight: "bold",
                align: "center",
            },
            { type: "image", label: "Foto/Gambar" },
            {
                type: "text",
                label: "Pesan",
                placeholder: "Wishing you all the best...",
                fontSize: 12,
                align: "center",
            },
        ],
    },
    {
        id: "label-dapur",
        name: "Label Dapur Minimalis",
        slug: "label-dapur",
        description:
            "Label tipografi minimalis untuk wadah penyimpanan makanan dan perlengkapan dapur.",
        categoryId: "label",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 3,
        gridRows: 6,
        isFeatured: false,
        tags: ["label", "dapur", "kitchen", "storage", "jar"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Nama Item",
                placeholder: "Gula Pasir",
                fontSize: 12,
                fontWeight: "bold",
                align: "center",
            },
            {
                type: "text",
                label: "Keterangan",
                placeholder: "Exp: 12/2026",
                fontSize: 8,
                align: "center",
            },
        ],
    },
    {
        id: "photo-frame-classic",
        name: "Photo Frame Classic",
        slug: "photo-frame-classic",
        description:
            "Template bingkai foto klasik. Upload foto, masukkan ke bingkai, dan download sebagai PDF.",
        categoryId: "foto",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 1,
        gridRows: 1,
        isFeatured: true,
        tags: ["photo", "frame", "bingkai", "foto"],
        previewColor: "#DC2626",
        widgets: [
            { type: "image", label: "Upload Foto" },
            {
                type: "text",
                label: "Caption",
                placeholder: "Momen Berharga",
                fontSize: 12,
                align: "center",
            },
        ],
    },
    {
        id: "passport-photo-3x4",
        name: "Foto Passport 3x4",
        slug: "passport-photo-3x4",
        description:
            "Layout foto passport ukuran standar 3×4cm (2.8 x 3.8 cm).",
        categoryId: "foto",
        paperSize: "A4",
        orientation: "portrait",
        itemWidthMm: 27.9,
        itemHeightMm: 38.1,
        gridCols: 6,
        gridRows: 6,
        disableSync: true,
        isFeatured: true,
        tags: ["passport", "foto", "id", "3x4", "pas foto"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "image",
                label: "Upload Pas Foto",
                fit: "cover",
                aspectRatio: 2.79 / 3.81,
            },
        ],
    },
    {
        id: "passport-photo-4x6",
        name: "Foto Passport 4x6",
        slug: "passport-photo-4x6",
        description: "Layout foto passport ukuran standar 4×6cm (3.8 x 5.6 cm).",
        categoryId: "foto",
        paperSize: "A4",
        orientation: "portrait",
        itemWidthMm: 38.1,
        itemHeightMm: 55.9,
        gridCols: 4,
        gridRows: 4,
        disableSync: true,
        isFeatured: false,
        tags: ["passport", "foto", "id", "4x6"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "image",
                label: "Upload Pas Foto",
                fit: "cover",
                aspectRatio: 3.81 / 5.59,
            },
        ],
    },
    {
        id: "passport-photo-2x3",
        name: "Foto Passport 2x3",
        slug: "passport-photo-2x3",
        description: "Layout foto passport ukuran standar 2×3cm (2.2 x 2.8 cm).",
        categoryId: "foto",
        paperSize: "A4",
        orientation: "portrait",
        itemWidthMm: 21.6,
        itemHeightMm: 27.9,
        gridCols: 8,
        gridRows: 9,
        disableSync: true,
        isFeatured: false,
        tags: ["passport", "foto", "id", "2x3"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "image",
                label: "Upload Pas Foto",
                fit: "cover",
                aspectRatio: 2.16 / 2.79,
            },
        ],
    },
    {
        id: "polaroid-instax",
        name: "Polaroid / Instax Mini",
        slug: "polaroid-instax",
        description:
            "Template foto gaya Polaroid/Instax Mini. Print di A4 lalu potong.",
        categoryId: "foto",
        paperSize: "A4",
        orientation: "portrait",
        gridCols: 3,
        gridRows: 3,
        isFeatured: false,
        tags: ["polaroid", "instax", "foto", "retro"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "image",
                label: "Upload Foto",
                fit: "cover",
                aspectRatio: 3 / 4,
            },
            {
                type: "text",
                label: "Caption",
                placeholder: "memories ✨",
                fontSize: 10,
                align: "center",
            },
        ],
    },

    // ═══════════════════════════════════════
    // EDUKASI & KREATIF
    // ═══════════════════════════════════════
    {
        id: "flashcard-2x3",
        name: "Flashcard Belajar",
        slug: "flashcard-2x3",
        description:
            "Layout flashcard 2×3 per halaman. Sisi depan untuk pertanyaan/gambar, sisi belakang untuk jawaban.",
        categoryId: "edukasi",
        paperSize: "A4",
        orientation: "landscape",
        gridCols: 3,
        gridRows: 2,
        isFeatured: true,
        tags: ["flashcard", "belajar", "kartu", "edukasi"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Pertanyaan / Istilah",
                placeholder: "Apa itu Fotosintesis?",
                fontSize: 14,
                fontWeight: "bold",
                align: "center",
            },
            {
                type: "text",
                label: "Jawaban / Definisi",
                placeholder: "Proses tumbuhan mengubah...",
                fontSize: 10,
                align: "center",
            },
        ],
    },
    {
        id: "sertifikat-landscape",
        name: "Sertifikat Formal",
        slug: "sertifikat-landscape",
        description:
            "Layout sertifikat landscape dengan bingkai dekoratif. Teks bisa diganti secara dinamis.",
        categoryId: "edukasi",
        paperSize: "A4",
        orientation: "landscape",
        gridCols: 1,
        gridRows: 1,
        isFeatured: true,
        tags: ["sertifikat", "piagam", "certificate", "award"],
        previewColor: "#DC2626",
        widgets: [
            {
                type: "text",
                label: "Header",
                placeholder: "SERTIFIKAT",
                fontSize: 28,
                fontWeight: "bold",
                align: "center",
            },
            {
                type: "text",
                label: "Subtitle",
                placeholder: "Diberikan kepada:",
                fontSize: 12,
                align: "center",
            },
            {
                type: "text",
                label: "Nama Penerima",
                placeholder: "Nama Lengkap",
                fontSize: 22,
                fontWeight: "bold",
                align: "center",
            },
            {
                type: "text",
                label: "Deskripsi",
                placeholder: "Atas partisipasinya dalam kegiatan...",
                fontSize: 11,
                align: "center",
            },
            {
                type: "text",
                label: "Tempat & Tanggal",
                placeholder: "Jakarta, 13 Mei 2026",
                fontSize: 10,
                align: "center",
            },
            {
                type: "text",
                label: "Tanda Tangan",
                placeholder: "____________________",
                fontSize: 10,
                align: "center",
            },
            {
                type: "text",
                label: "Nama Penandatangan",
                placeholder: "Dr. Nama Pejabat",
                fontSize: 10,
                align: "center",
            },
        ],
    },
];

/**
 * Get all categories
 */
export function getCategories() {
    return CATEGORIES;
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug) {
    return CATEGORIES.find((c) => c.slug === slug) || null;
}

/**
 * Get all templates
 */
export function getTemplates() {
    return TEMPLATES;
}

/**
 * Get template by slug
 */
export function getTemplateBySlug(slug) {
    return TEMPLATES.find((t) => t.slug === slug) || null;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(categoryId) {
    return TEMPLATES.filter((t) => t.categoryId === categoryId);
}

/**
 * Get templates by subcategory
 */
export function getTemplatesBySubcategory(subcategoryId) {
    return [];
}

/**
 * Get featured templates
 */
export function getFeaturedTemplates() {
    return TEMPLATES.filter((t) => t.isFeatured);
}

/**
 * Search templates
 */
export function searchTemplates(query) {
    const q = query.toLowerCase().trim();
    if (!q) return TEMPLATES;

    return TEMPLATES.filter((t) => {
        return (
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.includes(q))
        );
    });
}
