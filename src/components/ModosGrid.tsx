import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Search,
  Scale,
  CheckCircle2,
  Cpu,
  FileText,
  Sigma,
  GraduationCap,
} from 'lucide-react';
import { AGENTE, ModoConfig } from '../parametros.ts';
import { PanelGamificacion } from './PanelGamificacion.tsx';
import { useGamificacion } from '../useGamificacion.ts';

interface ModosGridProps {
  onSelectModo: (key: string) => void;
  estudiante?: string;
  mostrarGamificacion?: boolean;
}

type CategoriaModo = 'todos' | 'aprender' | 'revisar' | 'dialogar';

interface SubBotonTarjeta {
  id: string;
  label: string;
  paso1Id?: string;
  paso2Id?: string;
  areaIcfes?: string;
}

const CATEGORIAS_MODOS: {
  id: CategoriaModo;
  titulo: string;
  modos: string[];
}[] = [
  {
    id: 'todos',
    titulo: 'Todos los modos',
    modos: ['tutor', 'icfes', 'explorar', 'escrito', 'verificar', 'auditar', 'socratico', 'argumento'],
  },
  {
    id: 'aprender',
    titulo: 'Aprender y entrenar',
    modos: ['tutor', 'icfes', 'explorar'],
  },
  {
    id: 'revisar',
    titulo: 'Revisar y verificar',
    modos: ['escrito', 'verificar', 'auditar'],
  },
  {
    id: 'dialogar',
    titulo: 'Dialogar y debatir',
    modos: ['socratico', 'argumento'],
  },
];

const SUB_BOTONES_POR_MODO: Record<string, { etiquetaSeccion: string; botones: SubBotonTarjeta[] }> = {
  tutor: {
    etiquetaSeccion: 'Entrar directo a un área:',
    botones: [
      { id: 'tut-mat', label: 'Matemáticas', paso1Id: 'matematicas' },
      { id: 'tut-fis', label: 'Física', paso1Id: 'fisica' },
      { id: 'tut-qui', label: 'Química', paso1Id: 'quimica' },
      { id: 'tut-profe', label: 'Método del profesor', paso1Id: 'matematicas', paso2Id: 'metodo-profe' },
    ],
  },
  icfes: {
    etiquetaSeccion: 'Practicar cuadernillo oficial:',
    botones: [
      { id: 'icf-mat', label: 'Matemáticas', areaIcfes: 'matematicas' },
      { id: 'icf-lec', label: 'Lectura crítica', areaIcfes: 'lectura' },
      { id: 'icf-soc', label: 'Sociales y ciudadanas', areaIcfes: 'sociales' },
      { id: 'icf-nat', label: 'Ciencias naturales', areaIcfes: 'naturales' },
      { id: 'icf-ing', label: 'Inglés', areaIcfes: 'ingles' },
    ],
  },
  explorar: {
    etiquetaSeccion: 'Campo de investigación:',
    botones: [
      { id: 'exp-soc', label: 'Sociedad y Colombia', paso1Id: 'sociales-colombia' },
      { id: 'exp-cie', label: 'Ciencia y ambiente', paso1Id: 'ciencias-ambiente' },
      { id: 'exp-tec', label: 'Tecnología e IA', paso1Id: 'tecnologia-futuro' },
      { id: 'exp-lit', label: 'Literatura y filosofía', paso1Id: 'literatura-filosofia' },
    ],
  },
  escrito: {
    etiquetaSeccion: 'Tipo de texto para revisar:',
    botones: [
      { id: 'esc-ens', label: 'Ensayo argumentativo', paso1Id: 'ensayo-argumentativo' },
      { id: 'esc-lab', label: 'Informe de laboratorio', paso1Id: 'informe-laboratorio' },
      { id: 'esc-cro', label: 'Crónica o reseña', paso1Id: 'cronica-resena' },
      { id: 'esc-exp', label: 'Guion de exposición', paso1Id: 'guion-exposicion' },
    ],
  },
  verificar: {
    etiquetaSeccion: 'Qué afirmación vas a contrastar:',
    botones: [
      { id: 'ver-red', label: 'Mensaje de redes', paso1Id: 'viral-redes' },
      { id: 'ver-ia', label: 'Cita de una IA', paso1Id: 'cita-ia' },
      { id: 'ver-cif', label: 'Dato científico', paso1Id: 'cifra-ciencia' },
      { id: 'ver-his', label: 'Hecho histórico', paso1Id: 'historia-norma' },
    ],
  },
  auditar: {
    etiquetaSeccion: 'Enfoque de auditoría:',
    botones: [
      { id: 'aud-alu', label: 'Cazar alucinaciones', paso1Id: 'mision-alucinacion' },
      { id: 'aud-ses', label: 'Detectar sesgos', paso1Id: 'mision-sesgos' },
      { id: 'aud-log', label: 'Revisar lógica', paso1Id: 'mision-trampa-logica' },
      { id: 'aud-ext', label: 'Auditar texto de IA', paso1Id: 'mision-externa' },
    ],
  },
  socratico: {
    etiquetaSeccion: 'Iniciar diálogo sobre:',
    botones: [
      { id: 'soc-cre', label: 'Creencia cotidiana', paso1Id: 'creencia-comun' },
      { id: 'soc-dil', label: 'Dilema ético', paso1Id: 'dilema-etico' },
      { id: 'soc-con', label: 'Definir un concepto', paso1Id: 'definir-concepto' },
    ],
  },
  argumento: {
    etiquetaSeccion: 'Defender postura en:',
    botones: [
      { id: 'arg-esc', label: 'Debate escolar', paso1Id: 'arg-escolar' },
      { id: 'arg-soc', label: 'Debate en Colombia', paso1Id: 'arg-sociedad' },
      { id: 'arg-tes', label: 'Tesis de ensayo', paso1Id: 'arg-ensayo' },
    ],
  },
};

