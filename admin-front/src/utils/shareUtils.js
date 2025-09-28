/**
 * Утилиты для генерации и проверки токенов для публичного доступа к заказам
 */

// Функция для генерации HMAC SHA256
async function generateHMAC(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Функция для проверки HMAC SHA256
async function verifyHMAC(message, signature, secret) {
  const expectedSignature = await generateHMAC(message, secret);
  return signature === expectedSignature;
}

// Генерация токена для публичного доступа к заказу
export async function generateShareToken(orderId, salt) {
  if (!orderId || !salt) {
    throw new Error('OrderId and salt are required');
  }

  const message = orderId.toString();
  const signature = await generateHMAC(message, salt);

  // Возвращаем токен в формате: orderId.signature
  return `${orderId}.${signature}`;
}

// Проверка токена и извлечение orderId
export async function verifyShareToken(token, salt) {
  if (!token || !salt) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [orderId, signature] = parts;

  try {
    const isValid = await verifyHMAC(orderId, signature, salt);
    return isValid ? parseInt(orderId, 10) : null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Генерация ссылки для публичного доступа
export async function generateShareLink(orderId, salt, baseUrl) {
  const token = await generateShareToken(orderId, salt);
  return `${baseUrl}/share/${token}`;
}
