/**
 * Image processing utilities for client-side compression and SVG data URI placeholders
 */

export async function compressImage(
  file: File,
  maxDimension: number = 1024,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate an SVG data URI avatar with driver initials and subtle gradient
 */
export function generateAvatarSvgDataUri(name: string, bgHex: string = '#0F766E'): string {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgHex}"/>
        <stop offset="100%" stop-color="#0B5F58"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" rx="80" fill="url(#g)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="700" fill="#FFFFFF" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generate a stylized Driver's Licence card SVG data URI
 */
export function generateLicenseSvgDataUri(name: string, nationalId: string, licenceNo: string = 'JO-DL-9821'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="540" height="340">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="100%" stop-color="#E2E8F0"/>
      </linearGradient>
      <linearGradient id="stripe" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0F766E"/>
        <stop offset="100%" stop-color="#14B8A6"/>
      </linearGradient>
    </defs>
    <rect width="540" height="340" rx="16" fill="url(#bg)" stroke="#CBD5E1" stroke-width="2"/>
    <rect width="540" height="42" rx="16" fill="url(#stripe)"/>
    <rect y="26" width="540" height="16" fill="#14B8A6"/>
    <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF" letter-spacing="1">HASHEMITE KINGDOM OF JORDAN · DRIVING LICENCE</text>
    
    <!-- Photo box -->
    <rect x="24" y="60" width="110" height="140" rx="8" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5"/>
    <circle cx="79" cy="115" r="30" fill="#64748B"/>
    <path d="M 44 190 Q 79 155 114 190 Z" fill="#64748B"/>

    <!-- Fields -->
    <text x="156" y="80" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">NAME / الإسم</text>
    <text x="156" y="102" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="700" fill="#0F172A">${name}</text>

    <text x="156" y="132" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">NATIONAL ID / الرقم الوطني</text>
    <text x="156" y="152" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="600" fill="#0F172A">${nationalId}</text>

    <text x="156" y="182" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">LICENCE NO. / رقم الرخصة</text>
    <text x="156" y="202" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#0F766E">${licenceNo}</text>

    <text x="24" y="235" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">CATEGORY</text>
    <text x="24" y="255" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0F172A">CATEGORY 3 (Light Vehicle / Private)</text>

    <text x="24" y="285" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">VALIDITY</text>
    <text x="24" y="305" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#16A34A">VALID UNTIL 2029-08-15</text>

    <!-- Chip symbol -->
    <rect x="440" y="70" width="60" height="46" rx="6" fill="#F59E0B" opacity="0.9"/>
    <line x1="440" y1="93" x2="500" y2="93" stroke="#B45309" stroke-width="1.5"/>
    <line x1="470" y1="70" x2="470" y2="116" stroke="#B45309" stroke-width="1.5"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const generateDrivingLicenceSvgDataUri = generateLicenseSvgDataUri;

/**
 * Generate a stylized Jordanian Civil Status National ID card SVG data URI
 */
export function generateNationalIdSvgDataUri(name: string, nationalId: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="540" height="340">
    <defs>
      <linearGradient id="nidBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F1F5F9"/>
        <stop offset="100%" stop-color="#E2E8F0"/>
      </linearGradient>
      <linearGradient id="nidHeader" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    </defs>
    <rect width="540" height="340" rx="16" fill="url(#nidBg)" stroke="#CBD5E1" stroke-width="2"/>
    <rect width="540" height="42" rx="16" fill="url(#nidHeader)"/>
    <rect y="26" width="540" height="16" fill="#334155"/>
    <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" letter-spacing="1">CIVIL STATUS &amp; PASSPORTS DEPT · بطاقة الأحوال المدنية</text>
    
    <!-- Photo frame -->
    <rect x="24" y="60" width="110" height="140" rx="8" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5"/>
    <circle cx="79" cy="115" r="30" fill="#475569"/>
    <path d="M 44 190 Q 79 155 114 190 Z" fill="#475569"/>

    <!-- Fields -->
    <text x="156" y="80" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">NAME / الاسم الكامل</text>
    <text x="156" y="102" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="700" fill="#0F172A">${name}</text>

    <text x="156" y="132" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">NATIONAL ID NO. / الرقم الوطني</text>
    <text x="156" y="154" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="800" fill="#0F766E" letter-spacing="1">${nationalId}</text>

    <text x="156" y="186" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">NATIONALITY / الجنسية</text>
    <text x="156" y="206" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#0F172A">JORDANIAN / أردني</text>

    <text x="24" y="235" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">PLACE &amp; DATE OF BIRTH</text>
    <text x="24" y="255" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0F172A">AMMAN · 1996-04-12</text>

    <text x="24" y="285" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748B">CARD SERIAL NUMBER</text>
    <text x="24" y="305" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#475569">JO-ID-78401928</text>

    <!-- Security Hologram Badge -->
    <rect x="420" y="70" width="80" height="80" rx="40" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1"/>
    <circle cx="460" cy="110" r="28" fill="#14B8A6" opacity="0.15"/>
    <text x="460" y="114" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#0F766E" text-anchor="middle">VERIFIED</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generate a stylized Jordanian Vehicle Registration (Mulkiya) SVG data URI
 */
export function generateMulkiyaSvgDataUri(plateNumber: string, model: string, ownerName: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="540" height="340">
    <defs>
      <linearGradient id="mulBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FEFCE8"/>
        <stop offset="100%" stop-color="#FEF08A"/>
      </linearGradient>
      <linearGradient id="mulHeader" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#854D0E"/>
        <stop offset="100%" stop-color="#A16207"/>
      </linearGradient>
    </defs>
    <rect width="540" height="340" rx="16" fill="url(#mulBg)" stroke="#EAB308" stroke-width="2"/>
    <rect width="540" height="42" rx="16" fill="url(#mulHeader)"/>
    <rect y="26" width="540" height="16" fill="#A16207"/>
    <text x="24" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" letter-spacing="1">TRAFFIC DEPARTMENT · رخصة سير المركبة (الملكية)</text>

    <!-- Plate Number Badge -->
    <rect x="24" y="65" width="200" height="60" rx="8" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <rect x="24" y="65" width="40" height="60" rx="8" fill="#DC2626"/>
    <text x="44" y="100" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">JORDAN</text>
    <text x="135" y="105" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="2">${plateNumber}</text>

    <!-- Details -->
    <text x="250" y="80" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#713F12">REGISTERED OWNER / المالك</text>
    <text x="250" y="102" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#1C1917">${ownerName}</text>

    <text x="250" y="130" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#713F12">VEHICLE MAKE &amp; MODEL / نوع المركبة</text>
    <text x="250" y="150" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#1C1917">${model}</text>

    <line x1="24" y1="180" x2="516" y2="180" stroke="#CA8A04" stroke-width="1" stroke-dasharray="4"/>

    <text x="24" y="210" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#713F12">VEHICLE CLASS / الصنف</text>
    <text x="24" y="230" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#1C1917">COMMERCIAL / COURIER AUTHORIZED</text>

    <text x="250" y="210" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#713F12">ENGINE &amp; CHASSIS</text>
    <text x="250" y="230" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#1C1917">VIN: JM1BK32F78104921</text>

    <text x="24" y="270" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#713F12">ANNUAL REGISTRATION VALIDITY</text>
    <text x="24" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#16A34A">VALID · EXPIRY: 2028-11-30</text>

    <rect x="420" y="240" width="80" height="50" rx="6" fill="#FEF08A" stroke="#CA8A04" stroke-width="1"/>
    <text x="460" y="268" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="800" fill="#854D0E" text-anchor="middle">STAMPED</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generate a clean stylized product image SVG placeholder
 */
export function generateProductPlaceholderSvg(title: string, colorHex: string = '#0F766E'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
    <rect width="320" height="240" rx="12" fill="#F1F5F9"/>
    <rect x="20" y="20" width="280" height="200" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <circle cx="160" cy="100" r="40" fill="${colorHex}" opacity="0.12"/>
    <path d="M140 100 L160 80 L180 100 L160 120 Z" fill="${colorHex}"/>
    <text x="160" y="165" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#334155" text-anchor="middle">${title}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