export const ModosGrid: React.FC<ModosGridProps> = ({
  onSelectModo,
  estudiante = '',
  mostrarGamificacion = false,
}) => {
  const { estado: progreso } = useGamificacion(estudiante);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaModo>('todos');

  const modeIcons: Record<string, React.ElementType> = {
    socratico: MessageSquareQuote,
    explorar: Search,
    argumento: Scale,
    verificar: CheckCircle2,
    auditar: Cpu,
    escrito: FileText,
    tutor: Sigma,
    icfes: GraduationCap,
  };

  const recompensasModo: Record<string, string> = {
    socratico: '+1 estrella por argumento',
    tutor: '+2 estrellas con apuntes de clase',
    icfes: '+2 estrellas por acierto',
    explorar: '+1 estrella por contrastar posturas',
    argumento: '+2 estrellas por defender tu tesis',
    verificar: '+3 estrellas al comprobar fuentes',
    auditar: '+3 estrellas por detectar fallos',
    escrito: '+2 estrellas al revisar borrador',
  };

  const todosLosModos = ['tutor', 'icfes', 'explorar', 'escrito', 'verificar', 'auditar', 'socratico', 'argumento'];
  const configCategoria = CATEGORIAS_MODOS.find((c) => c.id === categoriaActiva) || CATEGORIAS_MODOS[0];
  const modeKeysVisibles = configCategoria.modos;

  const entrarConRutaPreseleccionada = (
    e: React.MouseEvent,
    modoKey: string,
    subBoton: SubBotonTarjeta
  ) => {
    e.stopPropagation();
    try {
      if (modoKey === 'icfes' && subBoton.areaIcfes) {
        sessionStorage.setItem('interlocutor-icfes-area-inicial', subBoton.areaIcfes);
      } else {
        sessionStorage.setItem(
          'interlocutor-ruta-inicial',
          JSON.stringify({
            modo: modoKey,
            paso1Id: subBoton.paso1Id,
            paso2Id: subBoton.paso2Id,
          })
        );
      }
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
    onSelectModo(modoKey);
  };

  return (
    <div className="vista-entrada w-full max-w-[820px] mx-auto px-4 sm:px-6 pt-6 pb-28 sm:py-9 flex flex-col">
      {/* Encabezado */}
      <div className="w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
        <div>
          <h1 className="font-literata text-[30px] font-semibold text-[var(--color-texto)] leading-tight">
            Modos de estudio
          </h1>
          <p className="text-[16px] text-[var(--color-secundario)] mt-1">
            Elige una estación para trabajar o entra directamente a un subtema.
          </p>
        </div>
        <span className="text-[14px] text-[var(--color-secundario)] tabular-nums shrink-0">
          {progreso.modosExplorados.length} de {todosLosModos.length} explorados
        </span>
      </div>

      {mostrarGamificacion && (
        <PanelGamificacion estudiante={estudiante} onSelectModo={onSelectModo} />
      )}

      {/* Filtros por categoría en pastillas */}
      <div
        role="tablist"
        aria-label="Filtrar modos por categoría"
        className="flex flex-wrap gap-2 mb-6"
      >
        {CATEGORIAS_MODOS.map((cat) => {
          const activa = categoriaActiva === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`min-h-[44px] px-4 py-2 rounded-full text-[14px] transition-colors cursor-pointer ${
                activa
                  ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold sombra-boton-acento'
                  : 'bg-[var(--color-superficie)] border border-[var(--color-separador)] text-[var(--color-secundario)] hover:text-[var(--color-texto)]'
              }`}
            >
              {cat.titulo}
            </button>
          );
        })}
      </div>

      {/* Cuadrícula de 2 columnas (1 en < 360px) de mosaicos */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 w-full items-stretch">
        {modeKeysVisibles.map((key) => {
          const modo = AGENTE.modos[key] as ModoConfig;
          if (!modo) return null;
          const Icon = modeIcons[key] || MessageSquareQuote;
          const explorado = progreso.modosExplorados.includes(key);
          const subConfig = SUB_BOTONES_POR_MODO[key];

          return (
            <div
              key={key}
              onClick={() => onSelectModo(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectModo(key);
                }
              }}
              className="mosaico-estudio hover:border-[var(--color-acento)] text-left cursor-pointer h-full justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--color-acento-suave)] text-[var(--color-acento)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <span className="text-[13px] text-[var(--color-secundario)]">
                    {modo.busqueda && modo.adjuntos
                      ? 'Búsqueda web y archivos'
                      : modo.busqueda
                      ? 'Con búsqueda web'
                      : modo.adjuntos
                      ? 'Acepta archivos'
                      : 'Diálogo guiado'}
                  </span>
                </div>

                {/* Nombre en Literata */}
                <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)] leading-snug">
                  {modo.titulo}
                </h2>

                {/* Descripción con line-clamp-2, nunca truncada a 1 línea */}
                <p className="text-[15px] text-[var(--color-secundario)] mt-1.5 leading-relaxed line-clamp-2">
                  {modo.descripcion}
                </p>

                {/* Accesos rápidos a subtemas */}
                {subConfig && (
                  <div className="mt-4 pt-3 border-t border-[var(--color-separador)]">
                    <span className="block text-[13px] text-[var(--color-secundario)] mb-2">
                      {subConfig.etiquetaSeccion}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {subConfig.botones.map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={(e) => entrarConRutaPreseleccionada(e, key, btn)}
                          className="min-h-[36px] text-[13px] px-3 py-1 rounded-full bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-texto)] hover:border-[var(--color-acento)] hover:bg-[var(--color-acento-suave)] transition-colors"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-separador)] flex items-center justify-between gap-2 text-[13px]">
                <span className="text-[var(--color-oro)] font-bold">
                  {recompensasModo[key] || '+1 estrella por participar'}
                </span>
                <span className="font-bold text-[var(--color-acento)] shrink-0">
                  {explorado ? 'Continuar' : 'Abrir modo'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
