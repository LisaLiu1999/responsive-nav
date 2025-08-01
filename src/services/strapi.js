// ────────────────────────────────────────────────────────────
// Strapi v4 helpers – 修正版本，確保預約功能正常工作
// ────────────────────────────────────────────────────────────

const API_URL =
  import.meta.env.VITE_REACT_APP_STRAPI_URL ||
  import.meta.env.VITE_STRAPI_URL ||
  'http://localhost:1337';

const PLACEHOLDER_IMAGE =
  'https://via.placeholder.com/140/f0f0f0/666?text=Service';

/* ---------- utils ---------- */

export const getImageUrl = (img) => {
  if (!img || typeof img !== 'object') return PLACEHOLDER_IMAGE;

  const url =
    img?.formats?.thumbnail?.url ||
    img?.url ||
    '';

  return url.startsWith('http') ? url : `${API_URL}${url}`;
};

export const normalizeService = (raw) => {
  const s = raw.attributes ? { id: raw.id, ...raw.attributes } : raw;

  return {
    id: s.id,
    title: s.title ?? 'Untitled service',
    duration: Number(s.duration) || 0,
    price: Number(s.price) || 0,
    backgroundColor: (s.backgroundColor || 'yellow').toLowerCase(),
    imageURL: getImageUrl(s.image?.data?.attributes || s.image),
  };
};

/* ---------- Services ---------- */
export const fetchServices = async () => {
  const r = await fetch(`${API_URL}/api/services?populate=*`);
  if (!r.ok) throw new Error(`fetchServices → ${r.status}`);
  const { data } = await r.json();
  return data.map(normalizeService);
};

/* ---------- Bookings ---------- */
export const createBooking = async (data, token = null) => {
  const hdrs = { 'Content-Type': 'application/json' };
  if (token) hdrs.Authorization = `Bearer ${token}`;

  // 修正數據結構，確保字段名稱與Strapi後端一致
  const bookingData = {
    userEmail: data.userEmail,
    // 嘗試不同的用戶名字段名稱
    user_name: data.userName || data.user_name,
    scheduleTime: data.scheduleTime,
    bookingStatus: data.bookingStatus || 'confirmed',
    // 嘗試不同的服務關聯方式
    service: typeof data.service === 'object' && data.service.connect 
      ? data.service.connect[0] 
      : data.service,
    // 保存服務的快照數據
    serviceName: data.serviceName,
    servicePrice: data.servicePrice,
    serviceDuration: data.serviceDuration
  };

  console.log('Sending booking data to Strapi:', bookingData);

  const r = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify({ data: bookingData }),
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    console.error('Strapi error response:', errorText);
    throw new Error(`createBooking → ${r.status} ${errorText}`);
  }
  
  const result = await r.json();
  console.log('Booking created successfully:', result);
  return result.data;
};

export const fetchBookingsForUser = async (email, token = null) => {
  const hdrs = token ? { Authorization: `Bearer ${token}` } : {};
  const url =
    `${API_URL}/api/bookings` +
    `?filters[userEmail][$eq]=${encodeURIComponent(email)}` +
    `&populate[service][populate]=image` +
    `&sort=scheduleTime:desc`; // 按時間降序排列

  console.log('Fetching bookings from:', url);

  const r = await fetch(url, { headers: hdrs });
  if (!r.ok) {
    const errorText = await r.text();
    console.error('Error fetching bookings:', errorText);
    throw new Error(`fetchBookingsForUser → ${r.status} ${errorText}`);
  }
  
  const result = await r.json();
  console.log('Fetched bookings data:', result);
  
  // 處理返回的數據結構
  const bookings = result.data || [];
  return bookings.map(booking => {
    // 標準化預約數據結構
    const attributes = booking.attributes || booking;
    const service = attributes.service?.data?.attributes || attributes.service || null;
    
    return {
      id: booking.id,
      documentId: booking.documentId,
      userEmail: attributes.userEmail,
      userName: attributes.user_name || attributes.userName, // 支持兩種字段名
      scheduleTime: attributes.scheduleTime,
      date: attributes.scheduleTime, // 為了兼容性
      bookingStatus: attributes.bookingStatus,
      status: attributes.bookingStatus, // 為了兼容性
      service: service ? {
        id: service.id || attributes.service?.data?.id,
        name: service.title || attributes.serviceName, // 優先使用關聯的服務數據
        title: service.title || attributes.serviceName,
        duration: service.duration || attributes.serviceDuration,
        price: service.price || attributes.servicePrice,
        backgroundColor: service.backgroundColor || 'yellow',
        image: service.image
      } : {
        // 如果沒有關聯服務，使用快照數據
        name: attributes.serviceName,
        title: attributes.serviceName,
        duration: attributes.serviceDuration,
        price: attributes.servicePrice,
        backgroundColor: 'yellow'
      }
    };
  });
};

export const updateBooking = async (id, patch, token = null) => {
  const hdrs = { 'Content-Type': 'application/json' };
  if (token) hdrs.Authorization = `Bearer ${token}`;

  const r = await fetch(`${API_URL}/api/bookings/${id}`, {
    method: 'PUT',
    headers: hdrs,
    body: JSON.stringify({ data: patch }),
  });
  if (!r.ok) {
    const e = await r.text();
    throw new Error(`updateBooking → ${r.status} ${e}`);
  }
  return (await r.json()).data;
};

// 新增：根據預約ID獲取單個預約（用於調試）
export const fetchBookingById = async (id, token = null) => {
  const hdrs = token ? { Authorization: `Bearer ${token}` } : {};
  const url = `${API_URL}/api/bookings/${id}?populate[service][populate]=image`;

  const r = await fetch(url, { headers: hdrs });
  if (!r.ok) {
    const e = await r.text();
    throw new Error(`fetchBookingById → ${r.status} ${e}`);
  }
  return (await r.json()).data;
};