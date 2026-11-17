// Tanggal PO ditutup (ubah sesuai kebutuhan)
export const PO_END = new Date('2026-11-25T23:59:59+07:00')

export const GROUPS = [
  'Semua',
  'CYE',
  'ILLIT',
  'aespa',
  'BABYMONSTER',
  'Hearts2Hearts',
  'TREASURE',
  '&TEAM',
  'THE BOYZ',
]

const BASE = import.meta.env.BASE_URL || '/go-closerz/'

const g = {
  CYE: ['#4338ca', '#06b6d4'],
  ILLIT: ['#06b6d4', '#ec4899'],
  aespa: ['#7c3aed', '#06b6d4'],
  BABYMONSTER: ['#dc2626', '#f59e0b'],
  Hearts2Hearts: ['#f43f5e', '#ec4899'],
  TREASURE: ['#0284c7', '#38bdf8'],
  '&TEAM': ['#1e293b', '#6366f1'],
  'THE BOYZ': ['#b91c1c', '#6366f1'],
}

const mk = (id, name, group, type, price, stock, image, tone = 'aurora') =>
  ({ id, name, group, type, price, stock, colors: g[group] || g.CYE, image: `${BASE}members/${image}`, tone })

export const CARDS = [
  // Close Your Eyes (CYE)
  mk(1, 'MINWOOK', 'CYE', 'Photocard Album Ver. A (ETERNALT)', 18000, 12, 'minwook.svg', 'aurora'),
  mk(2, 'JINGXIANG', 'CYE', 'Photocard Album Ver. A (ETERNALT)', 20000, 8, 'jingxiang.svg', 'dusk'),
  mk(3, 'YEOJUN', 'CYE', 'Photocard Album Ver. A (ETERNALT)', 18000, 10, 'yeojun.svg', 'mist'),
  mk(4, 'SUNGMIN', 'CYE', 'Photocard Album Ver. B (DUSK)', 18000, 7, 'sungmin.svg', 'aurora'),
  mk(5, 'SEUNGHO', 'CYE', 'Photocard Album Ver. B (DUSK)', 18000, 6, 'seungho.svg', 'dusk'),
  mk(6, 'KENSHIN', 'CYE', 'Lucky Draw Hologram Silver', 45000, 4, 'kenshin.svg', 'mist'),
  mk(7, 'KYOUNGBAE', 'CYE', 'POB Weverse Special Pink', 38000, 5, 'kyoungbae.svg', 'aurora'),

  // ILLIT (5 member: 3 di atas, 2 di bawah)
  mk(8, 'WONHEE', 'ILLIT', 'Photocard Album I\'LL LIKE YOU (To Ver.)', 28000, 10, 'wonhee.svg', 'mist'),
  mk(9, 'MINJU', 'ILLIT', 'Photocard Album I\'LL LIKE YOU (With Ver.)', 28000, 8, 'minju.svg', 'aurora'),
  mk(10, 'MOKA', 'ILLIT', 'Photocard Album SUPER REAL ME (Magnetic)', 26000, 9, 'moka.svg', 'mist'),
  mk(11, 'IROHA', 'ILLIT', 'Photocard Album I\'LL LIKE YOU (Between)', 26000, 7, 'iroha.svg', 'dusk'),
  mk(12, 'YUNAH', 'ILLIT', 'Photocard Album SUPER REAL ME (Real Me)', 26000, 8, 'yunah.svg', 'aurora'),

  // aespa
  mk(13, 'KARINA', 'aespa', 'Photocard Album Armageddon (Supernova)', 35000, 8, 'karina.svg', 'dusk'),
  mk(14, 'WINTER', 'aespa', 'Photocard Album Armageddon (Supernova)', 35000, 6, 'winter.svg', 'aurora'),
  mk(15, 'GISELLE', 'aespa', 'Photocard Album Whiplash (Speed Ver.)', 32000, 10, 'giselle.svg', 'dusk'),
  mk(16, 'NINGNING', 'aespa', 'Photocard Album Whiplash (Beat Ver.)', 32000, 7, 'ningning.svg', 'mist'),

  // BABYMONSTER
  mk(17, 'AHYEON', 'BABYMONSTER', 'Photocard Album DRIP (Band Ver.)', 32000, 9, 'ahyeon.svg', 'aurora'),
  mk(18, 'PHARITA', 'BABYMONSTER', 'Photocard Album DRIP (Drip Ver.)', 30000, 11, 'pharita.svg', 'mist'),
  mk(19, 'CHIQUITA', 'BABYMONSTER', 'Photocard Album DRIP (Target Ver.)', 30000, 8, 'chiquita.svg', 'aurora'),
  mk(20, 'ASA', 'BABYMONSTER', 'Photocard Album BABYMONS7ER (Like That)', 28000, 7, 'asa.svg', 'dusk'),
  mk(21, 'RORA', 'BABYMONSTER', 'Photocard Album DRIP (Jewel Ver.)', 28000, 6, 'rora.svg', 'aurora'),
  mk(22, 'RUKA', 'BABYMONSTER', 'Photocard Album BABYMONS7ER (Batter Up)', 28000, 8, 'ruka.svg', 'dusk'),
  mk(23, 'RAMI', 'BABYMONSTER', 'Photocard Album DRIP (Vocal Special)', 28000, 7, 'rami.svg', 'mist'),

  // Hearts2Hearts (H2H)
  mk(24, 'CARMEN', 'Hearts2Hearts', 'Photocard Summer Kit Lemontang (H2H)', 30000, 8, 'carmen.svg', 'mist'),
  mk(25, 'YUHA', 'Hearts2Hearts', 'Photocard Album Focus (K4 Rude Ver.)', 30000, 9, 'yuha.svg', 'aurora'),
  mk(26, 'A-NA', 'Hearts2Hearts', 'Photocard Album Focus (Spider Togu Ver.)', 30000, 7, 'ana.svg', 'dusk'),

  // TREASURE
  mk(27, 'JIHOON', 'TREASURE', 'Photocard Special Kit (REBOOT Era)', 32000, 8, 'jihoon.svg', 'aurora'),
  mk(28, 'HARUTO', 'TREASURE', 'Photocard Incheon Departure POB', 35000, 6, 'haruto.svg', 'mist'),
  mk(29, 'JUNKYU', 'TREASURE', 'Photocard Album REBOOT (Digipack)', 30000, 7, 'junkyu.svg', 'dusk'),
  mk(30, 'YOSHI', 'TREASURE', 'Photocard Album REBOOT (Photobook)', 30000, 8, 'yoshi.svg', 'aurora'),
  mk(31, 'ASAHI', 'TREASURE', 'Photocard Lucky Draw Silver (REBOOT)', 35000, 5, 'asahi.svg', 'dusk'),

  // &TEAM
  mk(32, 'K', '&TEAM', 'Photocard Album First Howling (KCON JP)', 32000, 7, 'k.svg', 'dusk'),
  mk(33, 'NICHOLAS', '&TEAM', 'Photocard Gimpo Departure Special', 30000, 8, 'nicholas.svg', 'aurora'),
  mk(34, 'EJ', '&TEAM', 'Photocard Album First Howling (SBS Ver.)', 28000, 9, 'ej.svg', 'mist'),
  mk(35, 'HARUA', '&TEAM', 'Photocard Album Samidare (ATA Promo)', 30000, 6, 'harua.svg', 'aurora'),
  mk(36, 'JO', '&TEAM', 'Photocard Special TTV Super Star Ver.', 30000, 7, 'jo.svg', 'dusk'),

  // THE BOYZ
  mk(37, 'JUYEON', 'THE BOYZ', 'Photocard Album BE AWARE (Showcase)', 32000, 8, 'juyeon.svg', 'dusk'),
  mk(38, 'YOUNGHOON', 'THE BOYZ', 'Photocard Album PHANTASY (Sixth Sense)', 32000, 7, 'younghoon.svg', 'aurora'),
  mk(39, 'SUNWOO', 'THE BOYZ', 'Photocard Album BE AWAKE (Roar Ver.)', 30000, 8, 'sunwoo.svg', 'mist'),
  mk(40, 'HYUNJAE', 'THE BOYZ', 'Photocard Music Bank Recording POB', 30000, 9, 'hyunjae.svg', 'dusk'),
]

