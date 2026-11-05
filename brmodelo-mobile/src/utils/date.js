/**
 * Utilitários de Data e Hora para o BRMM
 * Utiliza o formato ISO 8601 (UTC) para consistência no SQLite.
 */

/**
 * Retorna a data e hora atual em formato ISO 8601 UTC.
 * @returns {string} Exemplo: '2026-10-30T17:00:00.000Z'
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Formata um timestamp ISO 8601 para exibição amigável ao usuário.
 * @param {string} isoString
 * @returns {string} Exemplo: '30/10/2026 14:00'
 */
export function formatDisplayDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
