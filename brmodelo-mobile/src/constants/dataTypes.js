/**
 * Tipos de Dados Suportados para Atributos no BRMM
 * Validados tanto na camada de aplicação quanto no banco SQLite via restrição CHECK.
 */
export const DATA_TYPES = [
  { label: 'INTEGER (Inteiro)', value: 'INTEGER' },
  { label: 'VARCHAR (Texto com tamanho)', value: 'VARCHAR' },
  { label: 'TEXT (Texto longo)', value: 'TEXT' },
  { label: 'REAL (Ponto flutuante)', value: 'REAL' },
  { label: 'DECIMAL (Decimal exato)', value: 'DECIMAL' },
  { label: 'BOOLEAN (Booleano 0/1)', value: 'BOOLEAN' },
  { label: 'DATE (Data AAAA-MM-DD)', value: 'DATE' },
  { label: 'DATETIME (Data e Hora)', value: 'DATETIME' },
];

export const VALID_DATA_TYPE_VALUES = DATA_TYPES.map((t) => t.value);

export const DEFAULT_DATA_TYPE = 'VARCHAR';

/**
 * Verifica se um tipo de dado é válido.
 * @param {string} type
 * @returns {boolean}
 */
export function isValidDataType(type) {
  if (!type || typeof type !== 'string') return false;
  return VALID_DATA_TYPE_VALUES.includes(type.trim().toUpperCase());
}
