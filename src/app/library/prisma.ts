// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient'ın global bir örneğini tutmak için bir değişken.
// Bu, geliştirme sırasında hot-reloading ile çok fazla PrismaClient örneği
// oluşturulmasını engellemeye yardımcı olur.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  // İsteğe bağlı: loglama ayarları
  // log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;