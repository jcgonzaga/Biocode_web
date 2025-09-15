import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ message: 'Nombre y email son requeridos.' }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ name, email }]);

    if (error) {
      console.error('Supabase error:', error);
      // Check for unique constraint violation
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ message: 'Este email ya está subscrito.' }),
          { status: 409 } // 409 Conflict
        );
      }
      return new Response(
        JSON.stringify({ message: 'Error en la subscripción.' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: '¡Subscripción exitosa!' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor.' }),
      { status: 500 }
    );
  }
};
