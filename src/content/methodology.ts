import { MAX_MATCHES, MAX_PRIORITIES, MIN_MATCHES } from "@/domain/matching";
import { DEFAULT_MONTHLY_KM } from "@/domain/ownership-cost";
import { freshnessDays } from "@/domain/provenance";
import type { Locale } from "@/i18n/config";

import type { Article } from "./types";

// "How Carsea compares" (SPEC §5). The numbers below are read from the
// rules themselves, so this page cannot drift away from what the code does.

const f = freshnessDays;

export const methodology: Record<Locale, Article> = {
  id: {
    slug: "how-we-compare",
    title: "Cara Carsea membandingkan",
    summary: "Aturan pencocokan, cara menghitung biaya, asal data, dan apa yang kami lakukan saat data tidak ada.",
    updated: "2026-10-06",
    sections: [
      {
        id: "matching",
        heading: "Cara rekomendasi dipilih",
        paragraphs: [
          "Rekomendasi dibuat dengan aturan tetap dari jawaban Anda dan data katalog. Tidak ada AI, tidak ada skor tersembunyi, dan tidak ada angka kecocokan.",
          "Pencocokan dijalankan di peramban Anda. Jawaban Anda tidak dikirim ke server kami.",
          "Sebuah mobil tidak direkomendasikan jika:",
        ],
        list: [
          "tidak memiliki harga yang masih berlaku,",
          "harganya di atas batas anggaran Anda, atau",
          "jumlah kursinya diketahui lebih sedikit dari yang Anda butuhkan.",
        ],
      },
      {
        id: "order",
        heading: "Urutan rekomendasi",
        paragraphs: [
          "Setiap jawaban Anda menjadi satu alasan untuk tiap mobil: cocok, kompromi, atau belum bisa dinilai. Mobil lalu diurutkan dengan perbandingan berikut, dari yang paling menentukan:",
        ],
        list: [
          "kompromi yang lebih sedikit,",
          `lebih banyak prioritas Anda yang terpenuhi (Anda memilih paling banyak ${MAX_PRIORITIES}),`,
          "lebih sedikit alasan yang belum bisa dinilai,",
          "harga yang lebih rendah.",
        ],
      },
      {
        heading: "Prioritas dan penggunaan",
        paragraphs: [
          "Prioritas seperti biaya jalan rendah, keselamatan, atau ruang dinilai secara relatif: sebuah mobil memenuhinya jika nilainya sama dengan atau lebih baik dari nilai tengah mobil lain yang lolos syarat anggaran dan kursi Anda.",
          "Pilihan jenis mesin adalah preferensi. Mobil dengan jenis mesin lain tetap bisa muncul, dan ditandai sebagai kompromi.",
          `Kami menampilkan paling banyak ${MAX_MATCHES} mobil. Jika kurang dari ${MIN_MATCHES} yang memenuhi syarat, kami mengatakannya dan tidak menambah mobil yang tidak cocok.`,
        ],
      },
      {
        heading: "Independensi",
        paragraphs: [
          "Merek, dealer, sponsor, dan hubungan komersial bukan masukan dalam aturan pencocokan, sehingga tidak dapat memengaruhi urutan. Carsea tidak menerima pembayaran untuk penempatan dan tidak meneruskan data pembeli ke dealer.",
        ],
      },
      {
        id: "value",
        heading: "Fitur dibanding harga",
        paragraphs: [
          "Kami menampilkan perlengkapan per kelompok di samping harga varian yang sama. Hanya fitur standar yang dihitung sebagai bagian dari harga. Fitur tanpa sumber ditampilkan sebagai belum diketahui, bukan sebagai tidak tersedia. Tidak ada skor nilai tunggal.",
        ],
      },
      {
        id: "cost",
        heading: "Perkiraan biaya bulanan",
        paragraphs: [
          `Jarak tempuh awal yang kami pakai adalah ${DEFAULT_MONTHLY_KM.toLocaleString("id-ID")} km per bulan. Ini asumsi awal yang bisa Anda ubah.`,
        ],
        list: [
          "BBM: jarak dibagi konsumsi (km per liter), dikali harga BBM per liter untuk jenis BBM varian itu.",
          "Listrik: jarak dikali konsumsi (kWh per 100 km), dikali tarif listrik per kWh.",
          "Servis berkala, pajak, dan asuransi: angka tahunan dibagi dua belas.",
        ],
      },
      {
        heading: "Yang tidak termasuk dalam biaya",
        paragraphs: [
          "Harga beli, cicilan, bunga, penyusutan, nilai jual kembali, parkir, tol, dan perbaikan di luar servis berkala tidak dihitung. Jika sebuah komponen tidak punya data, komponen itu ditampilkan sebagai belum tersedia dan jumlahnya disebut subtotal.",
        ],
      },
      {
        id: "sources",
        heading: "Sumber dan tanggal pemeriksaan",
        paragraphs: [
          "Setiap fakta dicatat dengan sumber dan tanggal terakhir kami memeriksanya. Pencatatan dilakukan per fakta, sehingga harga yang baru diperiksa tidak membuat spesifikasi terlihat ikut diperiksa.",
          "Fakta dianggap perlu diperiksa ulang setelah:",
        ],
        list: [
          `harga: ${f.price} hari,`,
          `harga BBM dan listrik: ${f.energy_price} hari,`,
          `bengkel resmi: ${f.service_center} hari,`,
          `garansi dan angka biaya: ${f.warranty} hari,`,
          `spesifikasi dan fitur: ${f.specification} hari.`,
        ],
      },
      {
        heading: "Saat data tidak ada atau sudah lama",
        paragraphs: [
          "Mobil tanpa harga yang masih berlaku tidak direkomendasikan. Spesifikasi yang sudah lama diperlakukan sebagai belum diketahui saat pencocokan, dan ditandai di halaman mobil. Data yang tidak ada tidak dianggap baik maupun buruk: kami menyebutnya belum bisa dinilai.",
        ],
      },
      {
        heading: "Cakupan",
        paragraphs: [
          "Harga dan bengkel yang ditampilkan berlaku untuk Jakarta dan sekitarnya. Katalog hanya memuat mobil yang datanya lolos pemeriksaan kami, sehingga tidak semua mobil yang dijual di Indonesia ada di sini.",
        ],
      },
    ],
  },
  en: {
    slug: "how-we-compare",
    title: "How Carsea compares",
    summary: "The matching rules, how costs are calculated, where data comes from, and what we do when data is missing.",
    updated: "2026-10-06",
    sections: [
      {
        id: "matching",
        heading: "How recommendations are chosen",
        paragraphs: [
          "Recommendations come from fixed rules applied to your answers and the catalog. There is no AI, no hidden score, and no fit number.",
          "Matching runs in your browser. Your answers are not sent to our server.",
          "A car is not recommended if:",
        ],
        list: [
          "it has no price that is still current,",
          "its price is above your budget ceiling, or",
          "it is known to have fewer seats than you need.",
        ],
      },
      {
        id: "order",
        heading: "The order of recommendations",
        paragraphs: [
          "Each answer you give becomes one reason for each car: a fit, a compromise, or not yet assessable. Cars are then ordered by this comparison, most decisive first:",
        ],
        list: [
          "fewer compromises,",
          `more of your priorities met (you choose up to ${MAX_PRIORITIES}),`,
          "fewer reasons that could not be assessed,",
          "a lower price.",
        ],
      },
      {
        heading: "Priorities and use",
        paragraphs: [
          "Priorities such as low running cost, safety, or space are judged relatively: a car meets one if its value is equal to or better than the median of the other cars that pass your budget and seat requirements.",
          "A powertrain choice is a preference. Cars with another powertrain can still appear, marked as a compromise.",
          `We show at most ${MAX_MATCHES} cars. If fewer than ${MIN_MATCHES} qualify, we say so and do not pad the list with cars that do not fit.`,
        ],
      },
      {
        heading: "Independence",
        paragraphs: [
          "Brand, dealer, sponsor, and commercial relationship are not inputs to the matching rules, so they cannot affect the order. Carsea accepts no payment for placement and does not pass buyer data to dealers.",
        ],
      },
      {
        id: "value",
        heading: "Features for the price",
        paragraphs: [
          "We show equipment by group next to the price of the same variant. Only standard features count as part of the price. A feature with no source is shown as unknown, not as unavailable. There is no single value score.",
        ],
      },
      {
        id: "cost",
        heading: "The monthly cost estimate",
        paragraphs: [
          `The starting distance we use is ${DEFAULT_MONTHLY_KM.toLocaleString("en-US")} km a month. It is a starting assumption that you can change.`,
        ],
        list: [
          "Fuel: distance divided by consumption (km per litre), times the price per litre of that variant's fuel grade.",
          "Electricity: distance times consumption (kWh per 100 km), times the tariff per kWh.",
          "Scheduled servicing, tax, and insurance: the annual figure divided by twelve.",
        ],
      },
      {
        heading: "What the cost leaves out",
        paragraphs: [
          "Purchase price, instalments, interest, depreciation, resale value, parking, tolls, and repairs outside scheduled servicing are not counted. If a component has no data it is shown as not available and the amount is called a subtotal.",
        ],
      },
      {
        id: "sources",
        heading: "Sources and checking dates",
        paragraphs: [
          "Every fact is recorded with its source and the date we last checked it. Recording is per fact, so a freshly checked price does not make a specification look checked.",
          "A fact is treated as needing a re-check after:",
        ],
        list: [
          `price: ${f.price} days,`,
          `fuel and electricity prices: ${f.energy_price} days,`,
          `service centres: ${f.service_center} days,`,
          `warranty and cost figures: ${f.warranty} days,`,
          `specifications and features: ${f.specification} days.`,
        ],
      },
      {
        heading: "When data is missing or old",
        paragraphs: [
          "A car without a current price is not recommended. An old specification is treated as unknown when matching and is marked on the car's page. Missing data counts neither for nor against a car: we call it not yet assessable.",
        ],
      },
      {
        heading: "Coverage",
        paragraphs: [
          "The prices and service centres shown apply to Greater Jakarta. The catalog holds only cars whose data passes our checks, so not every car sold in Indonesia is here.",
        ],
      },
    ],
  },
};
