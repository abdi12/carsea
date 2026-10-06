import type { Locale } from "@/i18n/config";

import type { Article } from "./types";

// DRAFT legal copy. It describes what the software does today, but it has
// not been reviewed for the operating entity or Indonesian requirements
// (SPEC §5, §15). Both pages display a notice saying so.

const UPDATED = "2026-10-06";

export const privacy: Record<Locale, Article> = {
  id: {
    slug: "privacy",
    title: "Privasi",
    summary: "Apa yang disimpan Carsea, di mana, dan apa yang tidak kami kumpulkan.",
    updated: UPDATED,
    sections: [
      {
        heading: "Tanpa akun",
        paragraphs: [
          "Carsea tidak memiliki pendaftaran atau akun. Kami tidak meminta nama, alamat email, nomor telepon, atau lokasi persis Anda.",
        ],
      },
      {
        heading: "Yang disimpan di peramban Anda",
        paragraphs: ["Data berikut disimpan hanya di peramban Anda dan tidak dikirim kepada kami:"],
        list: [
          "jawaban Anda pada pencari mobil,",
          "mobil yang Anda bandingkan,",
          "mobil yang Anda simpan,",
          "pilihan tema terang atau gelap.",
        ],
      },
      {
        heading: "Cookie bahasa",
        paragraphs: [
          "Saat Anda mengganti bahasa, satu cookie menyimpan pilihan itu agar kunjungan berikutnya dibuka dalam bahasa yang sama. Cookie ini tidak mengidentifikasi Anda.",
        ],
      },
      {
        heading: "Yang dikirim ke server",
        paragraphs: [
          "Halaman perbandingan meminta data mobil dari server dengan menyebut kode mobil yang Anda pilih. Permintaan itu tidak memuat jawaban pencari Anda. Seperti situs web lain, server mencatat permintaan teknis seperti alamat halaman dan waktu.",
        ],
      },
      {
        heading: "Analitik",
        paragraphs: [
          "Carsea saat ini tidak memasang analitik. Jika nanti dipasang, analitik itu akan bersifat agregat dan tanpa cookie, dan tidak akan memuat jawaban atau identitas Anda.",
        ],
      },
      {
        heading: "Menghapus data Anda",
        paragraphs: [
          "Anda bisa menghapus jawaban pencari dari halaman pencari, serta perbandingan dan daftar tersimpan dari halaman bandingkan. Menghapus data situs di peramban juga menghapus semuanya.",
        ],
      },
    ],
  },
  en: {
    slug: "privacy",
    title: "Privacy",
    summary: "What Carsea stores, where, and what we do not collect.",
    updated: UPDATED,
    sections: [
      {
        heading: "No accounts",
        paragraphs: [
          "Carsea has no registration or accounts. We do not ask for your name, email address, phone number, or precise location.",
        ],
      },
      {
        heading: "What is stored in your browser",
        paragraphs: ["The following is stored only in your browser and is not sent to us:"],
        list: [
          "your answers in the car finder,",
          "the cars you are comparing,",
          "the cars you have saved,",
          "your light or dark theme choice.",
        ],
      },
      {
        heading: "Language cookie",
        paragraphs: [
          "When you switch language, one cookie remembers the choice so your next visit opens in the same language. It does not identify you.",
        ],
      },
      {
        heading: "What is sent to the server",
        paragraphs: [
          "The comparison page asks the server for car data by naming the codes of the cars you chose. That request does not contain your finder answers. Like any website, the server records technical requests such as the page address and time.",
        ],
      },
      {
        heading: "Analytics",
        paragraphs: [
          "Carsea does not currently run analytics. If it is added later, it will be aggregate and cookieless, and will not contain your answers or identity.",
        ],
      },
      {
        heading: "Deleting your data",
        paragraphs: [
          "You can clear your finder answers on the finder page, and the comparison and saved list on the compare page. Clearing site data in your browser removes everything as well.",
        ],
      },
    ],
  },
};

export const terms: Record<Locale, Article> = {
  id: {
    slug: "terms",
    title: "Ketentuan",
    summary: "Batasan informasi yang disajikan Carsea.",
    updated: UPDATED,
    sections: [
      {
        heading: "Layanan riset, bukan penjual",
        paragraphs: [
          "Carsea adalah layanan riset. Carsea tidak menjual mobil, tidak menjadi perantara dealer, dan tidak memberikan penawaran harga.",
        ],
      },
      {
        heading: "Harga dan perkiraan",
        paragraphs: [
          "Harga yang ditampilkan berasal dari sumber yang disebutkan dan berlaku untuk wilayah dan tanggal yang tertera. Harga di dealer bisa berbeda.",
          "Perkiraan biaya bulanan adalah hasil perhitungan dari asumsi yang ditampilkan. Perkiraan itu bukan penawaran, tagihan, atau jaminan.",
        ],
      },
      {
        heading: "Kelengkapan data",
        paragraphs: [
          "Kami berusaha menjaga data tetap benar dan menandai data yang sudah lama atau belum ada. Katalog tidak memuat semua mobil, dan pabrikan dapat mengubah harga atau perlengkapan kapan saja. Periksa kembali kepada sumber resmi sebelum membeli.",
        ],
      },
      {
        heading: "Sumber dan gambar",
        paragraphs: [
          "Nama merek dan model adalah milik pemiliknya masing-masing dan dipakai untuk mengidentifikasi kendaraan. Sumber tiap fakta dicantumkan di halaman mobil.",
        ],
      },
    ],
  },
  en: {
    slug: "terms",
    title: "Terms",
    summary: "The limits of the information Carsea presents.",
    updated: UPDATED,
    sections: [
      {
        heading: "A research service, not a seller",
        paragraphs: [
          "Carsea is a research service. It does not sell cars, act for dealers, or give price quotes.",
        ],
      },
      {
        heading: "Prices and estimates",
        paragraphs: [
          "Prices shown come from the sources named and apply to the region and date stated. A dealer's price may differ.",
          "Monthly cost estimates are calculated from the assumptions shown. They are not quotes, bills, or guarantees.",
        ],
      },
      {
        heading: "Completeness of data",
        paragraphs: [
          "We work to keep data correct and to mark data that is old or missing. The catalog does not hold every car, and manufacturers can change prices or equipment at any time. Check with the official source before you buy.",
        ],
      },
      {
        heading: "Sources and images",
        paragraphs: [
          "Brand and model names belong to their owners and are used to identify vehicles. The source of each fact is listed on the car's page.",
        ],
      },
    ],
  },
};
