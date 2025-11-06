// Simulates the 'Mylist' sheet
export const MY_LIST = [
  {
    id: 'A01PET',
    name: 'Thú cưng & Động vật',
    description: 'Khám phá suy nghĩ và cảm xúc của bạn về những người bạn lông lá, có cánh và có vảy của chúng ta. Bạn nghĩ gì về thế giới động vật?'
  },
  {
    id: 'B01All',
    name: 'Trí tuệ nhân tạo',
    description: 'Hòa mình vào thế giới của AI. Bạn hào hứng hay lo lắng về tương lai của những cỗ máy thông minh? Hãy cùng tìm hiểu xem những người khác nghĩ gì.'
  }
];

// Simulates the 'Myinfo' sheet
export const MY_INFO = [
  {
    name: 'Công ty Công nghệ Tuyệt vời',
    logoUrl: 'https://picsum.photos/seed/tech/100/100',
    websiteUrl: '#',
    isActive: true,
    content: 'Chúng tôi tự hào đồng hành cùng bạn trong hành trình khám phá bản thân. Công nghệ là để kết nối, và chúng tôi tin rằng việc hiểu rõ hơn về chính mình và cộng đồng là bước đầu tiên.'
  },
  {
    name: 'Thiên đường Thú cưng',
    logoUrl: 'https://picsum.photos/seed/pet/100/100',
    websiteUrl: '#',
    isActive: false,
    content: 'Mỗi thú cưng là một người bạn. Hãy yêu thương và chăm sóc chúng nhé!'
  }
];

// Simulates the 'A01PET' sheet
// IMPORTANT: Google Sheets stores objects/arrays as JSON strings. 
// We replicate that here so the parsing logic in gameService works for both mock and real data.
const A01_PET_QUESTIONS = [
  {
    id: 'P01',
    text: 'Bạn có tin rằng chó thực sự là "bạn thân nhất của con người" không?',
    options: ['Có', 'Không'],
    stats: JSON.stringify({ 'Có': 1843, 'Không': 211 }),
  },
  {
    id: 'P02',
    text: 'Bạn thích nuôi mèo hơn nuôi chó?',
    options: ['Có', 'Không'],
    stats: JSON.stringify({ 'Có': 987, 'Không': 1067 }),
  },
  {
    id: 'P03',
    text: 'Có nên nuôi động vật hoang dã làm thú cưng không?',
    options: ['Có', 'Không'],
    stats: JSON.stringify({ 'Có': 345, 'Không': 1709 }),
  },
  {
    id: 'P04',
    text: 'Bạn sẽ chọn nuôi con vật nào?',
    options: ['Cá', 'Chim', 'Chuột Hamster', 'Rắn'],
    stats: JSON.stringify({ 'Cá': 890, 'Chim': 654, 'Chuột Hamster': 432, 'Rắn': 123 }),
  }
];

// Simulates the 'B01All' sheet
const B01_AI_QUESTIONS = [
  {
    id: 'AI01',
    text: 'Bạn có lo lắng một ngày nào đó AI sẽ chiếm lấy công việc của bạn không?',
    options: ['Có', 'Không'],
    stats: JSON.stringify({ 'Có': 1302, 'Không': 742 }),
  },
  {
    id: 'AI02',
    text: 'Bạn có nghĩ rằng AI cuối cùng sẽ trở nên thông minh hơn con người không?',
    options: ['Có', 'Không'],
    stats: JSON.stringify({ 'Có': 1655, 'Không': 389 }),
  },
  {
    id: 'AI03',
    text: 'Bạn có tin tưởng để một AI phẫu thuật cho mình không?',
    options: ['Có', 'Không'],
    stats: JSON.stringify({ 'Có': 210, 'Không': 1834 }),
  },
  {
    id: 'AI04',
    text: 'Đối với bạn, ứng dụng nào của AI là thú vị nhất?',
    options: ['Chăm sóc sức khỏe', 'Giao thông vận tải', 'Giải trí', 'Khoa học'],
    stats: JSON.stringify({ 'Chăm sóc sức khỏe': 788, 'Giao thông vận tải': 450, 'Giải trí': 312, 'Khoa học': 505 }),
  }
];

export const QUESTION_BANKS = {
  'A01PET': A01_PET_QUESTIONS,
  'B01All': B01_AI_QUESTIONS
};