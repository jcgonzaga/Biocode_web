import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, redirect }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Token no proporcionado.', { status: 400 });
    }

    // Find the pending subscriber
    const { data: pendingSubscriber, error: findError } = await supabase
      .from('pending_subscribers')
      .select('name, email')
      .eq('verification_token', token)
      .single();

    if (findError || !pendingSubscriber) {
      return new Response('Token inválido o expirado.', { status: 400 });
    }

    // Add to the final subscribers table
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({ name: pendingSubscriber.name, email: pendingSubscriber.email });

    if (insertError) {
        // Handle case where user might have been added in the meantime
        if (insertError.code === '23505') {
            console.warn('User already exists in subscribers table, but was verified again.');
        } else {
            console.error('Error inserting subscriber:', insertError);
            return new Response('Error al confirmar la subscripción.', { status: 500 });
        }
    }

    // Delete from pending_subscribers
    const { error: deleteError } = await supabase
      .from('pending_subscribers')
      .delete()
      .eq('verification_token', token);

    if (deleteError) {
        console.error('Error deleting pending subscriber:', deleteError);
        // Don't block the user for this, but log it.
    }

    return redirect('/thank-you');

  } catch (error) {
    console.error('Server error:', error);
    return new Response('Error interno del servidor.', { status: 500 });
  }
};
