import type { Locale } from "@/i18n/config";

import type { Article } from "./types";

// Buying guides (SPEC §8). General guidance only: nothing here states a
// fact about a particular vehicle, price, or tax rate.

const UPDATED = "2026-10-06";

export const guides: Record<Locale, Article[]> = {
  id: [
    {
      slug: "budget-and-otr-price",
      title: "Anggaran dan harga OTR",
      summary: "Apa yang biasanya termasuk dalam harga on-the-road, apa yang tidak, dan cara menyusun anggaran yang realistis.",
      updated: UPDATED,
      sections: [
        {
          heading: "Apa itu harga OTR",
          paragraphs: [
            "Harga on-the-road (OTR) adalah harga mobil yang sudah siap dipakai di jalan. Selain harga kendaraan, harga ini biasanya sudah mencakup biaya pendaftaran kendaraan baru.",
            "Harga OTR berlaku untuk wilayah tertentu. Harga OTR Jakarta bisa berbeda dari kota lain karena biaya pendaftarannya berbeda. Carsea menampilkan harga untuk Jakarta dan sekitarnya.",
          ],
        },
        {
          heading: "Yang biasanya termasuk",
          list: [
            "Harga kendaraan dari pabrikan atau distributor.",
            "Bea balik nama kendaraan baru (BBN-KB).",
            "Pajak kendaraan bermotor (PKB) tahun pertama.",
            "SWDKLLJ, yaitu sumbangan wajib kecelakaan lalu lintas.",
            "Biaya administrasi STNK, pelat nomor, dan BPKB.",
          ],
        },
        {
          heading: "Yang biasanya tidak termasuk",
          list: [
            "Asuransi kendaraan.",
            "Aksesori dan paket tambahan dari dealer.",
            "Perpanjangan garansi atau paket servis berbayar.",
            "Bunga dan biaya jika Anda membeli secara kredit.",
          ],
          after: [
            "Rinciannya bisa berbeda antar merek dan dealer. Mintalah rincian tertulis sebelum membayar, dan periksa apakah harga yang ditawarkan sama dengan harga OTR resmi.",
          ],
        },
        {
          heading: "Menyusun anggaran",
          paragraphs: [
            "Tentukan batas atas harga OTR terlebih dahulu, lalu sisihkan dana terpisah untuk asuransi tahun pertama dan biaya bulanan. Harga beli dibayar sekali; biaya kepemilikan datang setiap bulan selama Anda memiliki mobil itu.",
            "Carsea sengaja memisahkan keduanya. Harga OTR tidak pernah digabung dengan perkiraan biaya bulanan.",
          ],
        },
      ],
    },
    {
      slug: "features-for-the-price",
      title: "Fitur dibanding harga",
      summary: "Cara membandingkan perlengkapan standar dengan harga varian, tanpa bergantung pada satu skor.",
      updated: UPDATED,
      sections: [
        {
          heading: "Bandingkan varian, bukan model",
          paragraphs: [
            "Perlengkapan sebuah mobil ditentukan oleh variannya. Dua varian dari model yang sama bisa berbeda puluhan juta rupiah dan berbeda jauh dalam fitur keselamatan. Karena itu Carsea selalu menyebut varian, tahun model, dan jenis mesin yang dimaksud.",
          ],
        },
        {
          heading: "Standar, opsional, dan tidak tersedia",
          list: [
            "Standar: sudah termasuk dalam harga varian itu.",
            "Opsional: tersedia dengan biaya tambahan, jadi tidak dihitung sebagai bagian dari harga.",
            "Tidak tersedia: tidak bisa didapat pada varian itu.",
            "Belum diketahui: kami belum memiliki sumber yang bisa diperiksa. Ini berbeda dari tidak tersedia.",
          ],
        },
        {
          heading: "Mengapa tidak ada skor nilai",
          paragraphs: [
            "Nilai sebuah mobil bergantung pada fitur yang penting bagi Anda. Kursi baris ketiga sangat berharga bagi keluarga besar dan tidak berarti bagi pengemudi tunggal. Satu angka untuk semua orang akan menyembunyikan hal itu.",
            "Carsea menampilkan rincian fitur per kelompok di samping harga varian, dan membiarkan prioritas Anda yang menentukan urutannya.",
          ],
        },
        {
          heading: "Yang perlu diperiksa sendiri",
          paragraphs: [
            "Periksa daftar perlengkapan pada brosur resmi untuk tahun model yang Anda beli. Pabrikan dapat mengubah perlengkapan di tengah tahun, dan unit di dealer bisa berasal dari produksi sebelumnya.",
          ],
        },
      ],
    },
    {
      slug: "monthly-ownership-cost",
      title: "Biaya kepemilikan bulanan",
      summary: "Empat komponen biaya rutin, cara Carsea menghitungnya, dan batas dari perkiraan tersebut.",
      updated: UPDATED,
      sections: [
        {
          heading: "Empat komponen",
          list: [
            "BBM atau listrik, dihitung dari jarak tempuh bulanan Anda, konsumsi kendaraan, dan harga energi.",
            "Servis berkala, dari biaya servis tahunan dibagi dua belas.",
            "Pajak tahunan, dibagi dua belas agar bisa dibandingkan per bulan.",
            "Asuransi, dari premi tahunan dibagi dua belas.",
          ],
          after: ["Setiap komponen ditampilkan terpisah, dengan sumber dan asumsinya."],
        },
        {
          heading: "Yang tidak dihitung",
          paragraphs: [
            "Perkiraan ini tidak memasukkan cicilan, bunga kredit, penyusutan, nilai jual kembali, parkir, tol, ban, atau perbaikan di luar servis berkala. Biaya-biaya itu nyata, tetapi terlalu bergantung pada keadaan Anda untuk kami perkirakan dengan jujur.",
          ],
        },
        {
          heading: "Jika sebuah komponen kosong",
          paragraphs: [
            "Jika kami tidak memiliki angka yang bisa didukung sumber, komponen itu ditampilkan sebagai belum tersedia. Jumlah yang Anda lihat lalu disebut subtotal, dan kami menyebut komponen mana yang tidak termasuk. Kami tidak mengisi angka perkiraan untuk membuat totalnya terlihat lengkap.",
          ],
        },
        {
          heading: "Perkiraan, bukan tagihan",
          paragraphs: [
            "Konsumsi BBM nyata berubah menurut kemacetan, gaya mengemudi, dan beban. Harga energi dan tarif pajak juga berubah. Gunakan angka ini untuk membandingkan mobil, bukan sebagai janji biaya.",
          ],
        },
      ],
    },
    {
      slug: "warranty-and-service",
      title: "Garansi dan bengkel resmi",
      summary: "Cara membaca masa garansi, apa yang sering dikecualikan, dan cara memeriksa bengkel resmi di dekat Anda.",
      updated: UPDATED,
      sections: [
        {
          heading: "Membaca masa garansi",
          paragraphs: [
            "Garansi biasanya ditulis dalam tahun dan kilometer, mana yang tercapai lebih dulu. Garansi tiga tahun atau 100.000 km berakhir pada kilometer 100.000 walaupun mobil baru berumur dua tahun.",
            "Mobil hybrid dan listrik sering memiliki garansi baterai yang terpisah dan lebih panjang dari garansi kendaraan.",
          ],
        },
        {
          heading: "Syarat yang perlu ditanyakan",
          list: [
            "Apakah garansi mengharuskan servis berkala di bengkel resmi.",
            "Komponen apa yang dikecualikan, misalnya suku cadang yang aus karena pemakaian.",
            "Apakah garansi tetap berlaku jika mobil dijual ke pemilik lain.",
            "Apakah modifikasi atau aksesori non-resmi membatalkan garansi.",
          ],
        },
        {
          heading: "Memeriksa bengkel resmi",
          paragraphs: [
            "Garansi hanya berguna jika ada bengkel resmi yang bisa Anda jangkau. Periksa lokasi bengkel terdekat dari rumah atau tempat kerja, lalu konfirmasi alamat dan jam bukanya langsung kepada bengkel tersebut.",
            "Daftar bengkel di Carsea mencantumkan sumber dan tanggal pemeriksaan untuk tiap bengkel. Nomor telepon dan jam buka hanya ditampilkan jika sudah kami periksa.",
          ],
        },
      ],
    },
  ],
  en: [
    {
      slug: "budget-and-otr-price",
      title: "Budget and OTR price",
      summary: "What an on-the-road price usually includes, what it leaves out, and how to set a realistic budget.",
      updated: UPDATED,
      sections: [
        {
          heading: "What an OTR price is",
          paragraphs: [
            "The on-the-road (OTR) price is the price of a car that is ready to drive. Besides the vehicle itself, it usually covers the cost of registering a new vehicle.",
            "An OTR price applies to a specific region. A Jakarta OTR price can differ from another city's because registration costs differ. Carsea shows prices for Greater Jakarta.",
          ],
        },
        {
          heading: "What it usually includes",
          list: [
            "The vehicle price from the manufacturer or distributor.",
            "The new-vehicle title transfer fee (BBN-KB).",
            "First-year motor vehicle tax (PKB).",
            "SWDKLLJ, the mandatory road accident contribution.",
            "Administration fees for the registration certificate (STNK), number plates, and ownership book (BPKB).",
          ],
        },
        {
          heading: "What it usually leaves out",
          list: [
            "Vehicle insurance.",
            "Dealer accessories and add-on packages.",
            "Extended warranty or paid service packages.",
            "Interest and fees if you buy on credit.",
          ],
          after: [
            "Details vary between brands and dealers. Ask for a written breakdown before you pay, and check that the price offered matches the official OTR price.",
          ],
        },
        {
          heading: "Setting a budget",
          paragraphs: [
            "Decide the ceiling for the OTR price first, then set aside separate money for first-year insurance and monthly costs. The purchase price is paid once; ownership costs arrive every month for as long as you own the car.",
            "Carsea keeps the two apart on purpose. The OTR price is never combined with the monthly cost estimate.",
          ],
        },
      ],
    },
    {
      slug: "features-for-the-price",
      title: "Features for the price",
      summary: "How to weigh standard equipment against a variant's price without relying on a single score.",
      updated: UPDATED,
      sections: [
        {
          heading: "Compare variants, not models",
          paragraphs: [
            "A car's equipment is decided by its variant. Two variants of one model can differ by tens of millions of rupiah and by a great deal of safety equipment. That is why Carsea always names the variant, model year, and powertrain it is describing.",
          ],
        },
        {
          heading: "Standard, optional, and unavailable",
          list: [
            "Standard: included in that variant's price.",
            "Optional: available at extra cost, so not counted as part of the price.",
            "Unavailable: cannot be had on that variant.",
            "Unknown: we do not yet have a source we can check. This is not the same as unavailable.",
          ],
        },
        {
          heading: "Why there is no value score",
          paragraphs: [
            "What a car is worth depends on the features that matter to you. A third row of seats is valuable to a large family and worthless to someone who drives alone. One number for everybody would hide that.",
            "Carsea shows the equipment by group next to the variant's price, and lets your priorities decide the order.",
          ],
        },
        {
          heading: "What to check yourself",
          paragraphs: [
            "Check the equipment list in the official brochure for the model year you are buying. Manufacturers can change equipment mid-year, and a car at the dealer may come from an earlier production run.",
          ],
        },
      ],
    },
    {
      slug: "monthly-ownership-cost",
      title: "Monthly ownership cost",
      summary: "The four recurring costs, how Carsea calculates them, and the limits of the estimate.",
      updated: UPDATED,
      sections: [
        {
          heading: "Four components",
          list: [
            "Fuel or electricity, from your monthly distance, the car's consumption, and the energy price.",
            "Scheduled servicing, from the annual service cost divided by twelve.",
            "Annual tax, divided by twelve so it can be compared per month.",
            "Insurance, from the annual premium divided by twelve.",
          ],
          after: ["Each component is shown separately, with its source and assumption."],
        },
        {
          heading: "What is left out",
          paragraphs: [
            "The estimate does not include loan instalments, interest, depreciation, resale value, parking, tolls, tyres, or repairs outside scheduled servicing. Those costs are real, but depend too much on your circumstances for us to estimate honestly.",
          ],
        },
        {
          heading: "When a component is empty",
          paragraphs: [
            "If we have no figure that a source supports, the component is shown as not available. The amount you see is then called a subtotal, and we name the components it excludes. We do not fill in a guess to make the total look complete.",
          ],
        },
        {
          heading: "An estimate, not a bill",
          paragraphs: [
            "Real fuel consumption changes with traffic, driving style, and load. Energy prices and tax rates change too. Use these figures to compare cars, not as a promise of what you will pay.",
          ],
        },
      ],
    },
    {
      slug: "warranty-and-service",
      title: "Warranty and authorized service",
      summary: "How to read a warranty period, what is often excluded, and how to check authorized service near you.",
      updated: UPDATED,
      sections: [
        {
          heading: "Reading a warranty period",
          paragraphs: [
            "A warranty is usually stated in years and kilometres, whichever comes first. A three-year or 100,000 km warranty ends at 100,000 km even if the car is only two years old.",
            "Hybrid and electric cars often carry a separate battery warranty that runs longer than the vehicle warranty.",
          ],
        },
        {
          heading: "Conditions to ask about",
          list: [
            "Whether the warranty requires scheduled servicing at an authorized workshop.",
            "Which components are excluded, such as parts that wear with use.",
            "Whether the warranty carries over if the car is sold to another owner.",
            "Whether modifications or non-official accessories void it.",
          ],
        },
        {
          heading: "Checking authorized service",
          paragraphs: [
            "A warranty is only useful if there is an authorized workshop you can reach. Look up the nearest one to your home or workplace, then confirm its address and opening hours with the workshop directly.",
            "Carsea's service centre list gives the source and checking date for each centre. Phone numbers and opening hours are shown only once we have checked them.",
          ],
        },
      ],
    },
  ],
};

export const guideSlugs = guides.id.map((guide) => guide.slug);

export const getGuide = (locale: Locale, slug: string) =>
  guides[locale].find((guide) => guide.slug === slug);