export const HERO_CARDS = [
  {
    name: 'KARINA',
    group: 'aespa',
    back: 'Karina · aespa',
    no: '01',
    tone: 'dusk',
    rot: -9,
    x: -95,
    y: 12,
    zIndex: 1,
    image: `${BASE}members/karina.svg`,
  },
  {
    name: 'MINWOOK',
    group: 'CYE',
    back: 'Minwook · CYE',
    no: '02',
    tone: 'aurora',
    rot: 0,
    x: 0,
    y: 0,
    zIndex: 2,
    image: `${BASE}members/minwook.svg`,
  },
  {
    name: 'WONHEE',
    group: 'ILLIT',
    back: 'Wonhee · ILLIT',
    no: '03',
    tone: 'mist',
    rot: 9,
    x: 95,
    y: 12,
    zIndex: 3,
    image: `${BASE}members/wonhee.svg`,
  },
]

export const STEPS = [
  ['Pilih kartu CYE', 'Tambahkan photocard member favoritmu ke keranjang sebelum slot habis.'],
  ['Isi data pembeli', 'Masukkan nama, nomor WhatsApp, dan alamat pengirimanmu.'],
  ['Bayar DP 50%', 'Transfer sesuai instruksi checkout, lalu konfirmasi ke admin via WhatsApp.'],
  ['Tunggu & lunasi', 'Pelunasan saat album/photocard tiba di Indonesia (~3-4 minggu setelah PO tutup).'],
]

export const FAQ = [
  ['Apakah photocard Close Your Eyes dijamin official?', 'Ya, 100% official dari album debut ETERNALT, Lucky Draw, dan POB resmi UNCORE/YG PLUS.'],
  ['Bisa batal setelah bayar DP?', 'DP tidak dapat dikembalikan setelah PO ditutup karena pesanan langsung diproses ke distributor Korea.'],
  ['Berapa ongkir lokal?', 'Flat Rp15.000 se-Indonesia, dan GRATIS ongkir untuk total belanja di atas Rp200.000.'],
  ['Bagaimana jika kartu ada damage saat tiba?', 'Kirim video unboxing tanpa cut maksimal 2×24 jam sejak paket diterima untuk bantuan klaim/retur.'],
]
