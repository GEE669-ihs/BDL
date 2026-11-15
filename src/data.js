// Tanggal PO ditutup (ubah sesuai kebutuhan)
export const PO_END = new Date('2026-11-25T23:59:59+07:00')

export const GROUPS = ['CYE']

const BASE = import.meta.env.BASE_URL || '/go-closerz/'

const g = { CYE: ['#4338ca', '#06b6d4'] }
const mk = (id, name, group, type, price, stock, image, tone = 'aurora') =>
  ({ id, name, group, type, price, stock, colors: g.CYE, image: `${BASE}members/${image}`, tone })

export const CARDS = [
  mk(1, 'MINWOOK', 'CYE', 'Fotokard Album Ver. A (ETERNALT)', 18000, 12, 'minwook.svg', 'aurora'),
  mk(2, 'JINGXIANG', 'CYE', 'Fotokard Album Ver. A (ETERNALT)', 20000, 8, 'jingxiang.svg', 'dusk'),
  mk(3, 'YEOJUN', 'CYE', 'Fotokard Album Ver. A (ETERNALT)', 18000, 10, 'yeojun.svg', 'mist'),
  mk(4, 'SUNGMIN', 'CYE', 'Fotokard Album Ver. B (DUSK)', 18000, 7, 'sungmin.svg', 'aurora'),
  mk(5, 'SEUNGHO', 'CYE', 'Fotokard Album Ver. B (DUSK)', 18000, 6, 'seungho.svg', 'dusk'),
  mk(6, 'KENSHIN', 'CYE', 'Lucky Draw Hologram Silver', 45000, 4, 'kenshin.svg', 'mist'),
  mk(7, 'KYOUNGBAE', 'CYE', 'POB Weverse Special Pink', 38000, 5, 'kyoungbae.svg', 'aurora'),
]

export const HERO_CARDS = [
  { name: 'JINGXIANG', group: 'CYE', back: 'Jingxiang · CYE', no: '02', tone: 'dusk', rot: -9, x: -118, y: -10, image: `${BASE}members/jingxiang.svg` },
  { name: 'MINWOOK', group: 'CYE', back: 'Minwook · CYE', no: '01', tone: 'aurora', rot: 0, x: 0, y: 0, image: `${BASE}members/minwook.svg` },
  { name: 'YEOJUN', group: 'CYE', back: 'Yeojun · CYE', no: '03', tone: 'mist', rot: 9, x: 118, y: 46, image: `${BASE}members/yeojun.svg` },
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
