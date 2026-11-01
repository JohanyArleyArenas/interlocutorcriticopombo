import React, { useId } from 'react';

interface IconoInsigniaProps {
  className?: string;
  activo?: boolean;
}

/**
 * Estrella académica con relieve facetado y matices dorados cálidos.
 * Reemplaza el icono plano predeterminado por una insignia editorial orgánica.
 */
export const IconoEstrellaPombo: React.FC<IconoInsigniaProps> = ({
  className = 'w-4 h-4',
  activo = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const gradCuerpo = `estrella-cuerpo-${uid}`;
  const gradFacetas = `estrella-facetas-${uid}`;
  const gradBrillo = `estrella-brillo-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradCuerpo} x1="4" y1="2.5" x2="20" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={activo ? '#F7E094' : '#D5CFC2'} />
          <stop offset="48%" stopColor={activo ? '#D4A52A' : '#B5AFA2'} />
          <stop offset="100%" stopColor={activo ? '#9C6F10' : '#8C867A'} />
        </linearGradient>
        <linearGradient id={gradFacetas} x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={activo ? '#FFF6D6' : '#ECE8DF'} stopOpacity="0.85" />
          <stop offset="55%" stopColor={activo ? '#C5921E' : '#9E988C'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={activo ? '#7A5408' : '#706B60'} stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={gradBrillo} cx="38%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#FFFDF5" stopOpacity={activo ? '0.75' : '0.3'} />
          <stop offset="100%" stopColor="#FFFDF5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Silueta principal con puntas suavemente redondeadas */}
      <path
        d="M12 2.45C12.42 2.45 12.8 2.71 12.97 3.1L15.18 8.15L20.66 8.68C21.08 8.72 21.44 9.01 21.57 9.41C21.7 9.81 21.58 10.25 21.26 10.53L17.14 14.18L18.33 19.57C18.42 19.99 18.26 20.42 17.91 20.67C17.57 20.92 17.11 20.95 16.74 20.73L12 17.93L7.26 20.73C6.89 20.95 6.43 20.92 6.09 20.67C5.74 20.42 5.58 19.99 5.67 19.57L6.86 14.18L2.74 10.53C2.42 10.25 2.3 9.81 2.43 9.41C2.56 9.01 2.92 8.72 3.34 8.68L8.82 8.15L11.03 3.1C11.2 2.71 11.58 2.45 12 2.45Z"
        fill={`url(#${gradCuerpo})`}
        stroke={activo ? '#8F650D' : '#857F73'}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Facetas internas sutiles tipo medalla académica */}
      <path
        d="M12 3.4L14.65 8.65L20.2 9.2L12 12.35V3.4Z"
        fill={`url(#${gradFacetas})`}
      />
      <path
        d="M12 3.4L9.35 8.65L3.8 9.2L12 12.35V3.4Z"
        fill={`url(#${gradBrillo})`}
      />
      <path
        d="M12 12.35L17.4 19.6L12 16.95L6.6 19.6L12 12.35Z"
        fill={activo ? '#8A600B' : '#7A7468'}
        fillOpacity="0.18"
      />

      {/* Núcleo luminoso discreto */}
      <circle
        cx="12"
        cy="12.1"
        r="1.6"
        fill={activo ? '#FFF8DE' : '#EAE6DC'}
        fillOpacity={activo ? '0.65' : '0.35'}
      />
    </svg>
  );
};

/**
 * Llama orgánica multicapa para representar la constancia diaria de estudio.
 * Combina manto terracota, corazón ámbar y núcleo cálido.
 */
export const IconoLlamaRacha: React.FC<IconoInsigniaProps> = ({
  className = 'w-4 h-4',
  activo = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const gradExterior = `llama-ext-${uid}`;
  const gradMedio = `llama-med-${uid}`;
  const gradNucleo = `llama-nuc-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradExterior} x1="12" y1="2.2" x2="12" y2="21.8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={activo ? '#F29B30' : '#C8C2B6'} />
          <stop offset="45%" stopColor={activo ? '#DC582A' : '#A9A397'} />
          <stop offset="100%" stopColor={activo ? '#9E2A1B' : '#857F74'} />
        </linearGradient>
        <linearGradient id={gradMedio} x1="12" y1="7.5" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={activo ? '#FAD161' : '#DFDBD0'} />
          <stop offset="100%" stopColor={activo ? '#E06D28' : '#9E988C'} />
        </linearGradient>
        <linearGradient id={gradNucleo} x1="12" y1="12.5" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={activo ? '#FFF9DF' : '#F3F0E8'} />
          <stop offset="100%" stopColor={activo ? '#F5C24C' : '#C2BCB0'} />
        </linearGradient>
      </defs>

      {/* Manto exterior esculpido */}
      <path
        d="M12.58 2.35C12.82 2.13 13.21 2.27 13.26 2.59C13.62 4.88 15.08 6.48 16.58 8.15C18.35 10.12 19.75 12.16 19.75 14.78C19.75 18.78 16.42 21.75 12 21.75C7.58 21.75 4.25 18.78 4.25 14.78C4.25 12.38 5.42 10.14 6.95 8.52C7.22 8.23 7.69 8.42 7.69 8.82C7.69 9.75 8.12 10.56 8.85 11.02C8.62 8.25 9.96 4.74 12.58 2.35Z"
        fill={`url(#${gradExterior})`}
        stroke={activo ? '#8E2517' : '#7E786D'}
        strokeWidth="0.85"
        strokeLinejoin="round"
      />

      {/* Corazón ámbar intermedio */}
      <path
        d="M12.35 8.2C13.38 9.85 15.85 11.75 15.85 15.1C15.85 17.45 14.16 19.35 12 19.35C9.84 19.35 8.15 17.45 8.15 15.1C8.15 13.15 9.48 11.62 10.58 10.35C11.18 9.65 11.88 8.95 12.35 8.2Z"
        fill={`url(#${gradMedio})`}
      />

      {/* Gota interior cálida */}
      <path
        d="M12 13.1C13.15 14.25 13.75 15.32 13.75 16.55C13.75 17.65 12.98 18.55 12 18.55C11.02 18.55 10.25 17.65 10.25 16.55C10.25 15.32 10.85 14.25 12 13.1Z"
        fill={`url(#${gradNucleo})`}
      />
    </svg>
  );
};
