// KV Store desabilitado
// O TranspJardim usa localStorage no frontend

export async function get(key: string) {
  return null;
}

export async function set(key: string, value: any) {
  return true;
}

export async function del(key: string) {
  return true;
}
