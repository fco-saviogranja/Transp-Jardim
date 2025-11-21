// Edge Function desabilitada
// O TranspJardim funciona 100% no frontend
// Este arquivo está vazio intencionalmente

export default {
  fetch() {
    return new Response('Edge Function desabilitada. Sistema funciona no frontend.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
