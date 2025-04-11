export const platforms = [
  {
    id: "facebook",
    name: "Facebook",
    accounts: [
      {
        id: "fb-account-1",
        name: "Trang chính thức",
        avatar: "/placeholder.svg?height=40&width=40",
        chats: [
          {
            id: "fb-chat-1",
            customer: {
              id: "customer-1",
              name: "Nguyễn Văn A",
              email: "nguyenvana@example.com",
              phone: "0901234567",
              address: "123 Đường ABC, Quận 1, TP.HCM",
              notes: "Khách hàng thân thiết, thường mua sản phẩm cao cấp.",
              online: true,
            },
            messages: [
              {
                sender: "customer",
                content: "Xin chào, tôi muốn hỏi về sản phẩm mới của bạn",
                timestamp: Date.now() - 3600000,
              },
              {
                sender: "user",
                content: "Chào bạn, chúng tôi vừa ra mắt dòng sản phẩm mới. Bạn quan tâm đến loại nào?",
                timestamp: Date.now() - 3500000,
              },
              {
                sender: "customer",
                content: "Tôi quan tâm đến mẫu XYZ. Bạn có thể cho tôi biết giá không?",
                timestamp: Date.now() - 3400000,
              },
            ],
          },
          {
            id: "fb-chat-2",
            customer: {
              id: "customer-2",
              name: "Trần Thị B",
              email: "tranthib@example.com",
              phone: "0909876543",
              notes: "Khách hàng mới, cần tư vấn kỹ.",
            },
            messages: [
              {
                sender: "customer",
                content: "Sản phẩm của bạn có ship đến Hà Nội không?",
                timestamp: Date.now() - 86400000,
              },
              {
                sender: "user",
                content: "Dạ có ạ, chúng tôi ship toàn quốc. Thời gian giao hàng từ 2-3 ngày.",
                timestamp: Date.now() - 85000000,
              },
            ],
          },
        ],
      },
      {
        id: "fb-account-2",
        name: "Nhóm hỗ trợ",
        chats: [
          {
            id: "fb-chat-3",
            customer: {
              id: "customer-3",
              name: "Lê Văn C",
              phone: "0912345678",
            },
            messages: [
              {
                sender: "customer",
                content: "Tôi cần hỗ trợ về đơn hàng #12345",
                timestamp: Date.now() - 172800000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    accounts: [
      {
        id: "ig-account-1",
        name: "Instagram Official",
        avatar: "/placeholder.svg?height=40&width=40",
        chats: [
          {
            id: "ig-chat-1",
            customer: {
              id: "customer-4",
              name: "Phạm Thị D",
              notes: "Influencer, có thể hợp tác marketing.",
            },
            messages: [
              {
                sender: "customer",
                content: "Tôi muốn hợp tác quảng cáo sản phẩm của bạn",
                timestamp: Date.now() - 259200000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "zalo",
    name: "Zalo",
    accounts: [
      {
        id: "zalo-account-1",
        name: "Zalo Business",
        chats: [
          {
            id: "zalo-chat-1",
            customer: {
              id: "customer-5",
              name: "Hoàng Văn E",
              phone: "0987654321",
              address: "456 Đường XYZ, Quận 2, TP.HCM",
            },
            messages: [
              {
                sender: "customer",
                content: "Chào shop, tôi muốn đặt hàng",
                timestamp: Date.now() - 432000000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    accounts: [
      {
        id: "telegram-account-1",
        name: "Telegram Channel",
        chats: [
          {
            id: "telegram-chat-1",
            customer: {
              id: "customer-6",
              name: "Đỗ Thị F",
              phone: "0978123456",
            },
            messages: [
              {
                sender: "customer",
                content: "Tôi có thể đặt hàng qua Telegram được không?",
                timestamp: Date.now() - 518400000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    accounts: [
      {
        id: "whatsapp-account-1",
        name: "WhatsApp Business",
        chats: [
          {
            id: "whatsapp-chat-1",
            customer: {
              id: "customer-7",
              name: "Ngô Văn G",
              phone: "0912345678",
            },
            messages: [
              {
                sender: "customer",
                content: "Bạn có giao hàng quốc tế không?",
                timestamp: Date.now() - 604800000,
              },
            ],
          },
        ],
      },
    ],
  },
]
