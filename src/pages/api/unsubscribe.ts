
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const token = formData.get('token');

    if (!token) {
      return new Response('Token no proporcionado.', { status: 400 });
    }

    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('unsubscribe_token', token.toString());

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Error al cancelar la subscripción.', { status: 500 });
    }

    return redirect('/unsubscribed');

  } catch (error) {
    console.error('Server error:', error);
    return new Response('Error interno del servidor.', { status: 500 });
  }
};
